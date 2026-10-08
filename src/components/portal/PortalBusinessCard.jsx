import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Save, Phone, Mail, Globe, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function PortalBusinessCard({ site }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", title: "", company: "", phone: "", email: "", website: "", photo_url: "", bio: "", address: "" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await base44.entities.BusinessCard.filter({ launched_site_id: site.id }, { limit: 1 });
        const cards = res.items || [];
        if (cards.length > 0) {
          setCard(cards[0]);
          setForm({ name: cards[0].name || "", title: cards[0].title || "", company: cards[0].company || "", phone: cards[0].phone || "", email: cards[0].email || "", website: cards[0].website || "", photo_url: cards[0].photo_url || "", bio: cards[0].bio || "", address: cards[0].address || "" });
        } else {
          setForm((f) => ({ ...f, name: site.name, company: site.name, website: site.proof_url }));
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, [site.id]);

  const save = async () => {
    setSaving(true);
    try {
      if (card) await base44.entities.BusinessCard.update(card.id, form);
      else { const c = await base44.entities.BusinessCard.create({ ...form, launched_site_id: site.id }); setCard(c); }
    } catch (e) { alert("Save failed: " + e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <h3 className="font-heading text-xl font-bold uppercase">Digital Business Card</h3>
          <p className="text-xs text-muted-foreground mt-1">A shareable contact card your clients can save to their phone.</p>
        </div>
        <div className="space-y-3">
          <Field label="Full Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Company"><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
            <Field label="Email"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
          </div>
          <Field label="Website"><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Photo URL"><input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Address"><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Bio"><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full border border-border p-3 text-sm outline-none focus:border-primary" /></Field>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-paper text-xs tracking-[0.2em] uppercase disabled:opacity-40">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Card
        </button>
      </div>

      <div>
        <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">Live Preview</h3>
        <div className="border border-border p-8 max-w-sm mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-secondary border border-border overflow-hidden mb-4">
              {form.photo_url ? <Image src={form.photo_url} alt={form.name} fittingType="fill" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No photo</div>}
            </div>
            <h4 className="font-heading text-xl">{form.name || "Your Name"}</h4>
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">{form.title || "Title"}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{form.company || "Company"}</p>
            {form.bio && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{form.bio}</p>}
            <div className="mt-4 space-y-1.5 w-full">
              {form.phone && <a href={`tel:${form.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><Phone className="w-3 h-3" /> {form.phone}</a>}
              {form.email && <a href={`mailto:${form.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><Mail className="w-3 h-3" /> {form.email}</a>}
              {form.website && <a href={form.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><Globe className="w-3 h-3" /> <span className="truncate">{form.website}</span></a>}
              {form.address && <p className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {form.address}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>;
}