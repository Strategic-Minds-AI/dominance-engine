import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Save } from "lucide-react";

export default function PortalBrochure({ site }) {
  const [brochure, setBrochure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", content_markdown: "", services: "", contact_phone: "", contact_email: "", cta_text: "" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await base44.entities.Brochure.filter({ launched_site_id: site.id }, { limit: 1 });
        const items = res.items || [];
        if (items.length > 0) {
          setBrochure(items[0]);
          setForm({ title: items[0].title || "", subtitle: items[0].subtitle || "", content_markdown: items[0].content_markdown || "", services: items[0].services || "", contact_phone: items[0].contact_phone || "", contact_email: items[0].contact_email || "", cta_text: items[0].cta_text || "" });
        } else {
          setForm((f) => ({ ...f, title: site.name, subtitle: site.keywords || "", cta_text: "Contact us today for a free consultation." }));
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, [site.id]);

  const save = async () => {
    setSaving(true);
    try {
      if (brochure) await base44.entities.Brochure.update(brochure.id, form);
      else { const b = await base44.entities.Brochure.create({ ...form, launched_site_id: site.id }); setBrochure(b); }
    } catch (e) { alert("Save failed: " + e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const servicesList = form.services ? form.services.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <h3 className="font-heading text-xl font-bold uppercase">Digital Brochure</h3>
          <p className="text-xs text-muted-foreground mt-1">A shareable digital brochure showcasing your services.</p>
        </div>
        <Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
        <Field label="Subtitle"><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
        <Field label="Services (comma-separated)"><input value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} placeholder="Car Accident, Truck Collision, Motorcycle Accident" className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
        <Field label="Content"><textarea value={form.content_markdown} onChange={(e) => setForm({ ...form, content_markdown: e.target.value })} rows={6} className="w-full border border-border p-3 text-sm outline-none focus:border-primary" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact Phone"><input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Contact Email"><input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
        </div>
        <Field label="Call to Action"><input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-paper text-xs tracking-[0.2em] uppercase disabled:opacity-40">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Brochure
        </button>
      </div>

      <div>
        <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">Live Preview</h3>
        <div className="border border-border p-8">
          <h4 className="font-heading text-2xl">{form.title || "Your Brochure"}</h4>
          <p className="text-sm text-muted-foreground mt-1">{form.subtitle}</p>
          {servicesList.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Services</p>
              <div className="flex flex-wrap gap-2">{servicesList.map((s) => <span key={s} className="px-3 py-1 text-xs border border-border">{s}</span>)}</div>
            </div>
          )}
          {form.content_markdown && <p className="text-sm text-muted-foreground mt-4 whitespace-pre-wrap leading-relaxed">{form.content_markdown}</p>}
          {form.cta_text && <p className="mt-6 text-sm font-medium text-crimson">{form.cta_text}</p>}
          {(form.contact_phone || form.contact_email) && (
            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
              {form.contact_phone && <p>{form.contact_phone}</p>}
              {form.contact_email && <p>{form.contact_email}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>;
}