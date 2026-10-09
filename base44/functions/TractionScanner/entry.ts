import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Traction scanner: given a URL or industry, uses web research to find high-opportunity keywords.
import { gatewayLLM } from "../../shared/vercelGateway.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const { url, industry, market } = body;
    if (!url && !industry) return Response.json({ error: 'url or industry required' }, { status: 400 });

    const prompt = [
      'You are a keyword + traction discovery engine. Given a URL or industry, scan real search demand to find the FASTEST paths to organic traction.',
      `Target: ${url ? `URL ${url}` : ''} ${industry ? `industry: ${industry}` : ''} market: ${market || 'US'}.`,
      'Return a ranked list of opportunities. Prioritize: trending keywords, low-competition long-tail, question queries, local modifiers, adjacent semantic phrases.',
      'For each: keyword, type, trend, competition, difficulty (0-100), opportunity_score (0-100), intent, rationale.',
      'Return at least 20 keywords, ranked by opportunity_score descending.',
    ].join('\n');

    const res = await gatewayLLM({
      prompt, add_context_from_internet: true, model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          keywords: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                keyword: { type: 'string' }, type: { type: 'string' }, trend: { type: 'string' },
                competition: { type: 'string' }, difficulty: { type: 'number' },
                opportunity_score: { type: 'number' }, intent: { type: 'string' }, rationale: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const allowedType = ['head', 'long_tail', 'question', 'local_modifier', 'underserved', 'trending'];
    const allowedTrend = ['rising', 'stable', 'declining', 'breakout'];
    const allowedComp = ['low', 'medium', 'high'];
    const nowIso = new Date().toISOString();

    const payload = (res.keywords || [])
      .filter((k) => k.keyword)
      .map((k) => ({
        url: url || null, industry: industry || null, market: market || 'US',
        keyword: k.keyword, type: allowedType.includes(k.type) ? k.type : 'long_tail',
        trend: allowedTrend.includes(k.trend) ? k.trend : 'stable',
        competition: allowedComp.includes(k.competition) ? k.competition : 'medium',
        difficulty: Math.max(0, Math.min(100, Number(k.difficulty) || 50)),
        opportunity_score: Math.max(0, Math.min(100, Number(k.opportunity_score) || 50)),
        intent: k.intent || 'informational', rationale: k.rationale || '', scanned_at: nowIso,
      }))
      .sort((a, b) => b.opportunity_score - a.opportunity_score);

    let created = [];
    if (payload.length) created = await svc.entities.TractionKeyword.bulkCreate(payload);

    await svc.entities.Receipt.create({
      kind: 'ingestion', summary: `TractionScanner — ${payload.length} keywords discovered for ${url || industry}`,
      detail: JSON.stringify(payload.slice(0, 20).map((p) => p.keyword)).slice(0, 4000),
      source: 'traction_scanner', provenance: 'INFERRED', occurred_at: nowIso,
    });

    return Response.json({ ok: true, count: payload.length, keywords: payload });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}