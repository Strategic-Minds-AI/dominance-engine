import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Server, Database, Cloud, Globe, HardDrive, ShieldAlert, Loader2, CheckCircle2, Clock, ExternalLink } from "lucide-react";

const TARGETS = [
  { key: "supabase", icon: Database, label: "Supabase", desc: "Provision Postgres + RLS + pgmq queues. Canonical runtime source truth.", action: "provision" },
  { key: "vercel", icon: Cloud, label: "Vercel", desc: "Deploy frontend. Preview + production environments.", action: "deploy" },
  { key: "railway", icon: Server, label: "Railway", desc: "Backend engines when a server runtime is needed.", action: "provision" },
  { key: "godaddy", icon: Globe, label: "GoDaddy", desc: "Purchase/connect domain. DNS configuration.", action: "purchase_domain" },
  { key: "google_drive", icon: HardDrive, label: "Google Drive", desc: "Sync source-truth workbooks + artifacts.", action: "sync_drive" },
];

const STATUS_STYLE = {
  success: "bg-emerald-500/15 text-emerald-300",
  running: "bg-[#00f2ff]/15 text-[#00d4ff]",
  pending: "bg-white/5 text-white/50",
  failed: "bg-red-500/15 text-red-300",
  approval_required: "bg-amber-500/15 text-amber-300",
};

export default function Provisioning() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const { data: sites } = useQuery({
    queryKey: ["dd-websites"],
    queryFn: async () => (await base44.entities.Website.filter({}, { sort: "-created_date", limit: 50 })).items,
  });
  const { data: jobs } = useQuery({
    queryKey: ["dd-jobs"],
    queryFn: async () => (await base44.entities.ProvisioningJob.filter({}, { sort: "-created_date", limit: 50 })).items,
  });

  const requestJob = async (targetKey) => {
    const t = TARGETS.find((x) => x.key === targetKey);
    setBusy(targetKey); setMsg("");
    try {
      await base44.entities.ProvisioningJob.create({
        website_id: "",
        website_name: "(stack bootstrap)",
        target: targetKey,
        action: t.action,
        status: "approval_required",
        approval_required: true,
        log: `Requested ${t.label} ${t.action}. Awaiting operator approval (protected action).`,
      });
      setMsg(`${t.label} job queued — approval required.`);
      qc.invalidateQueries({ queryKey: ["dd-jobs"] });
    } catch (e) { setMsg(e.message); }
    setBusy("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
          <Server className="h-6 w-6 text-[#00f2ff]" /> Provisioning
        </h1>
        <p className="mt-1 text-sm text-white/50">Automated provisioning to Supabase, Vercel, Railway, GoDaddy &amp; Google Drive. All live actions are approval-gated protected actions.</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>Live provisioning needs API credentials (set as secrets) and integration credits. Your workspace credits are exhausted until 2026-10-12 — jobs queue as approval-required and execute once credits and credentials are in place.</span>
      </div>

      {/* Targets */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TARGETS.map(({ key, icon: Icon, label, desc }) => (
          <div key={key} className="dd-panel rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-[#00f2ff]" />
              <span className="font-semibold">{label}</span>
            </div>
            <p className="mt-2 text-xs text-white/50">{desc}</p>
            <button onClick={() => requestJob(key)} disabled={busy === key} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#00f2ff]/40 bg-[#00f2ff]/5 px-3 py-1.5 text-xs font-medium text-[#00f2ff] hover:bg-[#00f2ff]/10 disabled:opacity-50">
              {busy === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />} Request {label}
            </button>
          </div>
        ))}
      </div>
      {msg && <p className="text-xs text-emerald-400">{msg}</p>}

      {/* Jobs */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Provisioning jobs</h2>
        <div className="mt-3 space-y-2">
          {(jobs || []).map((j) => (
            <div key={j.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{j.target}</span>
                  <span className="text-white/40">·</span>
                  <span className="text-white/60">{j.action}</span>
                  {j.website_name && j.website_name !== "(stack bootstrap)" && <span className="text-white/40">· {j.website_name}</span>}
                </div>
                <div className="mt-0.5 truncate text-xs text-white/40">{j.log}</div>
              </div>
              <div className="flex items-center gap-2">
                {j.external_url && <a href={j.external_url} target="_blank" rel="noopener" className="text-[#00f2ff] hover:underline"><ExternalLink className="h-3.5 w-3.5" /></a>}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[j.status] || STATUS_STYLE.pending}`}>{j.status?.toUpperCase()}</span>
              </div>
            </div>
          ))}
          {(!jobs || !jobs.length) && <div className="py-6 text-center text-sm text-white/30">No provisioning jobs yet.</div>}
        </div>
      </div>

      {/* Fleet readiness */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Fleet readiness</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {["draft", "preview_ready", "queued", "published"].map((st) => {
            const n = (sites || []).filter((s) => s.status === st).length;
            return (
              <div key={st} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="text-xs text-white/40">{st.replace("_", " ")}</div>
                <div className="text-2xl font-bold">{n}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}