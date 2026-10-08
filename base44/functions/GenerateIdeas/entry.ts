import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const FRAMEWORKS = {
  first_principles: { name: 'First Principles', directive: `Break the problem down to its most fundamental truths. Strip away all assumptions. Rebuild from foundational truths alone.` },
  scamper: { name: 'SCAMPER', directive: `Apply each SCAMPER technique: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse.` },
  cross_industry: { name: 'Cross-Industry Innovation', directive: `Identify a completely unrelated industry that solved an analogous problem. Borrow their mechanism.` },
  trend_surfing: { name: 'Trend Surfing', directive: `Identify 2-3 emerging trends that are accelerating. Build an idea that rides each wave.` },
  constraint_removal: { name: 'Constraint Removal', directive: `List hard constraints everyone assumes are fixed. Remove each one. What becomes possible?` },
  analogy: { name: 'Analogical', directive: `Find a powerful analogy from nature, history, or a different domain. Use its structure as a template.` },
  inversion: { name: 'Inversion', directive: `Ask: how would this definitively fail? Invert every failure mode into a design principle.` },
  edge_cases: { name: 'Edge Cases', directive: `Find an extreme, underserved user — the edge of the market. Build an idea that serves them obsessively.` },
};

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { seed, industry, count = 10, frameworks = Object.keys(FRAMEWORKS), research = false } = body;

    if (!seed || !seed.trim()) return Response.json({ error: 'A seed prompt is required' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch {}

    const frameworkBlocks = frameworks
      .map((key: string) => { const f = FRAMEWORKS[key]; return f ? `### Framework: ${f.name}\n${f.directive}` : ''; })
      .filter(Boolean).join('\n\n');

    const masterPrompt = `You are an elite ideation AI. Generate exactly ${count} ideas by applying ${frameworks.length} distinct ideation frameworks.

## SEED
"${seed}"

## INDUSTRY CONTEXT
${industry || 'General — apply broadly'}

## YOUR METHODOLOGY
${frameworkBlocks}

## OUTPUT REQUIREMENTS
For each idea produce: title, framework, reasoning_chain, problem, solution, target_audience, monetization, tech_stack, difficulty, market_size, competitive_advantage, automation_potential (0-100), viability_score (0-100), one_liner, next_step.

Rank ideas by viability_score descending.`;

    const llmRes = await base44.integrations.Core.InvokeLLM({
      prompt: masterPrompt, model: research ? 'gemini_3_flash' : 'gpt_5_mini', add_context_from_internet: research,
      response_json_schema: {
        type: 'object',
        properties: {
          ideas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' }, framework: { type: 'string' }, reasoning_chain: { type: 'string' },
                problem: { type: 'string' }, solution: { type: 'string' }, target_audience: { type: 'string' },
                monetization: { type: 'string' }, tech_stack: { type: 'string' }, difficulty: { type: 'string' },
                market_size: { type: 'string' }, competitive_advantage: { type: 'string' },
                automation_potential: { type: 'number' }, viability_score: { type: 'number' },
                one_liner: { type: 'string' }, next_step: { type: 'string' },
              },
            },
          },
          meta: {
            type: 'object',
            properties: {
              frameworks_applied: { type: 'array', items: { type: 'string' } },
              top_themes: { type: 'array', items: { type: 'string' } },
              overall_assessment: { type: 'string' },
            },
          },
        },
      },
    });

    const ideas = (llmRes.ideas || []).sort((a: any, b: any) => (b.viability_score || 0) - (a.viability_score || 0));
    const meta = llmRes.meta || {};

    let asset_id = null;
    try {
      const record = await base44.entities.GeneratedAsset.create({
        generator_type: 'idea', title: `Ideas for: ${seed.slice(0, 60)}`,
        input_prompt: seed, output_json: JSON.stringify({ ideas, meta }),
        summary: `${ideas.length} ideas generated via ${frameworks.length} frameworks${research ? ' (deep research)' : ''}`,
        tags: [industry || 'general', ...frameworks],
      });
      asset_id = record.id;
    } catch {}

    return Response.json({
      status: 'success', ideas, meta,
      frameworks: frameworks.map((k: string) => ({ key: k, name: FRAMEWORKS[k]?.name || k })),
      asset_id, research_mode: research,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}