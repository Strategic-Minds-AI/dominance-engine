/**
 * Sitemap generator with per-site sitemaps + sitemap index.
 *
 * Modes:
 *  - ?index=1              → sitemap index linking to per-site sitemaps
 *  - ?launched_site_id=<id> → sitemap for a specific launched site
 *  - ?legacy=1              → sitemap for pages without a launched_site_id
 *  - (default)              → all published pages (backward compat)
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

const SITEMAP_BASE = "https://scale-dominance.base44.app";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const launchedSiteId = url.searchParams.get("launched_site_id");
    const siteParam = url.searchParams.get("site");
    const indexMode = url.searchParams.get("index") === "1";
    const legacyMode = url.searchParams.get("legacy") === "1";

    // Sitemap index: links to per-site sitemaps
    if (indexMode) {
      const sitesPage = await base44.asServiceRole.entities.LaunchedSite.filter(
        { status: "live" },
        { limit: 500, fields: ["id"] }
      );
      const sites = sitesPage.items || sitesPage || [];
      const sitemapUrls = sites.map((s) => `${SITEMAP_BASE}/functions/seoSitemap?launched_site_id=${s.id}`);
      sitemapUrls.push(`${SITEMAP_BASE}/functions/seoSitemap?legacy=1`);
      const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        sitemapUrls.map((u) => `  <sitemap><loc>${u}</loc></sitemap>`).join("\n") +
        `\n</sitemapindex>\n`;
      return new Response(body, { status: 200, headers: { "Content-Type": "application/xml" } });
    }

    // Per-site sitemap
    if (launchedSiteId) {
      const site = await base44.asServiceRole.entities.LaunchedSite.get(launchedSiteId);
      const base = (site.domain || siteParam || SITEMAP_BASE).replace(/\/$/, "");
      const slugs = await collectSlugs(base44, { status: "published", launched_site_id: launchedSiteId });
      return sitemapResponse(base, ["/", ...slugs.map((s) => "/" + s)]);
    }

    // Legacy mode: pages without a launched_site_id
    if (legacyMode) {
      const base = (siteParam || SITEMAP_BASE).replace(/\/$/, "");
      const slugs = await collectSlugs(base44, { status: "published", launched_site_id: { $exists: false } });
      return sitemapResponse(base, ["/", ...slugs.map((s) => "/" + s)]);
    }

    // Default: all published pages (backward compat)
    const base = (siteParam || SITEMAP_BASE).replace(/\/$/, "");
    const slugs = await collectSlugs(base44, { status: "published" });
    return sitemapResponse(base, ["/", ...slugs.map((s) => "/" + s)]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function collectSlugs(base44, query) {
  let slugs = [];
  let cursor;
  do {
    const page = await base44.asServiceRole.entities.GeneratedPage.filter(
      query,
      { sort: "-created_date", limit: 500, cursor, fields: ["slug"] }
    );
    const items = page.items || page || [];
    slugs = slugs.concat(items.map((p) => p.slug));
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return slugs;
}

function sitemapResponse(base, urls) {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${base}${u}</loc><changefreq>weekly</changefreq><priority>${u === "/" ? "1.0" : "0.8"}</priority></url>`).join("\n") +
    `\n</urlset>\n`;
  return new Response(body, { status: 200, headers: { "Content-Type": "application/xml" } });
}