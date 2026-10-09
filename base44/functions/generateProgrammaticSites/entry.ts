/**
 * Programmatic Site Generator — Phase 4 of the timeline.
 * Generates 100 Google-compliant pages (10 locations × 10 services)
 * with unique AI content, internal linking, and schema markup.
 *
 * AI calls route through the Vercel AI Gateway (paid, NOT Base44 credits).
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { gatewayPost } from "../../shared/vercelGateway.ts";
import { generateContentMatrix, buildPage, addInternalLinks, slugify } from "../../shared/pageGenerator.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { client_id, launched_site_id, industry, brand_name, base_city, base_state } = body;
    if (!client_id) return Response.json({ error: "client_id is required" }, { status: 400 });

    const svc = base44.asServiceRole;

    // ── 1. Generate 10 locations and 10 services via AI ──
    const genPrompt = `You are a programmatic SEO strategist. Generate expansion data for a ${industry} business based in ${base_city}, ${base_state}.

Return ONLY a valid JSON object (no markdown, no code fences):
{
  "locations": ["10 cities near ${base_city}, ${base_state} — real city names, include ${base_city} itself"],
  "services": ["10 service keywords for ${industry} — specific, high-intent search terms"]
}

Example for a plumber in Dallas, TX:
{"locations":["Dallas","Fort Worth","Arlington","Plano","Garland","Irving","Mesquite","Carrollton","Richardson","Denton"],
 "services":["Emergency Plumbing","Water Heater Repair","Drain Cleaning","Leak Detection","Sewer Line Repair","Garbage Disposal","Toilet Repair","Pipe Repair","Bathroom Remodel","Water Filtration"]}`;

    const genData = await gatewayPost("/chat/completions", {
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: genPrompt }],
      temperature: 0.8,
      max_tokens: 2000,
    }, 60000);

    const genContent = genData?.choices?.[0]?.message?.content || "";
    const genMatch = genContent.match(/\{[\s\S]*\}/);
    if (!genMatch) return Response.json({ error: "AI failed to generate locations/services" }, { status: 500 });
    const { locations: locNames, services: svcNames } = JSON.parse(genMatch[0]);

    if (!Array.isArray(locNames) || !Array.isArray(svcNames) || locNames.length === 0 || svcNames.length === 0) {
      return Response.json({ error: "AI returned invalid location/service data" }, { status: 500 });
    }

    // ── 2. Create Location records ──
    const locations = [];
    for (const locName of locNames.slice(0, 10)) {
      const stateCode = base_state || "US";
      let existing = await svc.entities.Location.filter({ city: locName, state_code: stateCode }, { limit: 1 });
      let loc = (existing.items || [])[0];
      if (!loc) {
        loc = await svc.entities.Location.create({ city: locName, state: stateCode, state_code: stateCode });
      }
      locations.push(loc);
    }

    const keywords = svcNames.slice(0, 10);
    const totalPages = locations.length * keywords.length;

    // ── 3. Generate AI content matrix ──
    const matrix = await generateContentMatrix(keywords, {
      tone: "professional, authoritative, trustworthy",
      industry: industry || "professional services",
      brandName: brand_name || "Your Business",
      brandDescription: `${brand_name || "Your Business"} — ${industry} services across ${locations.map((l) => l.city).join(", ")}`,
    });

    // ── 4. Build all pages ──
    const siteUrl = launched_site_id
      ? `${SITEMAP_BASE}/v/${slugify(brand_name || industry || "site")}`
      : "";
    const pages = [];
    for (const keyword of keywords) {
      for (const loc of locations) {
        pages.push(buildPage(keyword, loc, matrix, {
          brandName: brand_name || "Your Business",
          siteUrl,
          launchedSiteId: launched_site_id || "",
        }));
      }
    }
    const pagesWithLinks = addInternalLinks(pages);

    // ── 5. Upsert pages in batches ──
    let created = 0, updated = 0;
    for (let i = 0; i < pagesWithLinks.length; i += 400) {
      const batch = pagesWithLinks.slice(i, i + 400);
      try {
        const res = await svc.entities.GeneratedPage.upsert(batch, { key: "slug" });
        created += res.created || 0;
        updated += res.updated || 0;
      } catch {
        try { await svc.entities.GeneratedPage.bulkCreate(batch); created += batch.length; }
        catch { /* skip failed batch */ }
      }
    }

    // ── 6. Update LaunchedSite page count if provided ──
    if (launched_site_id) {
      const site = await svc.entities.LaunchedSite.get(launched_site_id).catch(() => null);
      if (site) {
        await svc.entities.LaunchedSite.update(launched_site_id, {
          locations_count: (site.locations_count || 0) + locations.length,
          pages_count: (site.pages_count || 0) + pagesWithLinks.length,
        }).catch(() => {});
      }
    }

    return Response.json({
      ok: true,
      client_id,
      launched_site_id,
      locations: locations.map((l) => l.city),
      services: keywords,
      total_pages: totalPages,
      pages_created: created,
      pages_updated: updated,
      compliance_note: "All pages include unique AI content, internal linking, FAQ schema, and local context per Google helpful content guidelines.",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

const SITEMAP_BASE = "https://scale-dominance.base44.app";