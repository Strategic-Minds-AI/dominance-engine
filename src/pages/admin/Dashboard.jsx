import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Radar, Factory, Eye, Server, RefreshCw, Package, Activity, Layers, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";
import { SWARM_AGENTS, SCALE_STAGES } from "@/data/dominanceRegistry";
import PerformancePanel from "@/components/admin/PerformancePanel";

function StatCard({ icon: Icon, label, value, to, accent }) {
  return (
    <Link to={to} className="dd-panel rounded-xl p-4 hover:border-[#00f2ff]/40 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-white/50">{label}</span>
        <Icon className="h-4 w-4 text-[#00f2ff]" />
      </div>
      <div className={`mt-2 text-3xl font-bold ${accent || "text-white"}`}>{value}</div>
    </Link>
  );
}

export default function Dashboard() {
  const { data: sites } = useQuery({
    queryKey: ["dd-websites"],
    queryFn: async () => (await base44.entities.Website.filter({}, { sort: "-created_date", limit: 50 })).items,
  });
  const { data: opps } = useQuery({
    queryKey: ["dd-opps"],
    queryFn: async () => (await base44.entities.Opportunity.filter({}, { sort: "-created_date", limit: 50 })).items,
  });
  const { data: jobs } = useQuery({
    queryKey: ["dd-jobs"],
    queryFn: async () => (await base44.entities.ProvisioningJob.filter({}, { sort: "-created_date", limit: 50 })).items,
  });

  const published = (sites || []).filter((s) => s.status === "published").length;
  const previewReady = (sites || []).filter((s) => s.status === "preview_ready").length;
  const queued = (sites || []).filter((s) => s.status === "queued").length;
  const pendingJobs = (jobs || []).filter((j) => j.status === "pending" || j.status === "approval_required").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Command <span className="text-[#00d4ff]">Center</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Mission: maximize qualified lead value and speed-to-signal without promising rankings or violating Google spam policies.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Factory} label="Websites" value={sites?.length ?? "—"} to="/admin/website-factory" />
        <StatCard icon={Eye} label="Preview Ready" value={previewReady} to="/admin/preview" accent="text-[#00d4ff]" />
        <StatCard icon={Activity} label="Published" value={published} to="/admin/website-factory" accent="text-emerald-400" />
        <StatCard icon={Server} label="Pending Jobs" value={pendingJobs} to="/admin/provisioning" accent="text-amber-400" />
      </div>

      {/* Quick launch */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <Layers className="h-4 w-4 text-[#00f2ff]" /> Quick Launch
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: "/admin/opportunities", icon: Radar, label: "Score an opportunity", desc: "Service × metro × intent" },
            { to: "/admin/website-factory", icon: Factory, label: "Generate websites", desc: "Programmatic, Google-compliant" },
            { to: "/admin/preview", icon: Eye, label: "Preview before publish", desc: "Device-framed live view" },
            { to: "/admin/provisioning", icon: Server, label: "Provision stack", desc: "Supabase · Vercel · Railway · GoDaddy" },
            { to: "/admin/gpt-sync", icon: RefreshCw, label: "Sync ChatGPT project", desc: "Source truth + skills" },
            { to: "/admin/packs", icon: Package, label: "Build packs", desc: "App · Web · Logo · System" },
          ].map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-[#00f2ff]/40 hover:bg-[#00f2ff]/5">
              <Icon className="h-5 w-5 text-[#00f2ff]" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{label}</div>
                <div className="truncate text-xs text-white/40">{desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-[#00f2ff]" />
            </Link>
          ))}
        </div>
      </div>

      {/* Performance Sync */}
      <PerformancePanel />

      {/* Swarm + Scale */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="dd-panel rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
            <ShieldCheck className="h-4 w-4 text-[#00f2ff]" /> Swarm Agents
          </h2>
          <div className="mt-3 space-y-1.5">
            {SWARM_AGENTS.map((a) => (
              <div key={a.agent} className="flex items-center justify-between text-xs">
                <span className="text-white/80">{a.agent}</span>
                <span className="rounded bg-white/5 px-2 py-0.5 text-white/40">{a.role}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dd-panel rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
            <TrendingUp className="h-4 w-4 text-[#00f2ff]" /> Scale Expansion
          </h2>
          <div className="mt-3 space-y-2">
            {SCALE_STAGES.map((s) => (
              <div key={s.stage} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00f2ff]/15 text-xs text-[#00f2ff]">{s.stage}</span>
                  {s.scope}
                </div>
                <p className="mt-1 pl-7 text-xs text-white/40">Gate: {s.gate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}