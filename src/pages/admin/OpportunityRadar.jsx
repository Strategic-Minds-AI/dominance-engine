import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CORE_SERVICES, METROS, INTENTS, PATTERNS, slugify, patternDomain } from "@/data/dominanceRegistry";
import { Radar, Plus, Loader2, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function OpportunityRadar() {
  const qc = useQueryClient();
  const [service, setService] = useState(CORE_SERVICES[0].name);
  const [metro, setMetro] = useState(METROS[0].name);
  const [intent, setIntent] = useState("transactional");
  const [pattern, setPattern] = useState("near_me");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const { data: opps } = useQuery({
    queryKey: ["dd-opps"],
    queryFn: async () => (await base44.entities.Opportunity.filter({}, { sort: "-opportunity_score", limit: 50 })).items,
  });

  const svc = CORE_SERVICES.find((s) => s.name === service);
  const mt = METROS.find((m) => m.name === metro);
  const score = useMemo(() => {
    if (!svc) return 0;
    const base = (svc.lead_value / 10 + (svc.emergency ? 10 : 5) + 8);
    const p = PATTERNS.find((x) => x.key === pattern);
    return Math.round(base * (p?.multiplier || 1) * (mt?.priority === "High" ? 1.1 : 1));
  }, [svc, mt, pattern]);

  const domain = patternDomain(svc?.slug, pattern);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      await base44.entities.Opportunity.create({
        service: svc.name,
        service_slug: svc.slug,
        vertical: svc.vertical,
        metro,
        intent,
        pattern,
        lead_value: svc.lead_value,
        urgency: svc.emergency ? 10 : 5,
        buyer_density: 8,
        est_monthly_search: svc.est_volume,
        opportunity_score: score,
        monetization_hypothesis: `${svc.name} in ${mt?.city || metro}; INTERNAL estimated lead value ${svc.lead_value}; needs verification`,
        buyer_archetype: svc.emergency ? "Emergency need-based" : "Comparison shopper",
        recommended_url: domain ? `https://${domain}` : `/${slugify(svc.slug)}/${slugify(mt?.state || "")}/${slugify(mt?.city || "")}`,
        domain_candidate: domain,
        status: "scored",
      });
      setMsg(`Saved opportunity (score ${score}).`);
      qc.invalidateQueries({ queryKey: ["dd-opps"] });
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
          <Radar className="h-6 w-6 text-[#00f2ff]" /> Opportunity <span className="text-[#00d4ff]">Radar</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">Create research candidates from internal planning assumptions. Validate real Google demand, buyers and fulfillment before approving a launch.</p>
      </div>

      {/* Builder */}
      <div className="dd-panel rounded-xl p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Service">
            <select value={service} onChange={(e) => setService(e.target.value)} className="dd-input">
              {CORE_SERVICES.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Metro">
            <select value={metro} onChange={(e) => setMetro(e.target.value)} className="dd-input">
              {METROS.map((m) => <option key={m.name} value={m.name}>{m.city}, {m.state}</option>)}
            </select>
          </Field>
          <Field label="Intent">
            <select value={intent} onChange={(e) => setIntent(e.target.value)} className="dd-input">
              {INTENTS.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
            </select>
          </Field>
          <Field label="Pattern">
            <select value={pattern} onChange={(e) => setPattern(e.target.value)} className="dd-input">
              {PATTERNS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="text-xs text-white/40">Modeled planning score</div>
            <div className="text-2xl font-bold text-[#00d4ff]">{score}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="text-xs text-white/40">Internal volume estimate*</div>
            <div className="text-2xl font-bold">{(svc?.est_volume || 0).toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="text-xs text-white/40">Domain candidate</div>
            <div className="truncate text-sm font-medium text-[#00d4ff]">{domain || "branded hub"}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#00f2ff] px-4 py-2 text-sm font-bold text-black hover:bg-[#00d4ff] disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save opportunity
          </button>
          {msg && <span className="text-xs text-emerald-400">{msg}</span>}
        </div>
      </div>

      <p className="text-xs text-amber-200/70">* Internal model only, not a provider-refreshed Google search volume. Scores are research prioritization, not index or launch approval.</p>

      {/* Queue */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <Search className="h-4 w-4 text-[#00f2ff]" /> Opportunity Queue
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-white/40">
                <th className="pb-2">Service</th><th className="pb-2">Metro</th><th className="pb-2">Intent</th><th className="pb-2">Score</th><th className="pb-2">Domain</th><th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {(opps || []).map((o) => (
                <tr key={o.id} className="border-t border-white/5">
                  <td className="py-2">{o.service}</td>
                  <td className="py-2 text-white/60">{o.metro}</td>
                  <td className="py-2 text-white/60">{o.intent}</td>
                  <td className="py-2 font-bold text-[#00d4ff]">{o.opportunity_score}</td>
                  <td className="py-2 text-white/60">{o.domain_candidate || "—"}</td>
                  <td className="py-2 text-right">
                    <Link to={`/admin/website-factory?service=${encodeURIComponent(o.service)}&metro=${encodeURIComponent(o.metro)}&intent=${o.intent}&pattern=${o.pattern}`} className="inline-flex items-center gap-1 text-xs text-[#00f2ff] hover:underline">
                      Build <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {(!opps || !opps.length) && (
                <tr><td colSpan={6} className="py-6 text-center text-white/30">No opportunities yet — score one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-widest text-white/40">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}