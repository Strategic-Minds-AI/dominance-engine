/**
 * Universal page generator — works for ANY industry, not just legal.
 * Generates unique AI content per page with local context + internal linking.
 *
 * AI calls route through the Vercel AI Gateway (VERCEL_AI_GATEWAY secret),
 * which bills to the user's Vercel account — NOT Base44 integration credits.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { generateContentMatrix, buildPage, addInternalLinks, getNearbyCities } from "../../shared/pageGenerator.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    // Accept both "practice_areas" (legacy) and "keywords" (universal)
    const keywords = body.practice_areas || body.keywords || [];
    const locationIds = body.location_ids || [];
    const status = body.status === "draft" ? "draft" : "published";
    const siteUrl = body.site_url || "";
    const industry = body.industry || "";
    const contentTone = body.content_tone || "professional, authoritative, trustworthy";
    const brandName = body.brand_name || "YOUR FIRM";
    const launchedSiteId = body.launched_site_id || "";

    if (!keywords.length || !locationIds.length)
      return Response.json({ error: "practice_areas (or keywords) and location_ids are required" }, { status: 400 });

    // Load locations in chunks (handles >1000 locations)
    const locations = [];
    for (let i = 0; i < locationIds.length; i += 500) {
      const chunk = locationIds.slice(i, i + 500);
      const page = await base44.asServiceRole.entities.Location.filter(
        { id: { $in: chunk } },
        { limit: 500 }
      );
      locations.push(...(page.items || page || []));
    }

    // Generate AI content matrix (universal — works for any industry)
    const matrix = await generateContentMatrix(keywords, {
      tone: contentTone,
      industry,
      brandName,
      brandDescription: brandName + (industry ? " — " + industry : " — professional services"),
    });

    // Build all pages with local context
    const pages = [];
    for (const keyword of keywords) {
      for (const loc of locations) {
        const nearbyCities = getNearbyCities(locations, loc.city, loc.state_code);
        const page = buildPage(keyword, loc, matrix, {
          brandName, siteUrl, launchedSiteId, nearbyCities,
        });
        if (page) {
          page.status = status;
          pages.push(page);
        }
      }
    }

    // Add internal links (related pages section) — distributes authority, speeds indexing
    const pagesWithLinks = addInternalLinks(pages);

    // Upsert in batches of 400
    let created = 0;
    let updated = 0;
    for (let i = 0; i < pagesWithLinks.length; i += 400) {
      const batch = pagesWithLinks.slice(i, i + 400);
      const res = await base44.asServiceRole.entities.GeneratedPage.upsert(batch, { key: "slug" });
      created += res.created || 0;
      updated += res.updated || 0;
    }

    return Response.json({
      created, updated, total: pagesWithLinks.length,
      sample_slug: pagesWithLinks[0]?.slug,
      content_generated: !!matrix,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}