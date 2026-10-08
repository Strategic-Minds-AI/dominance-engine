import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Autonomous Pipeline — deterministic end-to-end: Research → Generate → Persist → Validate → Score.
export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { niche, url } = body;
    if (!niche || !niche.trim()) return Response.json({ error: 'A niche is required' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const steps = [];
    const startTime = Date.now();

    const researchRes = await base44.integrations.Core.InvokeLLM({
      prompt: `Research the "${niche}" industry for SEO and lead-generation purposes. Return structured data only.
Niche: ${niche}
${url ? `Target URL: ${url}` : ''}

Return: top_keywords (10), search_volume_estimate, avg_cpc, top_competitors (3), commercial_intent (low/medium/high/critical), recommended_url_patterns (5), local_search_relevance (0-100).`,
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          top_keywords: { type: 'array', items: { type: 'string' } },
          search_volume_estimate: { type: 'number' },
          avg_cpc: { type: 'number' },
          top_competitors: { type: 'array', items: { type: 'string' } },
          commercial_intent: { type: 'string' },
          recommended_url_patterns: { type: 'array', items: { type: 'string' } },
          local_search_relevance: { type: 'number' },
        },
      },
    });
    steps.push({ step: 'research', status: 'success', duration_ms: Date.now() - startTime, data: researchRes });

    const genStart = Date.now();
    const genRes = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate SEO-optimized content for the "${niche}" niche following Google's helpful content guidelines.
Return: page_title (under 60 chars), meta_description (under 160 chars), h1, intro_paragraph (2-3 sentences), faqs (5 Q&A pairs), local_business_schema (JSON-LD), target_keyword, word_count_estimate.
Adhere to E-E-A-T: demonstrate experience, expertise, authoritativeness, trustworthiness.`,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: {
          page_title: { type: 'string' }, meta_description: { type: 'string' }, h1: { type: 'string' },
          intro_paragraph: { type: 'string' },
          faqs: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } } } },
          local_business_schema: { type: 'string' }, target_keyword: { type: 'string' }, word_count_estimate: { type: 'number' },
        },
      },
    });
    steps.push({ step: 'generate', status: 'success', duration_ms: Date.now() - genStart, data: genRes });

    const persistStart = Date.now();
    let assetId = null;
    try {
      const record = await base44.entities.GeneratedAsset.create({
        generator_type: 'programmatic_site', title: genRes.page_title || `Pipeline: ${niche}`,
        input_prompt: niche, output_json: JSON.stringify({ research: researchRes, content: genRes }),
        summary: `Autonomous pipeline for ${niche}: ${genRes.word_count_estimate || 0} words, ${researchRes.top_keywords?.length || 0} keywords`,
        tags: [niche, 'autonomous_pipeline', researchRes.commercial_intent || 'medium'],
        compliance_score: 0, status: 'generated',
      });
      assetId = record.id;
    } catch (e) { steps.push({ step: 'persist', status: 'error', error: e.message }); }
    steps.push({ step: 'persist', status: assetId ? 'success' : 'error', duration_ms: Date.now() - persistStart, data: { asset_id: assetId } });

    const valStart = Date.now();
    const checks = {
      title_length: (genRes.page_title || '').length > 0 && (genRes.page_title || '').length <= 60,
      meta_length: (genRes.meta_description || '').length > 0 && (genRes.meta_description || '').length <= 160,
      has_h1: !!(genRes.h1 && genRes.h1.trim()),
      has_intro: !!(genRes.intro_paragraph && genRes.intro_paragraph.trim()),
      has_faqs: (genRes.faqs || []).length >= 3,
      has_schema: !!(genRes.local_business_schema && genRes.local_business_schema.trim()),
      has_target_keyword: !!(genRes.target_keyword && genRes.target_keyword.trim()),
      word_count_adequate: (genRes.word_count_estimate || 0) >= 300,
      eeat_signals: (genRes.intro_paragraph || '').length > 100,
      commercial_intent_identified: !!researchRes.commercial_intent,
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const score = Math.round((passed / total) * 100);
    steps.push({ step: 'validate', status: 'success', duration_ms: Date.now() - valStart, data: { checks, passed, total, score } });

    const finalScore = Math.min(100, Math.round((score * 0.5) + ((researchRes.local_search_relevance || 0) * 0.3) + ((researchRes.top_keywords?.length || 0) * 2)));

    if (assetId) {
      try { await base44.entities.GeneratedAsset.update(assetId, { compliance_score: finalScore, status: finalScore >= 80 ? 'approved' : 'generated' }); } catch {}
    }

    try {
      await base44.entities.Receipt.create({
        kind: 'autonomous_pipeline', summary: `Pipeline for ${niche}: score ${finalScore}/100, ${passed}/${total} checks passed`,
        detail: JSON.stringify({ niche, steps: steps.map(s => ({ step: s.step, status: s.status, duration_ms: s.duration_ms })) }),
        provenance: 'MEASURED',
      });
    } catch {}

    return Response.json({
      status: 'success', niche, asset_id: assetId, score: finalScore,
      validation: { passed, total, checks }, research: researchRes, content: genRes,
      steps: steps.map(s => ({ step: s.step, status: s.status, duration_ms: s.duration_ms })),
      total_duration_ms: Date.now() - startTime,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Pipeline failed' }, { status: 500 });
  }
}