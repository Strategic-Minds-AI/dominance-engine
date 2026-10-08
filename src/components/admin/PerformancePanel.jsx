import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingUp, MousePointerClick, Eye, Users, Gauge, RefreshCw } from "lucide-react";

export default function PerformancePanel() {
  const { data: metrics, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["dd-site-metrics-latest"],
    queryFn: async () => {
      const { items } = await base44.entities.SiteMetric.filter(
        {},
        { sort: "-date", limit: 50 }
      );
      return items;
    },
  });

  const queryClient = useQueryClient();
  const [syncing, setSyncing] = React.useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke("syncAnalytics", {});
      await queryClient.invalidateQueries({ queryKey: ["dd-site-metrics-latest"] });
    } catch (e) {
      console.error("Sync failed:", e);
    } finally {
      setSyncing(false);
    }
  };

  const latest = metrics || [];
  const totalClicks = latest.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalImpressions = latest.reduce((s, m) => s + (m.impressions || 0), 0);
  const totalSessions = latest.reduce((s, m) => s + (m.sessions || 0), 0);
  const totalUsers = latest.reduce((s, m) => s + (m.users || 0), 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const sitesWithGsc = latest.filter((m) => m.gsc_synced).length;
  const sitesWithGa = latest.filter((m) => m.analytics_synced).length;

  const lastDate = latest[0]?.date;

  return (
    <div className="dd-panel rounded-xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <TrendingUp className="h-4 w-4 text-[#00f2ff]" /> Performance Sync
        </h2>
        <button
          onClick={handleSync}
          disabled={syncing || isFetching}
          className="flex items-center gap-1.5 rounded-lg border border-[#00f2ff]/30 bg-[#00f2ff]/5 px-3 py-1.5 text-xs font-medium text-[#00f2ff] transition hover:bg-[#00f2ff]/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing || isFetching ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {lastDate && (
        <p className="mt-1 text-xs text-white/40">
          Latest data: {lastDate} · {sitesWithGsc} GSC · {sitesWithGa} Analytics connected
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric icon={MousePointerClick} label="Clicks" value={totalClicks} color="text-[#00d4ff]" />
        <Metric icon={Eye} label="Impressions" value={totalImpressions} color="text-white" />
        <Metric icon={Gauge} label="Avg CTR" value={`${avgCtr.toFixed(1)}%`} color="text-emerald-400" />
        <Metric icon={TrendingUp} label="Sessions" value={totalSessions} color="text-[#00d4ff]" />
        <Metric icon={Users} label="Users" value={totalUsers} color="text-white" />
        <Metric icon={Eye} label="Pageviews" value={latest.reduce((s, m) => s + (m.pageviews || 0), 0)} color="text-white" />
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : latest.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
          No performance data yet. Click "Sync Now" to pull the latest GSC + Analytics data, or wait for the daily 9am ET auto-sync.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40">
                <th className="py-2 pr-4 font-medium">Site</th>
                <th className="py-2 px-3 text-right font-medium">Clicks</th>
                <th className="py-2 px-3 text-right font-medium">Impr.</th>
                <th className="py-2 px-3 text-right font-medium">CTR</th>
                <th className="py-2 px-3 text-right font-medium">Sessions</th>
                <th className="py-2 px-3 text-right font-medium">Users</th>
                <th className="py-2 pl-3 text-center font-medium">Sources</th>
              </tr>
            </thead>
            <tbody>
              {latest.slice(0, 10).map((m) => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-4 font-medium text-white/80 truncate max-w-[180px]">{m.site_name || m.launched_site_id}</td>
                  <td className="py-2.5 px-3 text-right text-white/70">{m.clicks || 0}</td>
                  <td className="py-2.5 px-3 text-right text-white/70">{(m.impressions || 0).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-white/70">{m.ctr ? `${(m.ctr * 100).toFixed(1)}%` : '—'}</td>
                  <td className="py-2.5 px-3 text-right text-white/70">{m.sessions || 0}</td>
                  <td className="py-2.5 px-3 text-right text-white/70">{m.users || 0}</td>
                  <td className="py-2.5 pl-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${m.gsc_synced ? 'bg-[#00f2ff]' : 'bg-white/10'}`} title="GSC" />
                      <span className={`h-1.5 w-1.5 rounded-full ${m.analytics_synced ? 'bg-emerald-400' : 'bg-white/10'}`} title="GA" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-1 text-lg font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </div>
  );
}