import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CORE_SERVICES, METROS, INTENTS, PATTERNS, slugify, patternDomain, GOOGLE_RULES, PROGRAMMATIC_SEO_GATES } from "@/data/dominanceRegistry";
import { Factory, Loader2, Eye, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Globe, Search } from "lucide-react";

const PAGE_TYPES = [
  { key: "home", label: "Home" },
  { key: "service", label: "Service" },
  { key: "location", label: "Location" },
  { key: "guide", label: "Cost Guide" },
  { key: "faq", label: "FAQ" },
  { key: "contact", label: "Contact" },
];

export default function WebsiteFactory() {
  const qc = useQueryClient();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    service: params.get("service") || CORE_SERVICES[0].name,
    metro: params.get("metro") || METROS[0].name,
    intent: params.get("intent") || "transactional",
    pattern: params.get("pattern") || "near_me",
    company_name: "",
    phone: "",
    email: "",
    accent_color: "#00f2ff",
    page_types: ["home", "service", "location", "guide", "faq", "contact"],
    enhance: false,
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [domainSearch, setDomainSearch] = useState(null);
  const [domainSearching, setDomainSearching] = useState(false);

  const { data: sites } = useQuery({
    queryKey: ["dd-websites"],
    queryFn: async () => (await base44.entities.Website.filter({}, { sort: "-created_date", limit: 50 })).items,
  });

  const svc = CORE_SERVICES.find((s) => s.name === form.service);
  const mt = METROS.find((m) => m.name === form.metro);
  const domain = patternDomain(svc?.slug, form.pattern);

  const searchDomain = async () => {
    if (!domain) return;
    setDomainSearching(true); setDomainSearch(null);
    try {
      const res = await base44.functions.invoke("DomainLookup", { domain });
      setDomainSearch(res.data || res);
    } catch (e) {
      setDomainSearch({ error: e.message });
    } finally { setDomainSearching(false); }
  };

  const togglePage = (key) =>
    setForm((f) => ({
      ...f,
      page_types: f.page_types.includes(key) ? f.page_types.filter((p) => p !== key) : [...f.page_types, key],
    }));

  const generate = async () => {
    if (!form.page_types.length) { setErr("Select at least one page type."); return; }
    setBusy(true); setErr(""); setResult(null);
    try {
      const res = await base44.functions.invoke("generateWebsite", {
        service: form.service,
        metro: form.metro,
        city: mt?.city || "",
        state: mt?.state || "",
        intent: form.intent,
        pattern: form.pattern,
        brand: {
          company_name: form.company_name,
          phone: form.phone,
          email: form.email,
          accent_color: form.accent_color,
        },
        page_types: form.page_types,
        enhance: form.enhance,
      });
      const d = res.data || res;
      if (d.error) throw new Error(d.error);
      setResult(d);

      // Persist the website + pages
      const siteName = form.company_name || `${svc.name} ${mt?.city || ""}`;
      const siteSlug = slugify(`${svc?.slug}-${mt?.city || ""}-${form.pattern}`);
      const created = await base44.entities.Website.create({
        name: siteName,
        slug: siteSlug,
        service: svc.name,
        service_slug: svc?.slug,
        vertical: svc?.vertical,
        metro: form.metro,
        intent: form.intent,
        pattern: form.pattern,
        domain_candidate: domain,
        domain_status: "not_checked",
        company_name: form.company_name,
        phone: form.phone,
        email: form.email,
        primary_city: mt?.city,
        primary_state: mt?.state,
        accent_color: form.accent_color,
        page_count: d.site.pages.length,
        google_compliance_score: d.compliance_score,
        differentiation_score: d.differentiation_score,
        status: "preview_ready",
        preview_data: d.site,
        launch_mode: "manual",
      });
      // Persist pages
      await base44.entities.GeneratedPage.bulkCreate(
        d.site.pages.map((p) => ({
          website_id: created.id,
          website_name: siteName,
          slug: p.slug,
          page_type: p.page_type,
          title: p.title,
          h1: p.h1,
          meta_description: p.meta_description,
          intro: p.intro,
          sections: p.sections,
          faq: p.faq,
          schema_json: p.schema_json,
          intent: p.intent,
          canonical_url: p.canonical_url,
          compliance_flags: p.compliance_flags,
          differentiation_layers: p.differentiation_layers,
          status: "generated",
        }))
      );
      qc.invalidateQueries({ queryKey: ["dd-websites"] });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
          <Factory className="h-6 w-6 text-[#00f2ff]" /> Website <span className="text-[#00d4ff]">Factory</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">Generate Google-compliant websites programmatically. Every page passes the workbook gates before it can publish.</p>
      </div>

      {err && <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"><AlertTriangle className="h-4 w-4" /> {err}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Config */}
        <div className="dd-panel rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">1 · Configure</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Service">
              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="dd-input">
                {CORE_SERVICES.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Metro">
              <select value={form.metro} onChange={(e) => setForm({ ...form, metro: e.target.value })} className="dd-input">
                {METROS.map((m) => <option key={m.name} value={m.name}>{m.city}, {m.state}</option>)}
              </select>
            </Field>
            <Field label="Intent">
              <select value={form.intent} onChange={(e) => setForm({ ...form, intent: e.target.value })} className="dd-input">
                {INTENTS.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
              </select>
            </Field>
            <Field label="Pattern">
              <select value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} className="dd-input">
                {PATTERNS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Company name"><input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Optional brand" className="dd-input" /></Field>
            <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 555-5555" className="dd-input" /></Field>
            <Field label="Email"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="hello@..." className="dd-input" /></Field>
            <Field label="Accent"><input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="h-10 w-full rounded-lg border border-white/10 bg-transparent" /></Field>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-widest text-white/40">Pages</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PAGE_TYPES.map((p) => (
                <button key={p.key} onClick={() => togglePage(p.key)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${form.page_types.includes(p.key) ? "bg-[#00f2ff] text-black" : "border border-white/15 text-white/50 hover:border-white/30"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-white/60">
            <input type="checkbox" checked={form.enhance} onChange={(e) => setForm({ ...form, enhance: e.target.checked })} />
            Enhance copy with AI (requires integration credits — currently exhausted until 2026-10-12)
          </label>

          <button onClick={generate} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00f2ff] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#00d4ff] disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate website
          </button>
        </div>

        {/* Result + gates */}
        <div className="space-y-4">
          <div className="dd-panel rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              <ShieldCheck className="h-4 w-4 text-[#00f2ff]" /> 2 · Google-compliance gates
            </h2>
            {result ? (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Score label="Compliance" value={result.compliance_score} />
                  <Score label="Differentiation" value={result.differentiation_score} />
                </div>
                <div className="space-y-1">
                  {result.compliance_checks.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      {c.pass ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                      <span className={c.pass ? "text-white/70" : "text-amber-300"}>{c.name}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-white/50">
                  <div className="font-semibold text-white/70">Programmatic SEO gates</div>
                  {PROGRAMMATIC_SEO_GATES.map((g) => (
                    <div key={g.control} className="mt-1 flex gap-2"><CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" /><span>{g.control}: {g.spec}</span></div>
                  ))}
                </div>
                <Link to="/admin/preview" className="inline-flex items-center gap-2 rounded-lg border border-[#00f2ff]/40 bg-[#00f2ff]/5 px-4 py-2 text-sm font-medium text-[#00f2ff] hover:bg-[#00f2ff]/10">
                  <Eye className="h-4 w-4" /> Preview generated site
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/40">Configure and generate to see the gate results. Generation is deterministic and works without credits.</p>
            )}
          </div>

          <div className="dd-panel rounded-xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Domain candidate</h2>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-[#00f2ff]" />
              <span className="font-medium text-[#00d4ff]">{domain || "branded hub"}</span>
            </div>
            <p className="mt-1 text-xs text-white/40">Availability, trademark, licensing, and history must be verified before acquisition (URL Naming Rules).</p>
            <button onClick={searchDomain} disabled={domainSearching || !domain} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#00f2ff]/40 bg-[#00f2ff]/5 px-4 py-2 text-sm font-medium text-[#00f2ff] hover:bg-[#00f2ff]/10 disabled:opacity-40">
              {domainSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Run Full URL Name Search
            </button>
            {domainSearch && (
              <div className={`mt-3 rounded-lg border p-3 text-sm ${domainSearch.error ? "border-red-500/30 bg-red-500/5 text-red-300" : domainSearch.available ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : "border-amber-500/30 bg-amber-500/5 text-amber-300"}`}>
                {domainSearch.error ? (
                  <><AlertTriangle className="inline h-4 w-4 mr-1" /> {domainSearch.error}</>
                ) : domainSearch.available ? (
                  <><CheckCircle2 className="inline h-4 w-4 mr-1" /> Available{domainSearch.price ? ` — $${domainSearch.price}/yr` : ""}{domainSearch.source ? ` via ${domainSearch.source}` : ""}</>
                ) : (
                  <><AlertTriangle className="inline h-4 w-4 mr-1" /> Not available{domainSearch.alternatives?.length ? ` — try: ${domainSearch.alternatives.join(", ")}` : ""}</>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fleet */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Generated fleet</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(sites || []).map((s) => (
            <div key={s.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-white/40">{s.service} · {s.primary_city}, {s.primary_state}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.status === "published" ? "bg-emerald-500/15 text-emerald-300" : s.status === "preview_ready" ? "bg-[#00f2ff]/15 text-[#00d4ff]" : "bg-white/5 text-white/40"}`}>{s.status?.toUpperCase()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-white/50">{s.page_count} pages</span>
                <span className="text-[#00d4ff]">Compliance {s.google_compliance_score ?? "—"}</span>
              </div>
              {s.domain_candidate && <div className="mt-1 truncate text-xs text-white/40">{s.domain_candidate}</div>}
            </div>
          ))}
          {(!sites || !sites.length) && <div className="col-span-full py-6 text-center text-sm text-white/30">No websites generated yet.</div>}
        </div>
      </div>
    </div>
  );
}

function Score({ label, value }) {
  const color = value >= 80 ? "text-emerald-400" : value >= 60 ? "text-[#00d4ff]" : "text-amber-400";
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="text-xs text-white/40">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
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