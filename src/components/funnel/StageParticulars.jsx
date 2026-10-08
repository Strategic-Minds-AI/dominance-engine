import { Check, Loader2, ArrowLeft } from "lucide-react";
import FunnelField from "./FunnelField";

export default function StageParticulars({ form, set, prev, submitting, submit }) {
  return (
    <div className="w-full">
      <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6 text-center">Step 3 of 3</p>
      <h3 className="font-heading text-3xl md:text-4xl font-light text-center mb-4 leading-tight text-primary">
        Last step — let's get you paid.
      </h3>
      <p className="text-center text-muted-foreground mb-10 max-w-md mx-auto">
        A lawyer reviews your case for free and calls you back within one business day with what it could be worth.
      </p>
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <FunnelField label="Full name *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className="briefing-input" placeholder="Jane Doe" />
          </FunnelField>
          <FunnelField label="Phone">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="briefing-input" placeholder="(555) 000-0000" />
          </FunnelField>
        </div>
        <FunnelField label="Email">
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="briefing-input" placeholder="jane@email.com" />
        </FunnelField>
        <FunnelField label="What happened? (in your own words)">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            className="briefing-input resize-none"
            placeholder="How the crash happened — vehicles involved, your injuries, and who was at fault. The more detail, the stronger your claim."
          />
        </FunnelField>
      </div>
      <div className="mt-12 flex items-center justify-between">
        <button onClick={prev} className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={submit}
          disabled={submitting || !form.name}
          className="inline-flex items-center gap-2 bg-crimson text-paper px-8 py-4 text-xs font-semibold tracking-[0.25em] uppercase rounded-sm hover:brightness-110 transition disabled:opacity-40"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Get My Free Case Review
        </button>
      </div>
    </div>
  );
}