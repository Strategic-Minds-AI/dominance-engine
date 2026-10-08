/**
 * Universal programmatic site launcher — works for ANY industry.
 * Generates unique AI content per page with local context + internal linking.
 * Creates a LaunchedSite, SiteVersion, and all GeneratedPages in one call.
 *
 * AI calls route through the Vercel AI Gateway (VERCEL_AI_GATEWAY secret),
 * which bills to the user's Vercel account — NOT Base44 integration credits.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { generateContentMatrix, buildPage, addInternalLinks, getNearbyCities } from "../../shared/pageGenerator.ts";

const SITEMAP_BASE = "https://scale-dominance.base44.app";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { template_pack_id, client_id, site_name, site_slug, domain, keywords, location_ids, content_tone, industry, brand_name } = body;
    if (!template_pack_id || !client_id || !site_name || !site_slug)
      return Response.json({ error: "template_pack_id, client_id, site_name, site_slug are required" }, { status: 400 });
    if (!keywords?.length || !location_ids?.length)
      return Response.json({ error: "keywords and location_ids are required" }, { status: 400 });

    // Load pack + locations in chunks (handles >1000 locations)
    const pack = await base44.asServiceRole.entities.TemplatePack.get(template_pack_id);
    const locations = [];
    for (let i = 0; i < location_ids.length; i += 500) {
      const chunk = location_ids.slice(i, i + 500);
      const page = await base44.asServiceRole.entities.Location.filter(
        { id: { $in: chunk } },
        { limit: 500 }
      );
      locations.push(...(page.items || page || []));
    }

    const siteUrl = domain ? domain.replace(/\/$/, "") : `${SITEMAP_BASE}/v/${site_slug}`;

    const launched = await base44.asServiceRole.entities.LaunchedSite.create({
      client_id, name: site_name, template_pack_id, slug: site_slug, domain: domain || "",
      status: "launching", keywords: keywords.join(", "),
      locations_count: locations.length, pages_count: keywords.length * locations.length,
      sitemap_url: "", proof_url: siteUrl, gsc_connected: false, analytics_connected: false,
    });

    // Generate AI content matrix (universal — works for any industry)
    const matrix = await generateContentMatrix(keywords, {
      tone: content_tone,
      industry: industry || "",
      brandName: brand_name || pack?.name || "YOUR FIRM",
      brandDescription: pack?.description || pack?.name || brand_name || "Professional services firm",
    });

    // Build all pages with local context
    const pages = [];
    for (const keyword of keywords) {
      for (const loc of locations) {
        const nearbyCities = getNearbyCities(locations, loc.city, loc.state_code);
        pages.push(buildPage(keyword, loc, matrix, {
          brandName: brand_name || pack?.name || "YOUR FIRM",
          siteUrl,
          launchedSiteId: launched.id,
          nearbyCities,
        }));
      }
    }

    // Add internal links (related pages section)
    const pagesWithLinks = addInternalLinks(pages);

    // Upsert in batches of 400
    let created = 0, updated = 0;
    for (let i = 0; i < pagesWithLinks.length; i += 400) {
      const batch = pagesWithLinks.slice(i, i + 400);
      const res = await base44.asServiceRole.entities.GeneratedPage.upsert(batch, { key: "slug" });
      created += res.created || 0;
      updated += res.updated || 0;
    }

    const version = await base44.asServiceRole.entities.SiteVersion.create({
      name: site_name, slug: site_slug, template_pack_id, status: "live", is_primary: false,
      description: `Programmatic launch: ${keywords.join(", ")} x ${locations.length} locations`,
    });

    const fullSitemapUrl = `${SITEMAP_BASE}/functions/seoSitemap?launched_site_id=${launched.id}`;

    await base44.asServiceRole.entities.LaunchedSite.update(launched.id, {
      site_version_id: version.id, status: "live", proof_url: siteUrl,
      sitemap_url: fullSitemapUrl,
    });

    // Auto-create business card + brochure for the client portal
    await base44.asServiceRole.entities.BusinessCard.create({
      launched_site_id: launched.id, name: site_name, company: site_name, website: siteUrl,
    }).catch(() => {});
    await base44.asServiceRole.entities.Brochure.create({
      launched_site_id: launched.id, title: site_name, subtitle: keywords.join(", "),
      cta_text: "Contact us today for a free consultation.",
    }).catch(() => {});

    const proofLinks = pagesWithLinks.slice(0, 100).map((p) => `${siteUrl}${p.route_path}`);

    return Response.json({
      created, updated, total: pagesWithLinks.length, site_version_id: version.id,
      launched_site_id: launched.id, proof_url: siteUrl, sitemap_url: fullSitemapUrl,
      proof_links: proofLinks, content_generated: !!matrix,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}