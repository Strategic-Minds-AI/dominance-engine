import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Autonomous Convergence Engine — the non-stop loop that runs until every
// managed URL reaches top-5.

const TARGET_RANK_DEFAULT = 5;
const MAX_ITERATIONS_DEFAULT = 10;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch {}
    if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const maxIterations = body.max_iterations || MAX_ITERATIONS_DEFAULT;
    const targetRank = body.target_rank || TARGET_RANK_DEFAULT;
    const runId = body.run_id || `conv-${Date.now().toString(36)}`;

    console.log(`[AutonomousConvergence] Starting run ${runId}, target rank ${targetRank}, max ${maxIterations} iterations`);

    const [sheetRows, suggestions, gaps, reflections, methods, capabilities, telemetry] = await Promise.all([
      svc.entities.AreSheetRow.list('-updated_date', 200).catch(() => []),
      svc.entities.Suggestion.filter({ status: 'new' }, '-priority_score', 50).catch(() => []),
      svc.entities.SystemGap.filter({ status: 'logged' }, '-logged_at', 30).catch(() => []),
      svc.entities.ReflectionRecord.list('-occurred_at', 30).catch(() => []),
      svc.entities.RankingMethod.filter({ status: 'validated' }, '-proof_level', 50).catch(() => []),
      svc.entities.Capability.list('-impact_score', 100).catch(() => []),
      svc.entities.RunTelemetry.list('-started_at', 10).catch(() => []),
    ]);

    const proofLog = [];
    let converged = false;
    let iteration = 0;

    for (iteration = 1; iteration <= maxIterations; iteration++) {
      console.log(`[AutonomousConvergence] Iteration ${iteration}/${maxIterations}`);

      const totalUrls = sheetRows.length;
      const topRankUrls = sheetRows.filter((r) => (r.avg_position || 999) <= targetRank).length;
      const blockedRows = sheetRows.filter((r) => r.status === 'blocked').length;
      const openRows = sheetRows.filter((r) => r.status === 'open').length;
      const convergencePct = totalUrls > 0 ? Math.round((topRankUrls / totalUrls) * 100) : 0;

      if (convergencePct >= 100) {
        converged = true;
        proofLog.push({ iteration, phase: 'converged', action: `All ${totalUrls} URLs have reached top-${targetRank}.`, status: 'converged', convergence_pct: 100, timestamp: new Date().toISOString() });
        break;
      }

      let action = null, phase = 'assess', functionInvoked = null, functionPayload = null;

      if (blockedRows > 0) {
        const blocked = sheetRows.filter((r) => r.status === 'blocked').slice(0, 3);
        phase = 'unblock';
        action = `Unblocking ${blocked.length} rows with binding constraints`;
        functionInvoked = '__fix_batch__';
        functionPayload = { urls: blocked.map((r) => r.url) };
      } else if (openRows > 0) {
        const open = sheetRows.filter((r) => r.status === 'open').sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0)).slice(0, 5);
        phase = 'deploy';
        action = `Deploying treatments for ${open.length} high-priority open rows`;
        functionInvoked = 'AreImplement';
        functionPayload = { batch_size: Math.min(open.length, 10) };
      } else if (suggestions.length < 10) {
        phase = 'suggest';
        action = `Generating new suggestions (only ${suggestions.length} pending)`;
        functionInvoked = 'AreSuggest';
        functionPayload = {};
      } else if (gaps.length > 0) {
        phase = 'system_gap';
        action = `Addressing system gap: ${gaps[0].gap?.slice(0, 100)}`;
        functionInvoked = 'VisionCortexWatch';
        functionPayload = {};
      } else {
        phase = 'reflect';
        action = `Running reflection to measure outcomes`;
        functionInvoked = 'AreReflect';
        functionPayload = {};
      }

      let functionResult = null, deployError = null;
      if (functionInvoked === '__fix_batch__') {
        const urls: string[] = functionPayload.urls || [];
        const fixResults: any[] = [];
        for (const url of urls) {
          try { const res = await svc.functions.invoke('FixEngine', { url, max_attempts: 3 }); fixResults.push({ url, ok: true, data: res?.data || res }); }
          catch (e) { fixResults.push({ url, ok: false, error: e.message }); if (!deployError) deployError = e.message; }
        }
        functionResult = { fixed: fixResults.filter((r) => r.ok).length, errors: fixResults.filter((r) => !r.ok).length };
      } else if (functionInvoked) {
        try { const res = await svc.functions.invoke(functionInvoked, functionPayload); functionResult = res?.data || res; }
        catch (e) { deployError = e.message; }
      }

      const afterSheetRows = await svc.entities.AreSheetRow.list('-updated_date', 200).catch(() => []);
      const afterTopRank = afterSheetRows.filter((r) => (r.avg_position || 999) <= targetRank).length;
      const afterConvergencePct = afterSheetRows.length > 0 ? Math.round((afterTopRank / afterSheetRows.length) * 100) : 0;

      const proofEntry = {
        run_id: runId, iteration, phase, action_taken: action, function_invoked: functionInvoked,
        function_payload: functionPayload, function_result: functionResult ? JSON.stringify(functionResult).slice(0, 500) : null,
        error_message: deployError, before_score: convergencePct, after_score: afterConvergencePct,
        score_delta: afterConvergencePct - convergencePct, status: deployError ? 'error' : 'ok',
        convergence_pct: afterConvergencePct, top_rank_urls: afterTopRank, total_urls: afterSheetRows.length,
        blocked: afterSheetRows.filter((r) => r.status === 'blocked').length,
        open: afterSheetRows.filter((r) => r.status === 'open').length,
        timestamp: new Date().toISOString(),
      };
      proofLog.push(proofEntry);

      console.log(`[AutonomousConvergence] Iteration ${iteration}: ${phase} → convergence ${afterConvergencePct}%`);

      if (afterConvergencePct >= 100) { converged = true; break; }
      sheetRows.length = 0; sheetRows.push(...afterSheetRows);
    }

    const finalAssessment = {
      run_id: runId, iterations_run: iteration, converged,
      final_convergence_pct: proofLog.length > 0 ? proofLog[proofLog.length - 1].convergence_pct : 0,
      final_top_rank_urls: proofLog.length > 0 ? proofLog[proofLog.length - 1].top_rank_urls : 0,
      total_urls: proofLog.length > 0 ? proofLog[proofLog.length - 1].total_urls : 0,
    };

    await svc.entities.RunTelemetry.create({
      run_type: 'autonomous_convergence', subsystem: 'orchestration',
      status: converged ? 'ok' : 'running', started_at: new Date().toISOString(),
      records_written: proofLog.length,
      message: `Convergence ${finalAssessment.final_convergence_pct}% — ${finalAssessment.final_top_rank_urls}/${finalAssessment.total_urls} URLs at target`,
    });

    await svc.entities.Receipt.create({
      kind: 'validation',
      summary: `Autonomous Convergence run ${runId}: ${iteration} iterations, ${finalAssessment.final_convergence_pct}% converged`,
      detail: JSON.stringify(finalAssessment, null, 2).slice(0, 8000),
      source: 'autonomous_convergence', provenance: 'MEASURED', occurred_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, run_id: runId, iterations: iteration, converged, ...finalAssessment, proof_log: proofLog });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}