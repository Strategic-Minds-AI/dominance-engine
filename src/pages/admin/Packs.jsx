import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Package, Plus, Loader2, Smartphone, Globe, Palette, Layout, Boxes } from "lucide-react";

const TYPES = [
  { key: "app_pack", icon: Smartphone, label: "App Pack" },
  { key: "web_pack", icon: Globe, label: "Web Pack" },
  { key: "logo_pack", icon: Palette, label: "Logo Pack" },
  { key: "website", icon: Layout, label: "Full Website" },
  { key: "system", icon: Boxes, label: "System" },
];

export default function Packs() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", type: "web_pack", description: "", tags: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const { data: packs } = useQuery({
    queryKey: ["dd-packs"],
    queryFn: async () => (await base44.entities.Pack.filter({}, { sort: "-created_date", limit: 50 })).items,
  });

  const create = async () => {
    if (!form.name) { setErr("Name required."); return; }
    setBusy(true); setErr("");
    try {
      await base44.entities.Pack.create({
        name: form.name,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        type: form.type,
        description: form.description,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        contents: [],
        status: "draft",
      });
      setForm({ name: "", type: "web_pack", description: "", tags: "" });
      setShow(false);
      qc.invalidateQueries({ queryKey: ["dd-packs"] });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
            <Package className="h-6 w-6 text-[#00f2ff]" /> Packs
          </h1>
          <p className="mt-1 text-sm text-white/50">App packs, web packs, logo packs, full multi-page websites, and systems.</p>
        </div>
        <button onClick={() => setShow(!show)} className="inline-flex items-center gap-2 rounded-lg bg-[#00f2ff] px-4 py-2 text-sm font-bold text-black hover:bg-[#00d4ff]">
          <Plus className="h-4 w-4" /> New pack
        </button>
      </div>

      {err && <p className="text-xs text-red-300">{err}</p>}

      {show && (
        <div className="dd-panel rounded-xl p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/40">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="dd-input mt-1" placeholder="Epoxy Pro Web Pack" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-white/40">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="dd-input mt-1">
                {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="dd-input mt-1" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="dd-input mt-1" placeholder="epoxy, flooring, florida" />
            </div>
          </div>
          <button onClick={create} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#00f2ff] px-4 py-2 text-sm font-bold text-black hover:bg-[#00d4ff] disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create pack
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(packs || []).map((p) => {
          const t = TYPES.find((x) => x.key === p.type);
          const Icon = t?.icon || Package;
          return (
            <div key={p.id} className="dd-panel rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-[#00f2ff]" />
                <span className="font-medium">{p.name}</span>
              </div>
              <p className="mt-2 text-xs text-white/50">{p.description || "No description"}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-white/40">{t?.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === "published" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/40"}`}>{p.status}</span>
              </div>
              {p.tags && p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.tags.map((tag) => <span key={tag} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">{tag}</span>)}
                </div>
              )}
            </div>
          );
        })}
        {(!packs || !packs.length) && <div className="col-span-full py-10 text-center text-sm text-white/30">No packs yet.</div>}
      </div>
    </div>
  );
}