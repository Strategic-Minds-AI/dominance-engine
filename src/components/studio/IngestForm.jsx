import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, Check, Copy } from "lucide-react";

const ENDPOINT = "https://scale-dominance.base44.app/functions/ingestPack";

const SAMPLE_BRAND = JSON.stringify(
  { colors: { primary: "#df2a2a", secondary: "#001a70", background: "#ffffff", text: "#0a0d0f", accent: "#df2a2a" }, fonts: { heading: "Spectral", body: "Inter" }, logo_url: "" },
  null, 2
);

export default function IngestForm({ onIngested }) {
  const [form, setForm] = useState({
    name: "", kind: "web_pack", description: "", preview_html: "",
    brand_tokens: SAMPLE_BRAND, manifest: "", source: "manual", submitted_by_label: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onHtmlFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => set("preview_html", String(r.result || ""));
    r.readAsText(f);
  };

  const submit = async () => {
    if (!form.name || !form.kind) return;
    setBusy(true); setErr(""); setDone(false);
    try {
      await base44.entities.TemplatePack.create({
        name: form.name, kind: form.kind, description: form.description,
        preview_html: form.preview_html, manifest: form.manifest || "{}",
        brand_tokens: form.brand_tokens || "{}",
        status: "pending_review", source: form.source || "manual",
        submitted_by_label: form.submitted_by_label || "Admin", version: "1.0.0",
      });
      const pack = await base44.entities.TemplatePack.filter(
        { name: form.name, kind: form.kind }, { sort: "-created_date", limit: 1 }
      );
      const id = pack.items?.[0]?.id;
      if (id) {
        await base44.entities.Approval.create({
          template_pack_id: id, status: "pending",
          requested_by_label: form.submitted_by_label || "Admin",
          request: JSON.stringify({ name: form.name, kind: form.kind, description: form.description }),
        });
      }
      setDone(true);
      setForm((f) => ({ ...f, name: "", description: "", preview_html: "" }));
      onIngested?.();
    } catch (e) {
      setErr(e?.message || "Ingest failed");
    } finally {
      setBusy(false);
    }
  };

  const curl = `curl -X POST ${ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -d '{
    "sync_token": "<your PACK_SYNC_TOKEN>",
    "name": "Hero Mockup v2",
    "kind": "web_pack",
    "preview_html": "<!doctype html>...</html>",
    "brand_tokens": "{\\"colors\\":{...}}",
    "source": "gpt_sync",
    "submitted_by_label": "GPT"
  }'`;

  const copyCurl = () => { navigator.clipboard?.writeText(curl); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Pack name *">
            <input className="briefing-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Hero Mockup v2" />
          </Field>
          <Field label="Kind *">
            <select className="briefing-input" value={form.kind} onChange={(e) => set("kind", e.target.value)}>
              <option value="web_pack">Web Pack (full page mockup)</option>
              <option value="mockup">Mockup (section/screen)</option>
              <option value="logo_pack">Logo Pack</option>
              <option value="brand_pack">Brand Pack (colors/fonts)</option>
            </select>
          </Field>
        </div>
        <Field label="Description">
          <input className="briefing-input" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What this pack contains" />
        </Field>
        <Field label="Preview HTML (the mockup that renders visually and goes live)">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase border border-border px-3 py-1.5 hover:border-foreground">
              <Upload className="w-3.5 h-3.5" /> Upload .html
            </button>
            <input ref={fileRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={onHtmlFile} />
            <span className="text-xs text-muted-foreground">Or paste below</span>
          </div>
          <textarea className="briefing-input resize-none font-mono text-xs" rows={8} value={form.preview_html} onChange={(e) => set("preview_html", e.target.value)} placeholder="<!doctype html>… full mockup HTML …" />
        </Field>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Brand tokens (JSON: colors, fonts, logo_url)">
            <textarea className="briefing-input resize-none font-mono text-xs" rows={6} value={form.brand_tokens} onChange={(e) => set("brand_tokens", e.target.value)} />
          </Field>
          <Field label="Manifest (JSON: asset URLs, sections) — optional">
            <textarea className="briefing-input resize-none font-mono text-xs" rows={6} value={form.manifest} onChange={(e) => set("manifest", e.target.value)} placeholder='{"assets":[]}' />
          </Field>
        </div>
        <Field label="Submitted by label">
          <input className="briefing-input" value={form.submitted_by_label} onChange={(e) => set("submitted_by_label", e.target.value)} placeholder="Admin / GPT" />
        </Field>
        {err && <p className="text-sm text-crimson">{err}</p>}
        <button onClick={submit} disabled={busy || !form.name} className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 text-xs font-semibold tracking-[0.25em] uppercase hover:opacity-90 disabled:opacity-40">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <Check className="w-4 h-4" /> : null}
          {done ? "Ingested — pending review" : "Ingest Pack"}
        </button>
      </div>

      <div className="lg:col-span-2 border border-border p-6 bg-secondary/40">
        <h4 className="font-heading text-xl mb-1">GPT Sync Endpoint</h4>
        <p className="text-xs text-muted-foreground mb-4">Let GPT (or any external tool) POST approved mockups straight in. They land as <span className="font-medium">pending review</span> — nothing goes live until you approve.</p>
        <code className="block text-[11px] break-all bg-background border border-border p-3 mb-3">{ENDPOINT}</code>
        <button onClick={copyCurl} className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase border border-border px-3 py-1.5 hover:border-foreground mb-4">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy curl example
        </button>
        <pre className="text-[10px] leading-relaxed text-muted-foreground whitespace-pre-wrap bg-background border border-border p-3 overflow-auto max-h-56">{curl}</pre>
        <p className="text-[11px] text-muted-foreground mt-3">Header auth: send <code className="bg-background px-1">sync_token</code> in the JSON body matching your <span className="font-medium">PACK_SYNC_TOKEN</span> secret. Set it in dashboard → Secrets.</p>
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