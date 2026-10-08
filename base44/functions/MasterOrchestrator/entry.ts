import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import {
  ALL_PHASES, cycleId, chunk, withRetry, safeInvoke,
  writeReceipt, writeTelemetry, sleep,
  FIX_BATCH_SIZE, SUGGEST_BATCH_SIZE, IMPLEMENT_BATCH_SIZE,
} from '../../shared/orchestration.js';

// MasterOrchestrator — The deterministic, batched, resumable conductor.
export default async function (req: Request): Promise<Response> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const runCycleId = body.cycle_id || cycleId();
    const phases: string[] = body.phases || ALL_PHASES;
    const clientId = body.client_id || null;
    const fixBatchSize = Math.min(Number(body.fix_batch_size) || FIX_BATCH_SIZE, 10);

    console.log(`[MasterOrchestrator] Starting cycle ${runCycleId}, phases: [${phases.join(', ')}]`);

    const phaseResults: PhaseResult[] = [];

    if (phases.includes('sync')) {
      const r = await runPhase('sync', async () => {
        const res = await safeInvoke(svc, 'SyncSearchConsole', { action: 'sync', limit: 100, client_id: clientId });
        return res.ok ? { synced: res.data?.synced ?? 'ok' } : { error: res.error };
      });
      phaseResults.push(r);
    }

    if (phases.includes('reflect')) {
      const r = await runPhase('reflect', async () => {
        const res = await safeInvoke(svc, 'AreReflect', { cycle_id: runCycleId, client_id: clientId });
        return res.ok ? { summary: res.data?.summary || 'ok' } : { error: res.error };
      });
      phaseResults.push(r);
    }

    if (phases.includes('detect')) {
      const r = await runPhase('detect', async () => {
        const res = await safeInvoke(svc, 'DetectAsymmetries', {});
        return res.ok ? { detected: res.data?.detected ?? 0 } : { error: res.error };
      });
      phaseResults.push(r);
    }

    if (phases.includes('suggest')) {
      const r = await runPhase('suggest', async () => {
        const res = await safeInvoke(svc, 'AreSuggest', { cycle_id: runCycleId, client_id: clientId });
        return res.ok ? { created: res.data?.created || [] } : { error: res.error };
      });
      phaseResults.push(r);
    }

    if (phases.includes('implement')) {
      const r = await runPhase('implement', async () => {
        const res = await safeInvoke(svc, 'AreImplement', { cycle_id: runCycleId, client_id: clientId, batch_size: IMPLEMENT_BATCH_SIZE });
        return res.ok ? { results: res.data?.results || [] } : { error: res.error };
      });
      phaseResults.push(r);
    }

    if (phases.includes('fix')) {
      const r = await runPhase('fix', async () => {
        const blockedRows = await svc.entities.AreSheetRow.filter({ status: 'blocked' }, '-priority_score', 50).catch(() => []);
        const openWithGaps = await svc.entities.AreSheetRow.filter({ status: 'open' }, '-priority_score', 50).catch(() => []);
        const toFix = [...blockedRows, ...openWithGaps].slice(0, fixBatchSize * 2);
        if (toFix.length === 0) return { fixed: 0, detail: 'No rows need fixing' };

        const batches = chunk(toFix, fixBatchSize);
        let fixed = 0, errors = 0;
        const errorDetails: string[] = [];

        for (const batch of batches) {
          for (const row of batch) {
            const res = await safeInvoke(svc, 'FixEngine', { url: row.url, gap_id: null, gap_type: row.gap_type || 'SEO', max_attempts: 3 });
            if (res.ok) fixed++; else { errors++; errorDetails.push(`${row.url}: ${res.error}`); }
          }
          await sleep(500);
        }
        return { fixed, errors, error_details: errorDetails.slice(0, 5) };
      });
      phaseResults.push(r);
    }

    if (phases.includes('validate')) {
      const r = await runPhase('validate', async () => {
        const res = await safeInvoke(svc, 'ValidateSystem', {});
        return res.ok ? { results: res.data?.results || [] } : { error: res.error };
      });
      phaseResults.push(r);
    }

    let deliveryReport = null;
    if (phases.includes('deliver')) {
      const r = await runPhase('deliver', async () => {
        const res = await safeInvoke(svc, 'DeliveryGuarantee', {});
        if (res.ok) { deliveryReport = res.data; return { scorecard: res.data?.scorecard || [] }; }
        return { error: res.error };
      });
      phaseResults.push(r);
    }

    const durationMs = Date.now() - startTime;
    const okCount = phaseResults.filter((p) => p.status === 'ok').length;
    const errorCount = phaseResults.filter((p) => p.status === 'error').length;

    await writeTelemetry(svc, {
      runType: 'master_orchestrator', subsystem: 'orchestration',
      status: errorCount === 0 ? 'ok' : errorCount === phaseResults.length ? 'error' : 'degraded',
      startedAt, durationMs, recordsWritten: okCount,
      message: `Cycle ${runCycleId}: ${okCount}/${phaseResults.length} phases ok, ${errorCount} errors`,
    });

    await writeReceipt(svc, {
      kind: 'validation', summary: `MasterOrchestrator cycle ${runCycleId}: ${okCount}/${phaseResults.length} phases completed`,
      detail: JSON.stringify({ cycle_id: runCycleId, phases: phaseResults, delivery_score: deliveryReport?.delivery_score ?? null }, null, 2),
      source: 'MasterOrchestrator', provenance: 'MEASURED',
    });

    return Response.json({ ok: true, cycle_id: runCycleId, duration_ms: durationMs, phases: phaseResults, delivery_report: deliveryReport });
  } catch (error) {
    return Response.json({ error: error.message, ok: false }, { status: 500 });
  }
}

async function runPhase(phase: string, fn: () => Promise<any>): Promise<PhaseResult> {
  const phaseStart = Date.now();
  try {
    const result = await fn();
    return { phase, status: 'ok', detail: result, duration_ms: Date.now() - phaseStart };
  } catch (e) {
    return { phase, status: 'error', detail: { error: e.message }, duration_ms: Date.now() - phaseStart };
  }
}

interface PhaseResult { phase: string; status: 'ok' | 'error'; detail: any; duration_ms: number; }