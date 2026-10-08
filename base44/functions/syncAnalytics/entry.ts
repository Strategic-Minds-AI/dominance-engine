import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const GSC_BASE = "https://www.googleapis.com/webmasters/v3";
const GA_BASE = "https://analyticsdata.googleapis.com/v1beta";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const targetDate = body?.date || todayISO();
    const startDate = body?.startDate || daysAgoISO(1);

    // Get all launched sites
    const { items: sites } = await base44.asServiceRole.entities.LaunchedSite.filter(
      { status: 'live' },
      { sort: '-created_date', limit: 200 }
    );

    if (!sites || sites.length === 0) {
      return Response.json({ message: 'No live sites to sync', synced: 0 });
    }

    // Get connector tokens (shared / builder account)
    let gscToken: string | null = null;
    let gaToken: string | null = null;
    try {
      const gscConn = await base44.asServiceRole.connectors.getConnection('google_search_console');
      gscToken = gscConn.accessToken;
    } catch { gscToken = null; }
    try {
      const gaConn = await base44.asServiceRole.connectors.getConnection('google_analytics');
      gaToken = gaConn.accessToken;
    } catch { gaToken = null; }

    const results: any[] = [];

    // Process sites in batches of 6
    const batches = [];
    for (let i = 0; i < sites.length; i += 6) {
      batches.push(sites.slice(i, i + 6));
    }

    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(async (site) => {
          const metric: any = {
            launched_site_id: site.id,
            site_name: site.name,
            date: targetDate,
            clicks: 0,
            impressions: 0,
            ctr: 0,
            avg_position: 0,
            sessions: 0,
            users: 0,
            pageviews: 0,
            gsc_synced: false,
            analytics_synced: false,
          };

          const errors: string[] = [];

          // Pull GSC data if connected
          if (site.gsc_connected && site.gsc_property_url && gscToken) {
            try {
              const encodedUrl = encodeURIComponent(site.gsc_property_url);
              const gscRes = await fetch(
                `${GSC_BASE}/sites/${encodedUrl}/searchAnalytics/query`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${gscToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    startDate,
                    endDate: targetDate,
                    dimensions: ["date"],
                    rowLimit: 5000,
                  }),
                  signal: AbortSignal.timeout(15000),
                }
              );
              if (gscRes.ok) {
                const gscData = await gscRes.json();
                const rows = gscData.rows || [];
                for (const row of rows) {
                  metric.clicks += row.clicks || 0;
                  metric.impressions += row.impressions || 0;
                }
                if (metric.impressions > 0) {
                  metric.ctr = metric.clicks / metric.impressions;
                }
                // Average position across rows
                const positions = rows.map((r: any) => r.position).filter((p: any) => typeof p === 'number');
                if (positions.length > 0) {
                  metric.avg_position = positions.reduce((a: number, b: number) => a + b, 0) / positions.length;
                }
                metric.gsc_synced = true;
              } else {
                const errText = await gscRes.text().catch(() => '');
                errors.push(`GSC ${gscRes.status}: ${errText.slice(0, 200)}`);
              }
            } catch (e: any) {
              errors.push(`GSC error: ${e.message}`);
            }
          }

          // Pull GA4 data if connected
          if (site.analytics_connected && site.analytics_property_id && gaToken) {
            try {
              const gaRes = await fetch(
                `${GA_BASE}/properties/${site.analytics_property_id}:runReport`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${gaToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    dateRanges: [{ startDate, endDate: targetDate }],
                    metrics: [
                      { name: "sessions" },
                      { name: "totalUsers" },
                      { name: "screenPageViews" },
                    ],
                  }),
                  signal: AbortSignal.timeout(15000),
                }
              );
              if (gaRes.ok) {
                const gaData = await gaRes.json();
                const totals = gaData?.totals?.[0]?.metricValues;
                if (totals) {
                  metric.sessions = parseInt(totals[0]?.value || '0', 10);
                  metric.users = parseInt(totals[1]?.value || '0', 10);
                  metric.pageviews = parseInt(totals[2]?.value || '0', 10);
                }
                metric.analytics_synced = true;
              } else {
                const errText = await gaRes.text().catch(() => '');
                errors.push(`GA ${gaRes.status}: ${errText.slice(0, 200)}`);
              }
            } catch (e: any) {
              errors.push(`GA error: ${e.message}`);
            }
          }

          if (errors.length > 0) {
            metric.error = errors.join('; ');
          }

          // Upsert: check if a metric already exists for this site+date
          const existing = await base44.asServiceRole.entities.SiteMetric.filter(
            { launched_site_id: site.id, date: targetDate },
            { limit: 1 }
          );
          if (existing.items && existing.items.length > 0) {
            await base44.asServiceRole.entities.SiteMetric.update(existing.items[0].id, metric);
          } else {
            await base44.asServiceRole.entities.SiteMetric.create(metric);
          }

          // Update the LaunchedSite's last_synced_at
          await base44.asServiceRole.entities.LaunchedSite.update(site.id, {
            last_synced_at: new Date().toISOString(),
          });

          return { site: site.name, gsc: metric.gsc_synced, analytics: metric.analytics_synced };
        })
      );
      for (const r of batchResults) {
        if (r.status === 'fulfilled') results.push(r.value);
        else results.push({ error: r.reason?.message || 'failed' });
      }
    }

    return Response.json({
      synced: results.length,
      date: targetDate,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}