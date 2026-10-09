/**
 * GPT Mockup Generator — generates 10 unique website mockup designs
 * through the Vercel AI Gateway (paid, NOT Base44 credits).
 *
 * Each mockup is a complete, self-contained HTML page stored as a TemplatePack
 * with kind="mockup" and source="gpt_sync".
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { gatewayPost } from "../../shared/vercelGateway.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { client_id, industry, brand_name, business_stage, city, state } = body;
    if (!client_id) return Response.json({ error: "client_id is required" }, { status: 400 });

    const svc = base44.asServiceRole;
    const client = await svc.entities.Client.get(client_id);
    if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

    const bizName = brand_name || client.name || "Your Business";
    const bizIndustry = industry || "professional services";
    const bizCity = city || "";
    const bizState = state || "";
    const stage = business_stage || "build_new";

    // Generate 10 mockup designs in a single AI call
    const prompt = `You are a world-class web design system generating 10 unique, production-ready website mockups.

BUSINESS CONTEXT:
- Name: ${bizName}
- Industry: ${bizIndustry}
- Location: ${bizCity}${bizState ? ", " + bizState : ""}
- Stage: ${stage === "rebrand" ? "Rebranding existing business" : stage === "enhance_existing" ? "Enhancing existing website" : "Building new from scratch"}

Generate exactly 10 mockups with DISTINCTLY different design directions. Each must be a complete, self-contained HTML page.

REQUIREMENTS FOR EACH MOCKUP:
- Full HTML5 document with inline <style> in <head>
- Google Fonts via <link> CDN
- Responsive (mobile + desktop) with media queries
- Sections: sticky nav, hero (headline + subheadline + CTA), services grid (3-4 cards), about, testimonials, contact CTA, footer
- Unique color palette per mockup (different vibes: bold, minimal, warm, corporate, vibrant, dark, editorial, gradient, glassmorphism, brutalist)
- Semantic HTML with ARIA labels for accessibility
- Smooth CSS transitions on hover
- NO external images — use CSS gradients, patterns, or inline SVG for visuals
- Keep each mockup 120-180 lines of HTML/CSS

RETURN ONLY a valid JSON object (no markdown, no code fences):
{
  "mockups": [
    {"name":"Design Name","description":"2-3 word style tagline","palette":["#hex1","#hex2","#hex3"],"html":"<!DOCTYPE html>...complete page..."},
    ...exactly 10 entries
  ]
}

Make each design genuinely unique — different layouts, typography pairings, color moods, and visual treatments.`;

    const data = await gatewayPost("/chat/completions", {
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 16000,
    }, 180000);

    const content = data?.choices?.[0]?.message?.content;
    if (!content) return Response.json({ error: "AI returned empty response" }, { status: 500 });

    // Extract JSON from response
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return Response.json({ error: "AI returned invalid format" }, { status: 500 });
    const parsed = JSON.parse(match[0]);
    const mockups = parsed.mockups || parsed;

    if (!Array.isArray(mockups) || mockups.length === 0) {
      return Response.json({ error: "AI returned no mockups" }, { status: 500 });
    }

    // Create TemplatePack records for each mockup
    const created = [];
    for (let i = 0; i < Math.min(mockups.length, 10); i++) {
      const m = mockups[i];
      const pack = await svc.entities.TemplatePack.create({
        name: m.name || `Mockup ${i + 1}`,
        kind: "mockup",
        description: m.description || `Design direction ${i + 1}`,
        preview_html: m.html || "",
        manifest: JSON.stringify({ palette: m.palette || [], index: i + 1 }),
        brand_tokens: JSON.stringify({ colors: m.palette || [], industry: bizIndustry }),
        status: "pending_review",
        source: "gpt_sync",
        submitted_by_label: user.full_name || user.email || "Timeline",
        version: "1.0.0",
      });
      created.push({
        id: pack.id,
        name: pack.name,
        description: pack.description,
        palette: m.palette || [],
        html: m.html || "",
      });
    }

    return Response.json({
      ok: true,
      client_id,
      mockups_generated: created.length,
      mockups: created,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}