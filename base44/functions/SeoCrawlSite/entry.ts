import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';
import { analyzePage } from '../../shared/pageAnalysis.ts';
import { crawlUrl, crawlFetch, sitemapPageUrls } from '../../shared/seoCrawlUtils.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const input = typeof body.domain === 'string' ? body.domain.trim() : '';
    const maxPages = body.maxPages === undefined ? 30 : Number(body.maxPages);
    if (!input || input.length > 300 || !Number.isInteger(maxPages) || maxPages < 1 || maxPages > 50) return Response.json({ error: 'Provide a public domain and maxPages between 1 and 50.' }, { status: 400 });
    let root;
    try { root = crawlUrl(input.includes('://') ? input : `https://${input}`); }
    catch (error) { return Response.json({ error: error.message }, { status: 400 }); }
    if (root.pathname !== '/' || root.search) return Response.json({ error: 'Provide the domain only, without a path or query.' }, { status: 400 });
    const domain = root.hostname.replace(/^www\./i, '');
    const hosts = new Set([domain, `www.${domain}`]);
    let sitemap;
    try { sitemap = await sitemapPageUrls(root.origin, hosts, maxPages); }
    catch (error) { return Response.json({ error: error.message }, { status: 502 }); }
    if (!sitemap.urls.length) return Response.json({ error: 'No eligible page URLs found in the site sitemap.', warnings: sitemap.warnings }, { status: 404 });
    const pageResults = [];
    for (let start = 0; start < sitemap.urls.length; start += 6) {
      const results = await Promise.all(sitemap.urls.slice(start, start + 6).map(async (url) => {
        try {
          const response = await crawlFetch(url, hosts);
          const issues = [];
          if (response.status !== 200) issues.push(`http_status:${response.status}`);
          if (!/html/i.test(response.contentType)) issues.push('not_html');
          const analysis = analyzePage(response.text, new URL(response.url).hostname);
          if (!analysis.hasTitle) issues.push('missing_title');
          if (!analysis.hasMetaDesc) issues.push('missing_meta_desc');
          if (!analysis.hasCanonical) issues.push('missing_canonical');
          if (!analysis.hasH1) issues.push('missing_h1');
          if (!analysis.hasSchema) issues.push('missing_schema');
          if (analysis.wordCount < 300) issues.push('low_text_volume_review');
          if (analysis.imgsNoAlt) issues.push(`images_no_alt:${analysis.imgsNoAlt}`);
          return { url, finalUrl: response.url, status: response.status, score: response.status === 200 ? Math.max(0, 100 - issues.length * 12) : 0, issues, wordCount: analysis.wordCount };
        } catch (error) {
          return { url, status: 0, score: 0, issues: ['fetch_failed'], wordCount: 0, error: error.message };
        }
      }));
      pageResults.push(...results);
    }
    const totalIssues = pageResults.reduce((total, page) => total + page.issues.length, 0);
    const avgScore = Math.round(pageResults.reduce((total, page) => total + page.score, 0) / pageResults.length);
    const issueCounts = new Map();
    for (const page of pageResults) for (const issue of page.issues) {
      const key = issue.split(':')[0];
      issueCounts.set(key, (issueCounts.get(key) || 0) + 1);
    }
    const topIssues = [...issueCounts.entries()].sort((a, b) => b[1] - a[1]);
    const crawledAt = new Date().toISOString();
    await base44.entities.Receipt.create({ kind: 'validation', summary: `SEO crawl: ${pageResults.length} pages, heuristic score ${avgScore}/100, ${totalIssues} issues`, detail: JSON.stringify({ domain, topIssues, avgScore }), source: 'SeoCrawlSite', provenance: 'MEASURED', occurred_at: crawledAt });
    return Response.json({ ok: true, domain, pagesCrawled: pageResults.length, avgScore, totalIssues, topIssues, pageResults: pageResults.sort((a, b) => a.score - b.score), warnings: sitemap.warnings, sitemapLimitReached: sitemap.sitemapLimitReached, scoreType: 'heuristic_checks_not_policy_certification', crawledAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}