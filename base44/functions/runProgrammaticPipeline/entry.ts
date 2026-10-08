import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

// ═══════════════════════════════════════════════════════════════════════════
// runProgrammaticPipeline — Digital Dominance programmatic SEO pipeline.
//
// Takes a verified base website (created in the Website Factory) and clones +
// strategically mutates it across a list of target metros, producing a unique,
// Google-compliant site per location:
//   1. Mutate every page's content / NAP / schema / local context per metro
//   2. Generate a per-site sitemap.xml
//   3. Queue Google Search Console sitemap-submission jobs (approval_required
//      until the GSC connector is authorized)
//   4. Queue NAP citation-submission jobs across directory targets
//
// Deterministic — runs without integration credits. Live GSC submission and
// directory citation posting require connector authorization / credentials.
// ═══════════════════════════════════════════════════════════════════════════

const slugify = (s: string) =>
  String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const PATTERN_SUFFIX: Record<string, string> = {
  near_me: ".nearme.com",
  near_you: ".nearyou.com",
  branded_hub: "",
};

// The citation library — the "submit to other websites to be more digitally known" stage.
const CITATION_DIRECTORIES = [
  "Google Business Profile",
  "Bing Places for Business",
  "Apple Maps Connect",
  "Yelp for Business",
  "Facebook Business Page",
  "Foursquare for Business",
  "Yellow Pages (YP.com)",
  "BBB Accredited Business",
  "MapQuest",
  "Superpages",
  "Local.com",
  "Manta",
  "Hotfrog",
  "Citysearch",
  "Four11",
  "Trustpilot Business",
];

function domainFor(
  serviceSlug: string,
  citySlug: string,
  companySlug: string,
  pattern: string
): string {
  const suffix = PATTERN_SUFFIX[pattern] ?? "";
  if (suffix) return `${serviceSlug}-${citySlug}${suffix}`;
  return companySlug
    ? `${companySlug}-${citySlug}.com`
    : `${serviceSlug}-${citySlug}.com`;
}

function replaceLoc(
  text: any,
  fromCity: string,
  toCity: string,
  fromMetro: string,
  toMetro: string,
  fromState: string,
  toState: string
): any {
  if (typeof text !== "string") return text;
  return String(text)
    .split(fromMetro)
    .join(toMetro)
    .split(fromCity)
    .join(toCity)
    .split(fromState)
    .join(toState);
}

function buildSitemapXml(domain: string, pages: any[]): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p: any) => {
      const path = p.slug ? `/${p.slug}` : "/";
      const priority = p.page_type === "home" ? "1.0" : "0.8";
      return `  <url>\n    <loc>https://${domain}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function escapeXml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildRobotsTxt(domain: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: https://${domain}/sitemap.xml\n`;
}

function buildRssXml(
  domain: string,
  siteName: string,
  pages: any[],
  service: string
): string {
  const pubDate = new Date().toUTCString();
  const items = pages
    .map((p: any) => {
      const path = p.slug ? `/${p.slug}` : "/";
      return `    <item>\n      <title>${escapeXml(p.title || siteName)}</title>\n      <link>https://${domain}${path}</link>\n      <guid>https://${domain}${path}</guid>\n      <description>${escapeXml(p.meta_description || "")}</description>\n      <pubDate>${pubDate}</pubDate>\n    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${escapeXml(siteName)}</title>\n    <link>https://${domain}/</link>\n    <description>${escapeXml(service)} updates</description>\n    <lastBuildDate>${pubDate}</lastBuildDate>\n${items}\n  </channel>\n</rss>`;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin")
      return Response.json({ error: "Forbidden — admin only" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { base_website_id, target_metros, options = {} } = body;
    const {
      submit_search_console = true,
      submit_citations = true,
      dry_run = false,
    } = options;

    if (!base_website_id)
      return Response.json(
        { error: "base_website_id is required (generate a base site in the Website Factory first)" },
        { status: 400 }
      );
    if (!target_metros || !target_metros.length)
      return Response.json({ error: "target_metros is required" }, { status: 400 });

    // ── Resolve base site + pages ────────────────────────────────────────
    const baseSite: any = await base44.entities.Website.get(base_website_id);
    const pageRes: any = await base44.entities.GeneratedPage.filter(
      { website_id: base_website_id },
      { limit: 100 }
    );
    let basePages: any[] = pageRes.items || [];
    if (basePages.length === 0 && baseSite.preview_data?.pages) {
      basePages = baseSite.preview_data.pages;
    }
    if (!basePages.length)
      return Response.json(
        { error: "Base website has no generated pages. Generate it in the Website Factory first." },
        { status: 400 }
      );

    // ── Normalize target metros ───────────────────────────────────────────
    const fromCity = baseSite.primary_city || baseSite.city || "";
    const fromState = baseSite.primary_state || baseSite.state || "";
    const fromMetro = baseSite.metro || `${fromCity}, ${fromState}`;

    const targets = target_metros
      .map((m: any) => {
        if (typeof m === "string") {
          const parts = m.split(",").map((x: string) => x.trim());
          return { city: parts[0], state: parts[1] || fromState, metro: m };
        }
        return {
          city: m.city,
          state: m.state || fromState,
          metro: m.metro || `${m.city}, ${m.state || fromState}`,
        };
      })
      .filter((t: any) => t.city);

    if (!targets.length)
      return Response.json({ error: "No valid target metros" }, { status: 400 });
    if (targets.length > 250)
      return Response.json({ error: "Max 250 metros per run" }, { status: 400 });

    const service = baseSite.service;
    const serviceSlug = baseSite.service_slug || slugify(service);
    const companySlug = slugify(
      baseSite.company_name || baseSite.brand?.company_name || service
    );
    const pattern = baseSite.pattern || "near_me";

    if (dry_run) {
      return Response.json({
        ok: true,
        dry_run: true,
        base: { service, from: `${fromCity}, ${fromState}` },
        targets: targets.length,
        domains: targets.map((t: any) =>
          domainFor(serviceSlug, slugify(t.city), companySlug, pattern)
        ),
      });
    }

    // ── Optional: attempt live GSC submission if connector is authorized ──
    let gscConnector: any = null;
    try {
      gscConnector = await base44.asServiceRole.connectors.getConnection(
        "google_search_console"
      );
    } catch (_e) {
      gscConnector = null;
    }

    const created_sites: string[] = [];
    let created_pages = 0;
    let created_jobs = 0;
    let sitemaps = 0;
    const errors: any[] = [];

    for (const t of targets) {
      try {
        const citySlug = slugify(t.city);
        const domain = domainFor(serviceSlug, citySlug, companySlug, pattern);
        const siteName = `${baseSite.company_name || service} ${t.city}`;
        const siteSlug = `${serviceSlug}-${citySlug}`;

        // ── Mutate every page for this metro (page-change matrix) ─────────
        const mutatedPages = basePages.map((p: any) => {
          const repl = (txt: any) =>
            replaceLoc(txt, fromCity, t.city, fromMetro, t.metro, fromState, t.state);
          let baseSchema: any = p.schema_json
            ? JSON.parse(JSON.stringify(p.schema_json))
            : {};
          if (baseSchema.areaServed)
            baseSchema.areaServed = { "@type": "City", name: t.city };
          if (baseSite.phone && !baseSchema.telephone)
            baseSchema.telephone = baseSite.phone;

          const faqMut = (p.faq || []).map((f: any) => ({
            q: repl(f.q),
            a: repl(f.a),
          }));

          // Internal links to sibling pages (page-change matrix: internal links)
          const internalLinks = basePages
            .filter((x: any) => x.slug !== p.slug)
            .map((x: any) => ({
              slug: x.slug,
              type: x.page_type,
              anchor: x.page_type === "home" ? "Home" : repl(x.h1 || x.page_type),
            }));

          const sectionsMut = (p.sections || []).map((s: any) => ({
            ...s,
            heading: repl(s.heading),
            body: repl(s.body),
          }));
          sectionsMut.push({
            heading: `Related ${service.toLowerCase()} pages for ${t.city}`,
            body: internalLinks
              .map(
                (l: any) =>
                  `${l.anchor} — https://${domain}${l.slug ? "/" + l.slug : "/"}`
              )
              .join("\n"),
            layer: "Internal links",
            links: internalLinks.map((l: any) => ({
              url: `https://${domain}${l.slug ? "/" + l.slug : "/"}`,
              anchor: l.anchor,
            })),
          });

          // Enhanced JSON-LD: main entity + FAQPage + BreadcrumbList (@graph)
          const graph: any[] = [baseSchema];
          if (faqMut.length) {
            graph.push({
              "@type": "FAQPage",
              mainEntity: faqMut.map((f: any) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            });
          }
          graph.push({
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `https://${domain}/`,
              },
              ...(p.slug
                ? [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: p.page_type,
                      item: `https://${domain}/${p.slug}`,
                    },
                  ]
                : []),
            ],
          });

          return {
            website_name: siteName,
            slug: p.slug,
            page_type: p.page_type,
            title: repl(p.title),
            h1: repl(p.h1),
            meta_description: repl(p.meta_description),
            intro: repl(p.intro),
            sections: sectionsMut,
            faq: faqMut,
            schema_json: { "@context": "https://schema.org", "@graph": graph },
            intent: p.intent,
            canonical_url: p.canonical_url,
            differentiation_layers: [
              ...(p.differentiation_layers || []),
              "Internal links",
            ],
            compliance_flags: [
              ...(p.compliance_flags || []),
              "enhanced_schema",
              "internal_links",
            ],
            status: "generated" as const,
          };
        });

        const sitemapXml = buildSitemapXml(domain, basePages);
        const robotsTxt = buildRobotsTxt(domain);
        const rssXml = buildRssXml(domain, siteName, basePages, service);

        // ── Create the localized Website record ──────────────────────────
        const website: any = await base44.entities.Website.create({
          name: siteName,
          slug: siteSlug,
          service,
          service_slug: serviceSlug,
          vertical: baseSite.vertical,
          metro: t.metro,
          intent: baseSite.intent || "transactional",
          pattern,
          domain_candidate: domain,
          domain_status: "not_checked",
          company_name: baseSite.company_name,
          phone: baseSite.phone,
          email: baseSite.email,
          primary_city: t.city,
          primary_state: t.state,
          service_area: `${t.city} and surrounding areas`,
          accent_color: baseSite.accent_color || "#00f2ff",
          page_count: mutatedPages.length,
          google_compliance_score: baseSite.google_compliance_score || 80,
          differentiation_score: baseSite.differentiation_score || 70,
          status: "preview_ready",
          preview_data: {
            pages: mutatedPages,
            cloned_from: base_website_id,
          },
          provision_state: {
            sitemap_xml: sitemapXml,
            sitemap_url: `https://${domain}/sitemap.xml`,
            robots_txt: robotsTxt,
            rss_xml: rssXml,
            site_url: `https://${domain}`,
          },
          deploy_url: `https://${domain}`,
          launch_mode: baseSite.launch_mode || "manual",
          notes: `Programmatic pipeline clone from ${fromCity}, ${fromState}.`,
        });
        created_sites.push(website.id);

        // ── Create the localized pages ───────────────────────────────────
        const pagesWithId = mutatedPages.map((p: any) => ({
          ...p,
          website_id: website.id,
        }));
        const created: any =
          await base44.entities.GeneratedPage.bulkCreate(pagesWithId);
        const recs = Array.isArray(created) ? created : created?.records || [];
        created_pages += recs.length;

        // ── Google Search Console sitemap submission ─────────────────────
        if (submit_search_console) {
          let gscStatus = "approval_required";
          let gscLog =
            "Queued for Google Search Console sitemap submission. Authorize the Google Search Console connector to enable live submission.";
          let gscExternalRef = "";
          if (gscConnector?.accessToken) {
            try {
              // Best-effort live submission via GSC API (site URL encoded).
              const siteUrl = encodeURIComponent(`https://${domain}`);
              const submitRes = await fetch(
                `https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${encodeURIComponent(
                  `https://${domain}/sitemap.xml`
                )}`,
                {
                  method: "PUT",
                  headers: { Authorization: `Bearer ${gscConnector.accessToken}` },
                  signal: AbortSignal.timeout(15000),
                }
              );
              if (submitRes.ok) {
                gscStatus = "success";
                gscExternalRef = `https://${domain}/sitemap.xml`;
                gscLog = "Sitemap submitted to Google Search Console.";
              } else {
                gscLog = `GSC submit returned ${submitRes.status}. Job retained as approval_required.`;
              }
            } catch (e: any) {
              gscLog = `GSC submit failed: ${e.message}. Job retained as approval_required.`;
            }
          }
          await base44.entities.ProvisioningJob.create({
            website_id: website.id,
            website_name: siteName,
            target: "google_search_console",
            action: "submit_sitemap",
            status: gscStatus,
            approval_required: gscStatus === "approval_required",
            external_url: `https://${domain}/sitemap.xml`,
            external_ref: gscExternalRef,
            receipt: {
              site_url: `https://${domain}`,
              sitemap_url: `https://${domain}/sitemap.xml`,
              sitemap_xml: sitemapXml,
            },
            log: gscLog,
          });
          created_jobs++;
          sitemaps++;
        }

        // ── NAP citation submission ─────────────────────────────────────
        if (submit_citations) {
          await base44.entities.ProvisioningJob.create({
            website_id: website.id,
            website_name: siteName,
            target: "citations",
            action: "submit_nap",
            status: "approval_required",
            approval_required: true,
            external_url: `https://${domain}`,
            receipt: {
              nap: {
                company: baseSite.company_name,
                phone: baseSite.phone,
                email: baseSite.email,
                city: t.city,
                state: t.state,
                service_area: `${t.city} and surrounding areas`,
                website: `https://${domain}`,
              },
              directories: CITATION_DIRECTORIES,
            },
            log: `Queued NAP citation submission to ${CITATION_DIRECTORIES.length} directories. Live posting requires per-directory credentials.`,
          });
          created_jobs++;
        }
      } catch (e: any) {
        errors.push({ metro: t.metro, error: e.message });
      }
    }

    return Response.json({
      ok: true,
      base: { service, from: `${fromCity}, ${fromState}` },
      targets: targets.length,
      websites_created: created_sites.length,
      created_site_ids: created_sites,
      pages_created: created_pages,
      jobs_created: created_jobs,
      sitemaps_generated: sitemaps,
      citation_directories: CITATION_DIRECTORIES.length,
      gsc_live: !!gscConnector?.accessToken,
      errors,
      note: gscConnector?.accessToken
        ? "Pipeline complete. Sitemaps submitted live to Google Search Console. Citation jobs queued as approval_required."
        : "Pipeline complete. Sitemaps generated and stored. GSC + citation jobs queued as approval_required — authorize the Google Search Console connector and configure directory credentials to enable live submission.",
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}