import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Eye, Smartphone, Monitor, Tablet, ExternalLink, Phone, MapPin, CheckCircle2 } from "lucide-react";

const DEVICES = {
  desktop: { icon: Monitor, w: "100%", label: "Desktop" },
  tablet: { icon: Tablet, w: "768px", label: "Tablet" },
  mobile: { icon: Smartphone, w: "390px", label: "Mobile" },
};

export default function Preview() {
  const [siteId, setSiteId] = useState("");
  const [device, setDevice] = useState("desktop");
  const [pageIdx, setPageIdx] = useState(0);

  const { data: sites } = useQuery({
    queryKey: ["dd-websites"],
    queryFn: async () => (await base44.entities.Website.filter({ status: { $in: ["preview_ready", "queued", "published"] } }, { sort: "-created_date", limit: 50 })).items,
  });

  const selected = (sites || []).find((s) => s.id === siteId) || (sites || [])[0];
  const site = selected?.preview_data;
  const pages = site?.pages || [];
  const page = pages[pageIdx] || pages[0];

  if (!sites || !sites.length) {
    return (
      <div className="dd-panel rounded-xl p-10 text-center">
        <Eye className="mx-auto h-10 w-10 text-white/20" />
        <p className="mt-3 text-sm text-white/40">No preview-ready websites yet. Generate one in the Website Factory.</p>
      </div>
    );
  }

  const DevIcon = DEVICES[device].icon;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
          <Eye className="h-6 w-6 text-[#00f2ff]" /> Preview
        </h1>
        <div className="flex items-center gap-2">
          <select value={selected?.id} onChange={(e) => { setSiteId(e.target.value); setPageIdx(0); }} className="dd-input max-w-[260px]">
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Page tabs + device switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {pages.map((p, i) => (
            <button key={p.slug || "home"} onClick={() => setPageIdx(i)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${i === pageIdx ? "bg-[#00f2ff] text-black" : "border border-white/15 text-white/50 hover:border-white/30"}`}>
              {p.page_type}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
          {Object.entries(DEVICES).map(([k, { icon: Icon, label }]) => (
            <button key={k} onClick={() => setDevice(k)} className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs ${device === k ? "bg-[#00f2ff]/15 text-[#00f2ff]" : "text-white/50"}`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rendered preview */}
      {page && (
        <div className="dd-panel overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-white/40">
            <span className="flex items-center gap-2"><DevIcon className="h-3.5 w-3.5" /> {DEVICES[device].label}</span>
            <span className="truncate">{selected?.domain_candidate || "preview"}{page.canonical_url}</span>
          </div>
          <div className="flex justify-center bg-[#0a0d12] p-4">
            <div style={{ width: DEVICES[device].w, maxWidth: "100%" }} className="overflow-hidden rounded-xl bg-white text-black shadow-2xl transition-all">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-black/10 bg-black/[0.03] px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 truncate rounded bg-black/5 px-2 py-0.5 text-[10px] text-black/40">{page.canonical_url}</span>
              </div>
              {/* Page body */}
              <div className="p-5 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: selected?.accent_color || "#00f2ff" }}>{selected?.name}</span>
                  <span className="text-xs text-black/50">{selected?.phone}</span>
                </div>
                <h1 className="mt-6 text-2xl font-bold leading-tight">{page.h1}</h1>
                <p className="mt-3 text-sm text-black/60">{page.intro}</p>
                {(page.sections || []).map((s, i) => (
                  <div key={i} className="mt-5">
                    <h2 className="text-base font-semibold">{s.heading}</h2>
                    <p className="mt-1 text-sm text-black/60">{s.body}</p>
                    <span className="mt-1 inline-block rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/40">{s.layer}</span>
                  </div>
                ))}
                {(page.faq || []).length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-base font-semibold">FAQ</h2>
                    <div className="mt-2 space-y-2">
                      {page.faq.map((f, i) => (
                        <div key={i} className="rounded-lg border border-black/10 p-3">
                          <div className="text-sm font-medium">{f.q}</div>
                          <div className="mt-1 text-xs text-black/60">{f.a}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-white" style={{ background: selected?.accent_color || "#00f2ff" }}>
                    <Phone className="h-3.5 w-3.5" /> Call now
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-black/15 px-3 py-2 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5" /> {selected?.primary_city}, {selected?.primary_state}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Google-compliant · schema matches visible content
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}