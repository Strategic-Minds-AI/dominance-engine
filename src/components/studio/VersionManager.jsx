import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ExternalLink, Star, StarOff, Archive, Plus } from "lucide-react";

const slugify = (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function VersionManager({ versions, packs, loading, preselectPackId, onChanged }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [packId, setPackId] = useState(preselectPackId || "");
  const [live, setLive] = useState(true);
  const [primary, setPrimary] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  React.useEffect(() => { if (preselectPackId) setPackId(preselectPackId); }, [preselectPackId]);

  const approved = packs.filter((p) => p.status === "approved");

  const create = async () => {
    if (!name || !packId) return;
    setBusy(true); setErr("");
    try {
      const s = slug || slugify(name);
      if (primary) {
        await base44.entities.SiteVersion.updateMany({ is_primary: true }, { $set: { is_primary: false } });
      }
      await base44.entities.SiteVersion.create({
        name, slug: s, template_pack_id: packId,
        status: live ? "live" : "draft", is_primary: !!primary,
        description: "", config: "{}",
      });
      setName(""); setSlug(""); setPrimary(false); setLive(true);
      onChanged?.();
    } catch (e) {
      setErr(e?.message || "create failed");
    } finally {
      setBusy(false);
    }
  };

  const setPrimaryFor = async (v) => {
    setBusy(true);
    try {
      await base44.entities.SiteVersion.updateMany({ is_primary: true }, { $set: { is_primary: false } });
      await base44.entities.SiteVersion.update(v.id, { is_primary: true });
      onChanged?.();
    } catch (e) { setErr(e?.message); } finally { setBusy(false); }
  };

  const toggleLive = async (v) => {
    const status = v.status === "live" ? "archived" : "live";
    try { await base44.entities.SiteVersion.update(v.id, { status }); onChanged?.(); } catch (e) { setErr(e?.message); }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2 border border-border p-6">
        <h4 className="font-heading text-xl mb-1">New version</h4>
        <p className="text-xs text-muted-foreground mb-5">Each version goes live at its own URL <code className="bg-secondary px-1">/v/slug</code>. Mark one primary to render it at the site root.</p>
        <div className="space-y-5">
          <Field label="Version name *"><input className="briefing-input" value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }} placeholder="Hero A" /></Field>
          <Field label="Slug (URL)"><input className="briefing-input" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="hero-a" /></Field>
          <Field label="Approved pack *">
            <select className="briefing-input" value={packId} onChange={(e) => setPackId(e.target.value)}>
              <option value="">Select a pack…</option>
              {approved.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.kind})</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} /> Live immediately</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={primary} onChange={(e) => setPrimary(e.target.checked)} /> Set as primary (renders at <code className="bg-secondary px-1">/</code>)</label>
          {err && <p className="text-sm text-crimson">{err}</p>}
          <button onClick={create} disabled={busy || !name || !packId} className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-semibold tracking-[0.25em] uppercase hover:opacity-90 disabled:opacity-40">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create version
          </button>
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-heading text-xl">Live versions</h4>
          <Link to="/admin/experiments" className="text-[10px] tracking-[0.2em] uppercase text-crimson hover:underline">A/B Experiments →</Link>
        </div>
        {!versions.length ? <p className="text-sm text-muted-foreground">No versions yet.</p> : (
          <div className="border-t border-border">
            {versions.map((v) => {
              const pack = packs.find((p) => p.id === v.template_pack_id);
              return (
                <div key={v.id} className="border-b border-border py-4 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{v.name}</span>
                      {v.is_primary && <Star className="w-3.5 h-3.5 text-gold fill-gold" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">/v/{v.slug} · {pack?.name || "—"}</p>
                  </div>
                  <div className="col-span-3">
                    <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 ${v.status === "live" ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>{v.status}</span>
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <a href={`/v/${v.slug}`} target="_blank" rel="noreferrer" className="p-1.5 border border-border hover:border-foreground" title="View live"><ExternalLink className="w-3.5 h-3.5" /></a>
                    <button onClick={() => setPrimaryFor(v)} disabled={v.is_primary} className="p-1.5 border border-border hover:border-foreground disabled:opacity-30" title="Set primary">{v.is_primary ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}</button>
                    <button onClick={() => toggleLive(v)} className="p-1.5 border border-border hover:border-foreground" title="Live / archive"><Archive className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{label}</label>
      {children}
    </div>
  );
}