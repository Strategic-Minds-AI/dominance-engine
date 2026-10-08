import { Check } from "lucide-react";

export default function StageConfirmation({ form }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mx-auto w-16 h-16 border-2 border-crimson rounded-full flex items-center justify-center mb-10 bg-crimson/10">
        <Check className="w-7 h-7 text-crimson" />
      </div>
      <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-6">Case review received</p>
      <h2 className="font-heading text-4xl md:text-5xl font-light leading-tight text-primary">
        You're on your way, {form.name?.split(" ")[0] || "and welcome"}.
      </h2>
      <p className="mt-8 text-muted-foreground max-w-md mx-auto leading-relaxed">
        A lawyer will call you within one business day to tell you what your case could be worth and your next steps. Until then: don't sign anything from the insurance company, and don't give a recorded statement. Everything you shared is confidential under attorney-client privilege.
      </p>
    </div>
  );
}