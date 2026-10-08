import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// VisionCortexOrchestrator — the master autonomous brain of the SEO Generator.
// This is the ONE function that runs the ENTIRE system from the Prompt Library.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch {}
    if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const cycleId = body.cycle_id || `orch-${Date.now().toString(36)}`;
    const skipPhases = new Set(body.skip_phases || []);
    const now = new Date().toISOString();

    console.log(`[VisionCortexOrchestrator] Starting cycle ${cycleId}`);

    const prompts = await svc.entities.PromptLibrary.filter({ status: 'ready' }, '-impact', 50).catch(() => []);
    console.log(`[VisionCortexOrchestrator] Loaded ${prompts.length} ready prompts from library`);

    const results = {
      cycle_id: cycleId,
      started_at: now,
      phases: {},
      prompts_run: 0,
      prompts_succeeded: 0,
      prompts_failed: 0,
      errors: [],
    };

    async function runPhase(name: string, fnName: string, payload: any = {}) {
      if (skipPhases.has(name)) {
        results.phases[name] = { skipped: true };
        return null;
      }
      console.log(`[VisionCortexOrchestrator] Phase: ${name} → ${fnName}`);
      try {
        const res = await svc.functions.invoke(fnName, payload);
        const data = res?.data || res;
        results.phases[name] = { function: fnName, ok: true, summary: JSON.stringify(data).slice(0, 500) };
        return data;
      } catch (e) {
        results.phases[name] = { function: fnName, ok: false, error: e.message };
        results.errors.push(`${name}: ${e.message}`);
        console.error(`[VisionCortexOrchestrator] Phase ${name} failed:`, e.message);
        return null;
      }
    }

    await Promise.all([
      runPhase('audit_dna', 'SystemDNA', {}),
      runPhase('audit_brain', 'VisionCortexWatch', {}),
      runPhase('reflect', 'SystemSelfReflection', { cycle_id: cycleId }),
    ]);

    await Promise.all([
      runPhase('discover_capabilities', 'DiscoverCapabilities', {}),
      runPhase('discover_methods', 'GenerateRankingMethods', {}),
    ]);

    await runPhase('suggest', 'AreSuggest', {});

    await Promise.all([
      runPhase('implement_capabilities', 'AutonomousSystemImplementer', { cycle_id: cycleId }),
      runPhase('implement_treatments', 'AreImplement', {}),
    ]);

    await Promise.all([
      runPhase('validate', 'ValidateSystem', {}),
      runPhase('heal', 'FixEngine', {}),
    ]);

    if (!skipPhases.has('converge')) {
      results.phases.converge = { skipped: true, reason: 'handled by Non-Stop Convergence Loop workflow' };
    }

    for (const p of prompts) {
      if (!p.invoke_function) continue;
      console.log(`[VisionCortexOrchestrator] Running prompt: ${p.title} → ${p.invoke_function}`);
      try {
        await svc.functions.invoke(p.invoke_function, {});
        results.prompts_run++;
        results.prompts_succeeded++;
        await svc.entities.PromptLibrary.update(p.id, { status: 'run', last_run_at: now });
      } catch (e) {
        results.prompts_run++;
        results.prompts_failed++;
        results.errors.push(`prompt "${p.title}": ${e.message}`);
      }
    }

    const phaseCount = Object.keys(results.phases).length;
    const successCount = Object.values(results.phases).filter((p: any) => p.ok).length;
    const overallOk = results.errors.length === 0;

    await svc.entities.RunTelemetry.create({
      run_type: 'vision_cortex_orchestrator',
      subsystem: 'orchestration',
      status: overallOk ? 'ok' : 'degraded',
      started_at: now,
      records_written: phaseCount + results.prompts_run,
      message: `Orchestrator cycle ${cycleId}: ${successCount}/${phaseCount} phases ok, ${results.prompts_run} prompts run`,
    });

    await svc.entities.Receipt.create({
      kind: 'validation',
      summary: `VisionCortexOrchestrator cycle ${cycleId}: ${successCount}/${phaseCount} phases succeeded, ${results.prompts_run} prompts executed`,
      detail: JSON.stringify(results, null, 2).slice(0, 8000),
      source: 'vision_cortex_orchestrator',
      provenance: 'MEASURED',
      occurred_at: now,
    });

    return Response.json({
      ok: true,
      cycle_id: cycleId,
      phases_run: phaseCount,
      phases_succeeded: successCount,
      prompts_run: results.prompts_run,
      prompts_succeeded: results.prompts_succeeded,
      prompts_failed: results.prompts_failed,
      errors: results.errors,
      phases: results.phases,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}