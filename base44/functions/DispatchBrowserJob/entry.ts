import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// DispatchBrowserJob — bridges the Base44 control plane to the CloudBrowser engine on Railway.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const now = new Date().toISOString();

    const engineUrl = (process.env.CLOUDBROWSER_ENGINE_URL || process.env.BROWSER_ENGINE_URL || '').replace(/\/$/, '');
    const apiKey = process.env.ENGINE_API_KEY || process.env.CLOUDBROWSER_API_KEY;

    if (!engineUrl || !apiKey) {
      return Response.json({ error: 'Browser engine not configured — set CLOUDBROWSER_ENGINE_URL and CLOUDBROWSER_API_KEY secrets' }, { status: 500 });
    }

    if (body.mode === 'process_queue') {
      const limit = Math.min(body.limit || 5, 10);
      const jobs = await svc.entities.AgentJob.filter({ kind: 'browser_job', status: 'queued' }, '-created_date', limit);
      if (!jobs.length) return Response.json({ mode: 'process_queue', processed: 0, message: 'No queued browser jobs' });

      const results = [];
      for (const job of jobs) {
        let spec = null;
        try { spec = JSON.parse(job.payload || '{}'); } catch {}
        if (!spec || !spec.url) {
          await svc.entities.AgentJob.update(job.id, { status: 'failed', result: 'Invalid or missing payload', completed_at: now });
          results.push({ job_id: job.id, status: 'failed', error: 'invalid payload' });
          continue;
        }
        const res = await dispatchSingle(engineUrl, apiKey, spec);
        await svc.entities.AgentJob.update(job.id, { status: res.ok ? 'completed' : 'failed', result: JSON.stringify(res).slice(0, 5000), completed_at: now });
        results.push({ job_id: job.id, status: res.ok ? 'completed' : 'failed', url: spec.url });
      }

      await svc.entities.Receipt.create({
        kind: 'browser_queue', summary: `Browser job queue: ${results.filter(r => r.status === 'completed').length}/${results.length} completed`,
        detail: results.map(r => `${r.job_id}: ${r.status}`).join('; '), source: 'DispatchBrowserJob', provenance: 'MEASURED', occurred_at: now
      });
      return Response.json({ mode: 'process_queue', processed: results.length, results });
    }

    const { url, actions = [], extract_schema, session_options, agent_job_id } = body;
    if (!url) return Response.json({ error: 'url is required' }, { status: 400 });

    if (agent_job_id) await svc.entities.AgentJob.update(agent_job_id, { status: 'running', queued_at: now });

    const result = await dispatchSingle(engineUrl, apiKey, { url, actions, extract_schema, session_options });

    if (agent_job_id) await svc.entities.AgentJob.update(agent_job_id, { status: result.ok ? 'completed' : 'failed', result: JSON.stringify(result).slice(0, 5000), completed_at: now });

    await svc.entities.Receipt.create({
      kind: 'browser_job', summary: `Browser job ${result.ok ? 'completed' : 'failed'}: ${url}`,
      detail: `${actions.length} actions, extracted: ${!!extract_schema}`, source: 'DispatchBrowserJob', provenance: 'MEASURED', occurred_at: now
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function dispatchSingle(engineUrl: string, apiKey: string, spec: any): Promise<any> {
  const { url, actions = [], extract_schema, session_options = {} } = spec;
  const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey };

  const sessRes = await fetch(`${engineUrl}/sessions`, { method: 'POST', headers, body: JSON.stringify(session_options) });
  if (!sessRes.ok) {
    const err = await sessRes.text().catch(() => 'unknown');
    return { ok: false, url, error: `Session creation failed (${sessRes.status}): ${err.slice(0, 200)}` };
  }
  const session = await sessRes.json();
  const sessionId = session.sessionId || session.id || session.session_id;

  try {
    await fetch(`${engineUrl}/sessions/${sessionId}/execute`, { method: 'POST', headers, body: JSON.stringify({ action_type: 'goto', value: url }) });

    const actionResults = [];
    for (const action of actions) {
      const actRes = await fetch(`${engineUrl}/sessions/${sessionId}/execute`, { method: 'POST', headers, body: JSON.stringify(action) });
      const actData = await actRes.json().catch(() => ({}));
      actionResults.push(actData);
    }

    let extracted = null;
    if (extract_schema) {
      const extRes = await fetch(`${engineUrl}/sessions/${sessionId}/execute`, { method: 'POST', headers, body: JSON.stringify({ action_type: 'ai_extract', value: extract_schema }) });
      extracted = await extRes.json().catch(() => null);
    }

    return { ok: true, url, session_id: sessionId, actions_executed: actions.length, action_results: actionResults, extracted, completed_at: new Date().toISOString() };
  } catch (err) {
    return { ok: false, url, session_id: sessionId, error: err.message };
  } finally {
    await fetch(`${engineUrl}/sessions/${sessionId}`, { method: 'DELETE', headers: { 'x-api-key': apiKey } }).catch(() => {});
  }
}