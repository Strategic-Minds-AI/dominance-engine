import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Rocket, Factory, Wand2, Search, Network, Share2, TrendingUp,
  RefreshCw, Loader2, CheckCircle2, AlertTriangle, X, Plus, ArrowRight, Upload,
} from "lucide-react";
import { METROS } from "@/data/dominanceRegistry";
import { PIPELINE_STAGES, CITATION_DIRECTORIES } from "@/data/pipelineLibrary";

const STAGE_ICONS = { RefreshCw, Factory, Wand2, Search, Network, Share2, TrendingUp };

export default function Pipeline() {
  const [baseId, setBaseId] = useState("");
  const [metros, setMetros] = useState([]); // string[] "City, ST"
  const [metroInput, setMetroInput] = useState("");
  const [submitGsc, setSubmitGsc] = useState(true);
  const [submitCitations, setSubmitCitations] = useState(true);
  const [result, setResult] = useState(null);

  const { data: websites } = useQuery({
    queryKey: ["dd-websites-pipeline"],
    queryFn: async () =>
      (await base44.entities.Website.filter({}, { sort: "-created_date", limit: 50 })).items,
  });

  const base = useMemo(
    () => (websites || []).find((w) => w.id === baseId),
    [websites, baseId]
  );

  const run = useMutation({
    mutationFn: async (payload) => {
      const res = await base44.functions.invoke("runProgrammaticPipeline", payload);
      return res?.data;
    },
    onSuccess: (data) => setResult(data),
  });

  const ping = useMutation({
    mutationFn: async (ids) => {
      const res = await base44.functions.invoke("pingIndex", { website_ids: ids });
      return res?.data;
    },
  });

  const addMetro = (m) => {
    const v = (m || "").trim();
    if (!v) return;
    if (!metros.includes(v)) setMetros([...metros, v]);
    setMetroInput("");
  };
  const removeMetro = (m) => setMetros(metros.filter((x) => x !== m));

  const handleCsv = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      // skip a header row if it looks like one
      const filtered = lines.filter((l) => !/^(city|metro|location)/i.test(l));
      const parsed = filtered
        .map((l) => {
          const cols = l.split(",").map((c) => c.trim());
          if (cols.length >= 2) return `${cols[0]}, ${cols[1]}`;
          return cols[0];
        })
        .filter(Boolean);
      setMetros((prev) => [...new Set([...prev, ...parsed])]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const canRun = baseId && metros.length > 0 && !run.isPending;

  const handleRun = () => {
    setResult(null);
    run.mutate({
      base_website_id: baseId,
      target_metros: metros,
      options: {
        submit_search_console: submitGsc,
        submit_citations: submitCitations,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight flex items-center gap-2">
          <Rocket className="h-6 w-6 text-[#00d4ff]" /> Programmatic{" "}
          <span className="text-[#00d4ff]">Pipeline</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Clone a verified base site across hundreds of metros — mutate content, NAP &amp; schema
          per location, generate sitemaps, and queue Google Search Console + citation submission.
        </p>
      </div>

      {/* Pipeline stages roadmap */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">
          Pipeline Stages
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_STAGES.map((s) => {
            const Icon = STAGE_ICONS[s.icon] || Rocket;
            return (
              <div
                key={s.id}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00f2ff]/15 text-xs text-[#00f2ff]">
                    {s.id}
                  </span>
                  <Icon className="h-4 w-4 text-[#00f2ff]" />
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-white/40">{s.desc}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-wider text-[#00d4ff]/70">
                  Gate: {s.gate}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Config */}
        <div className="lg:col-span-2 space-y-4">
          {/* Base site */}
          <div className="dd-panel rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              <Factory className="h-4 w-4 text-[#00f2ff]" /> 1 · Base Website
            </h2>
            <p className="mt-1 text-xs text-white/40">
              Pick a site generated in the Website Factory. The pipeline clones &amp; mutates it.
            </p>
            {websites?.length ? (
              <select
                value={baseId}
                onChange={(e) => setBaseId(e.target.value)}
                className="dd-input mt-3"
              >
                <option value="">Select a base website…</option>
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.service} · {w.primary_city || w.metro} ({w.status})
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200/80">
                No websites yet.{" "}
                <Link to="/admin/website-factory" className="underline">
                  Generate a base site first
                </Link>
                .
              </div>
            )}
            {base && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <Info label="Service" value={base.service} />
                <Info label="Base city" value={base.primary_city || base.metro} />
                <Info label="Pattern" value={base.pattern} />
                <Info label="Compliance" value={`${base.google_compliance_score ?? "—"}/100`} />
              </div>
            )}
          </div>

          {/* Target metros */}
          <div className="dd-panel rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              <Network className="h-4 w-4 text-[#00f2ff]" /> 2 · Target Locations
            </h2>
            <p className="mt-1 text-xs text-white/40">
              Add metros to clone into. Max 250 per run. Each gets a unique domain, mutated content,
              sitemap &amp; jobs.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={metroInput}
                onChange={(e) => setMetroInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMetro(metroInput)}
                placeholder="City, ST  (e.g. Austin, TX)"
                className="dd-input"
              />
              <button
                onClick={() => addMetro(metroInput)}
                className="shrink-0 rounded-lg border border-[#00f2ff]/40 bg-[#00f2ff]/10 px-3 text-sm text-[#00f2ff] hover:bg-[#00f2ff]/20"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3 py-1.5 text-xs text-white/50 hover:border-[#00f2ff]/40 hover:text-[#00f2ff]">
              <Upload className="h-3.5 w-3.5" /> Bulk import CSV (city, state)
              <input type="file" accept=".csv,.txt" onChange={handleCsv} className="hidden" />
            </label>

            {/* Quick add from registry */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {METROS.slice(0, 12).map((m) => (
                <button
                  key={m.city}
                  onClick={() => addMetro(`${m.city}, ${m.state}`)}
                  disabled={metros.includes(`${m.city}, ${m.state}`)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/60 hover:border-[#00f2ff]/40 hover:text-[#00f2ff] disabled:opacity-30"
                >
                  + {m.city}
                </button>
              ))}
            </div>

            {/* Selected metros */}
            {metros.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {metros.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 rounded-full border border-[#00f2ff]/30 bg-[#00f2ff]/10 px-2.5 py-1 text-xs text-white"
                  >
                    {m}
                    <button onClick={() => removeMetro(m)} className="text-white/50 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-white/40">{metros.length} location(s) selected</p>
          </div>

          {/* Options */}
          <div className="dd-panel rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              <Share2 className="h-4 w-4 text-[#00f2ff]" /> 3 · Distribution
            </h2>
            <div className="mt-3 space-y-2">
              <Toggle
                checked={submitGsc}
                onChange={setSubmitGsc}
                label="Submit sitemaps to Google Search Console"
                hint="Queues GSC jobs (live submit when connector authorized)"
              />
              <Toggle
                checked={submitCitations}
                onChange={setSubmitCitations}
                label={`Submit NAP to ${CITATION_DIRECTORIES.length} citation directories`}
                hint="Queues citation jobs (live posting needs credentials)"
              />
            </div>
          </div>
        </div>

        {/* Run panel */}
        <div className="space-y-4">
          <div className="dd-panel rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              <Rocket className="h-4 w-4 text-[#00f2ff]" /> Run Pipeline
            </h2>
            <div className="mt-3 space-y-1.5 text-xs">
              <Row label="Base site" value={base ? base.name : "—"} />
              <Row label="Target metros" value={metros.length} />
              <Row label="Sitemaps" value={submitGsc ? `${metros.length}` : "0"} />
              <Row label="Citation jobs" value={submitCitations ? `${metros.length}` : "0"} />
            </div>
            <button
              onClick={handleRun}
              disabled={!canRun}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#00d4ff] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#00f2ff] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {run.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Running pipeline…
                </>
              ) : (
                <>
                  Launch Rollout <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            {!canRun && !run.isPending && (
              <p className="mt-2 text-center text-[11px] text-white/40">
                Select a base site and at least one metro.
              </p>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="dd-panel rounded-xl p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
                  Rollout Complete
                </h2>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat label="Websites" value={result.websites_created} />
                <Stat label="Pages" value={result.pages_created} />
                <Stat label="Sitemaps" value={result.sitemaps_generated} />
                <Stat label="Jobs" value={result.jobs_created} />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-white/50">{result.note}</p>
              {result.errors?.length > 0 && (
                <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] text-amber-200/80">
                  <div className="flex items-center gap-1 font-semibold">
                    <AlertTriangle className="h-3 w-3" /> {result.errors.length} error(s)
                  </div>
                  <ul className="mt-1 list-disc pl-4">
                    {result.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>{e.metro}: {e.error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.created_site_ids?.length > 0 && (
                <button
                  onClick={() => ping.mutate(result.created_site_ids)}
                  disabled={ping.isPending}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#00f2ff]/40 bg-[#00f2ff]/10 px-3 py-2 text-xs font-semibold text-[#00f2ff] hover:bg-[#00f2ff]/20 disabled:opacity-50"
                >
                  {ping.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pinging IndexNow…
                    </>
                  ) : (
                    <>
                      <Search className="h-3.5 w-3.5" /> Ping IndexNow (Bing + Yandex)
                    </>
                  )}
                </button>
              )}
              {ping.data && (
                <p className="mt-2 text-[11px] text-emerald-300">
                  Pinged {ping.data.pinged} site(s) · {ping.data.sites_with_at_least_one_ok} reached an indexer. Host each key file at its keyFileUrl to validate.
                </p>
              )}
              <Link
                to="/admin/provisioning"
                className="mt-3 flex items-center gap-1.5 text-xs text-[#00d4ff] hover:underline"
              >
                View queued jobs <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="truncate text-xs font-medium text-white">{value || "—"}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="text-2xl font-bold text-[#00d4ff]">{value}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-left hover:border-[#00f2ff]/30"
    >
      <span
        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${
          checked ? "bg-[#00d4ff]" : "bg-white/15"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`}
        />
      </span>
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="block text-[11px] text-white/40">{hint}</span>
      </span>
    </button>
  );
}