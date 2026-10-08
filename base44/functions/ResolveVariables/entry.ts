import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    if (body.cursor !== undefined && (typeof body.cursor !== 'string' || body.cursor.length > 2000)) return Response.json({ error: 'Invalid continuation cursor.' }, { status: 400 });
    const page = await base44.entities.SystemVariable.filter({}, { sort: 'variable_key', limit: 100, ...(body.cursor ? { cursor: body.cursor } : {}) });
    const impactGraph = {};
    const updates = [];
    const blockedVariableKeys = [];
    for (const variable of page.items) {
      const supplied = String(variable.resolved_value ?? '').trim();
      const fallback = String(variable.default_value ?? '').trim();
      const verified = Boolean(supplied && variable.resolved_source && variable.resolved_source !== 'default');
      for (const domain of variable.impact_domains || []) {
        if (!Object.hasOwn(impactGraph, domain)) Object.defineProperty(impactGraph, domain, { value: [], enumerable: true });
        impactGraph[domain].push(variable.variable_key);
      }
      if (variable.requires_approval && !verified) { blockedVariableKeys.push(variable.variable_key); continue; }
      const value = supplied || fallback;
      const patch = { resolved_value: value, resolved_source: verified ? variable.resolved_source : value ? 'default' : '', confidence: verified ? 'high' : value ? 'medium' : 'unknown', is_assumption: !verified };
      if (Object.entries(patch).some(([key, entry]) => variable[key] !== entry)) updates.push({ id: variable.id, ...patch });
    }
    if (updates.length) await base44.entities.SystemVariable.bulkUpdate(updates);
    const [summary, assumptions, scores] = await Promise.all([
      base44.entities.SystemVariable.aggregate({ groupBy: 'confidence' }),
      base44.entities.SystemVariable.count({ is_assumption: true }),
      base44.entities.ValidationScore.filter({ domain: 'Variable registry' }, { limit: 1 }),
    ]);
    const totalVariables = summary.rows.reduce((total, row) => total + row.count, 0);
    const unknown = summary.rows.filter((row) => !row.confidence || row.confidence === 'unknown').reduce((total, row) => total + row.count, 0);
    const resolved = totalVariables - unknown;
    const allResolved = totalVariables > 0 && unknown === 0 && assumptions === 0;
    const evidence = `${resolved}/${totalVariables} values available, ${assumptions} assumptions, ${unknown} unknown. ${blockedVariableKeys.length} protected variables await approval in this batch.`;
    if (scores.items[0]) await base44.entities.ValidationScore.update(scores.items[0].id, { status: allResolved ? 'PASS' : 'PENDING', evidence, earned_score: allResolved ? scores.items[0].weight : 0, last_checked_at: new Date().toISOString() });
    await base44.entities.Receipt.create({ kind: 'validation', summary: `Variable resolution: ${evidence}`, source: 'ResolveVariables', provenance: 'MEASURED', occurred_at: new Date().toISOString() });
    return Response.json({ totalVariables, resolved, assumptions, unknown, impactGraph, allResolved, emptyRegistry: totalVariables === 0, blockedVariableKeys, updated: updates.length, has_more: page.has_more, next_cursor: page.next_cursor || null, impactGraphScope: 'current_batch' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}