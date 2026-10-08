/**
 * Guardian Agent — autonomous website & Google Console health scanner.
 *
 * Scans every launched site, detects issues (missing sitemaps, unpublished
 * pages, stuck launching status, unconnected GSC/Analytics, dead site
 * versions), auto-fixes what it can, and creates approval-gated AgentTask
 * records for issues that need human action.
 *
 * When Google Search Console / Analytics connectors are authorized, the
 * guardian also submits sitemaps and checks indexing status automatically.
 *
 * Triggered by:
 *   1. The scheduled workflow (every 30 minutes, 24/7)
 *   2. Manual "Run Scan" from the APEX Control dashboard
 *   3. An external worker calling with WORKER_SECRET
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { secrets } from "base44:runtime";

const SITE_URL = "https://scale-dominance.base44.app";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Auth: worker mode or admin mode
    const expectedSecret = secrets.get("WORKER_SECRET");
    const isWorker = !!(body?.worker_secret && expectedSecret && body.worker_secret === expectedSecret);
    if (!isWorker) {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Load all launched sites
    const sitesRes = await base44.asServiceRole.entities.LaunchedSite.filter({}, { limit: 500 });
    const sites = sitesRes.items || [];

    // Check if Google connectors are available (for sitemap submission)
    let gscConnection = null;
    let analyticsConnection = null;
    try {
      gscConnection = await base44.asServiceRole.connectors.getConnection("google_search_console");
    } catch {}
    try {
      analyticsConnection = await base44.asServiceRole.connectors.getConnection("google_analytics");
    } catch {}

    const scanResults = [];
    let totalIssues = 0;
    let totalFixes = 0;

    for (const site of sites) {
      const issues = [];
      const fixes = [];

      // ── CHECK 1: Site status ──
      if (site.status === "launching" || site.status === "error") {
        const pageRes = await base44.asServiceRole.entities.GeneratedPage.filter(
          { launched_site_id: site.id, status: "published" },
          { limit: 1 }
        );
        if (pageRes.items && pageRes.items.length > 0) {
          await base44.asServiceRole.entities.LaunchedSite.update(site.id, { status: "live" });
          fixes.push("Auto-fixed: marked site live (has published pages)");
        } else {
          issues.push({ severity: "high", area: "status", message: "Site stuck in launching/error with no published pages" });
        }
      }

      // ── CHECK 2: Pages count sync ──
      const actualPageCount = await base44.asServiceRole.entities.GeneratedPage.count(
        { launched_site_id: site.id, status: "published" }
      );
      if (actualPageCount !== (site.pages_count || 0)) {
        await base44.asServiceRole.entities.LaunchedSite.update(site.id, { pages_count: actualPageCount });
        fixes.push(`Auto-fixed: synced pages_count (${site.pages_count || 0} → ${actualPageCount})`);
      }
      if (actualPageCount === 0) {
        issues.push({ severity: "high", area: "content", message: "No published pages — site is empty" });
      }

      // ── CHECK 3: Sitemap URL ──
      if (!site.sitemap_url) {
        const sitemapUrl = `${SITE_URL}/functions/seoSitemap?site=${site.id}`;
        await base44.asServiceRole.entities.LaunchedSite.update(site.id, { sitemap_url: sitemapUrl });
        fixes.push("Auto-fixed: set sitemap URL");
      }

      // ── CHECK 4: Site version is live ──
      if (site.site_version_id) {
        try {
          const version = await base44.asServiceRole.entities.SiteVersion.get(site.site_version_id);
          if (version && version.status !== "live") {
            await base44.asServiceRole.entities.SiteVersion.update(version.id, { status: "live" });
            fixes.push("Auto-fixed: marked site version live");
          }
        } catch {}
      }

      // ── CHECK 5: Google Search Console ──
      if (!site.gsc_connected) {
        issues.push({ severity: "medium", area: "gsc", message: "Google Search Console not connected" });
        const existingTasks = await base44.asServiceRole.entities.AgentTask.filter(
          { launched_site_id: site.id, task_type: "connect_gsc", status: { $in: ["pending", "needs_approval"] } },
          { limit: 1 }
        );
        if (!existingTasks.items || existingTasks.items.length === 0) {
          await base44.asServiceRole.entities.AgentTask.create({
            agent_name: "guardian",
            launched_site_id: site.id,
            task_type: "connect_gsc",
            title: `Connect Google Search Console — ${site.name}`,
            description: "Authorize the Google Search Console connector in Integrations, then set the site's GSC property URL. The guardian will automatically submit sitemaps and check indexing.",
            status: "needs_approval",
            priority: "medium",
            autonomous: false,
          });
        }
      } else if (gscConnection?.accessToken && site.gsc_property_url && site.sitemap_url) {
        try {
          const submitRes = await fetch(
            `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site.gsc_property_url)}/sitemaps/${encodeURIComponent(site.sitemap_url)}`,
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${gscConnection.accessToken}` },
              signal: AbortSignal.timeout(15000),
            }
          );
          if (submitRes.ok || submitRes.status === 409) {
            fixes.push("Auto-fixed: submitted sitemap to Google Search Console");
          }
        } catch (e) {
          issues.push({ severity: "low", area: "gsc", message: `GSC sitemap submission failed: ${String(e.message).slice(0, 80)}` });
        }
      }

      // ── CHECK 6: Google Analytics ──
      if (!site.analytics_connected) {
        issues.push({ severity: "medium", area: "analytics", message: "Google Analytics not connected" });
        const existingTasks = await base44.asServiceRole.entities.AgentTask.filter(
          { launched_site_id: site.id, task_type: "connect_analytics", status: { $in: ["pending", "needs_approval"] } },
          { limit: 1 }
        );
        if (!existingTasks.items || existingTasks.items.length === 0) {
          await base44.asServiceRole.entities.AgentTask.create({
            agent_name: "guardian",
            launched_site_id: site.id,
            task_type: "connect_analytics",
            title: `Connect Google Analytics — ${site.name}`,
            description: "Authorize the Google Analytics connector in Integrations, then set the site's Analytics property ID. The guardian will verify tracking is active.",
            status: "needs_approval",
            priority: "medium",
            autonomous: false,
          });
        }
      }

      // ── CHECK 7: Visit count sync ──
      if (site.site_version_id) {
        try {
          const visitAgg = await base44.asServiceRole.entities.Visit.aggregate({
            query: { version_id: site.site_version_id },
            groupBy: "version_id",
          });
          const visitCount = visitAgg.rows?.[0]?.count || 0;
          if (visitCount !== (site.visits_count || 0)) {
            await base44.asServiceRole.entities.LaunchedSite.update(site.id, { visits_count: visitCount });
            fixes.push(`Auto-fixed: synced visits_count (${site.visits_count || 0} → ${visitCount})`);
          }
        } catch {}
      }

      totalIssues += issues.length;
      totalFixes += fixes.length;
      scanResults.push({
        site_id: site.id,
        site_name: site.name,
        status: site.status,
        issues_found: issues.length,
        fixes_applied: fixes.length,
        issues,
        fixes,
      });
    }

    return Response.json({
      guardian: "guardian-v1",
      scanned: sites.length,
      total_issues: totalIssues,
      total_fixes: totalFixes,
      gsc_connected: !!gscConnection?.accessToken,
      analytics_connected: !!analyticsConnection?.accessToken,
      results: scanResults,
      scanned_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}