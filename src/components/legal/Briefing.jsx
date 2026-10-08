import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const CASE_TYPES = ["Personal Injury", "Criminal Defense", "Family Law", "Business Litigation", "Employment", "Estate Planning", "Other"];
const URGENCIES = ["Immediate", "Within a week", "Exploring options"];

export default function Briefing() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    case_type: "",
    location: "",
    urgency: "",
    name: "",
    email: "",
    phone: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.case_type;
    if (step === 1) return !!form.location && !!form.urgency;
    if (step === 2) return !!form.name && !!form.case_type;
    return false;
  };

  const submit = async () => {
    if (!form.name || !form.case_type) {
      setError("Your name and case type are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await base44.entities.Lead.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        case_type: form.case_type,
        location: form.location,
        urgency: form.urgency,
        description: form.description,
        status: "new",
        source: "funnel",
      });
      setDone(true);
    } catch (e) {
      setError("Something went wrong submitting your briefing. Please try again or call us.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section id="briefing" className="bg-foreground text-background">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-40 text-center">
          <div className="mx-auto w-16 h-16 border border-background/30 rounded-full flex items-center justify-center mb-10">
            <Check className="w-7 h-7" />
          </div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-background/50 mb-6">Briefing received</p>
          <h3 className="font-heading text-4xl md:text-6xl font-light leading-tight max-w-3xl mx-auto">
            Thank you, {form.name.split(" ")[0]}. A partner will reach out within one business day.
          </h3>
          <p className="mt-8 text-background/60 max-w-md mx-auto">
            Your matter is confidential under attorney-client privilege from the moment you submitted.
            Do not discuss the facts with anyone else until we speak.
          </p>
        </div>
      </section>
    );
  }

  const steps = ["The Matter", "The Circumstance", "Your Particulars"];

  return (
    <section id="briefing" className="bg-foreground text-background">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-32">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <p className="text-[10px] tracking-[0.35em] uppercase text-background/50 mb-6">The Briefing · 04</p>
            <h2 className="font-heading text-5xl md:text-6xl font-light leading-[0.95]">
              Begin your<br />consultation.
            </h2>
            <p className="mt-8 text-background/60 max-w-xs leading-relaxed">
              Three steps. Under two minutes. Confidential, and free. We respond within one business day.
            </p>
            <div className="mt-10 space-y-3">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-4">
                  <span
                    className={`w-7 h-7 border flex items-center justify-center text-[11px] ${
                      i < step ? "bg-background text-foreground border-background" : i === step ? "border-background" : "border-background/30 text-background/40"
                    }`}
                  >
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className={`text-xs tracking-[0.2em] uppercase ${i === step ? "text-background" : "text-background/40"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 border-l border-background/15 pl-0 md:pl-12">
            {step === 0 && (
              <div className="stamp-in">
                <p className="font-heading text-2xl md:text-4xl font-light leading-snug">
                  My case involves{" "}
                  <span className="inline-flex flex-wrap gap-2 align-middle">
                    {CASE_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => set("case_type", t)}
                        className={`px-4 py-1 border text-sm transition-colors ${
                          form.case_type === t ? "bg-background text-foreground border-background" : "border-background/30 hover:border-background"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </span>
                  .
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="stamp-in space-y-10">
                <p className="font-heading text-2xl md:text-4xl font-light leading-snug">
                  It occurred in{" "}
                  <input
                    autoFocus
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="city / state"
                    className="bg-transparent border-b-2 border-background/40 focus:border-background outline-none px-2 py-1 min-w-[200px] font-heading"
                  />
                  .
                </p>
                <p className="font-heading text-2xl md:text-4xl font-light leading-snug">
                  I need counsel{" "}
                  <span className="inline-flex flex-wrap gap-2 align-middle">
                    {URGENCIES.map((u) => (
                      <button
                        key={u}
                        onClick={() => set("urgency", u)}
                        className={`px-4 py-1 border text-sm lowercase transition-colors ${
                          form.urgency === u ? "bg-background text-foreground border-background" : "border-background/30 hover:border-background"
                        }`}
                      >
                        {u.toLowerCase()}
                      </button>
                    ))}
                  </span>
                  .
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="stamp-in space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Full name *">
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} className="briefing-input" placeholder="Jane Doe" />
                  </Field>
                  <Field label="Phone">
                    <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="briefing-input" placeholder="(555) 000-0000" />
                  </Field>
                </div>
                <Field label="Email">
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="briefing-input" placeholder="jane@email.com" />
                </Field>
                <Field label="What happened (in your own words)">
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={4}
                    className="briefing-input resize-none"
                    placeholder="The more specific, the better. Dates, parties, and the harm suffered."
                  />
                </Field>
                {error && <p className="text-sm text-background/70">{error}</p>}
              </div>
            )}

            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-background/50 disabled:opacity-30 hover:text-background transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {step < 2 ? (
                <button
                  onClick={() => canNext() && setStep((s) => s + 1)}
                  disabled={!canNext()}
                  className="ink-spread flex items-center gap-2 border border-background px-8 py-4 text-xs tracking-[0.25em] uppercase disabled:opacity-30"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="ink-spread flex items-center gap-2 border border-background px-8 py-4 text-xs tracking-[0.25em] uppercase disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Submit Briefing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.25em] uppercase text-background/50 mb-3">{label}</span>
      {children}
    </label>
  );
}