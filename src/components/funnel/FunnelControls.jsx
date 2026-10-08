import { ArrowLeft, ArrowRight } from "lucide-react";

export default function FunnelControls({ onPrev, onNext, canNext, nextLabel = "Continue" }) {
  return (
    <div className="mt-14 flex items-center justify-between">
      <button onClick={onPrev} className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <button onClick={onNext} disabled={!canNext} className="inline-flex items-center gap-2 bg-crimson text-paper px-8 py-4 text-xs font-semibold tracking-[0.25em] uppercase rounded-sm hover:brightness-110 transition disabled:opacity-30">
        {nextLabel} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}