import FunnelControls from "./FunnelControls";
import FunnelField from "./FunnelField";

const URGENCIES = ["Immediate", "Within a week", "Exploring options"];

export default function StageCircumstance({ form, set, next, prev }) {
  return (
    <div className="w-full">
      <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6 text-center">Step 2 of 3</p>
      <h3 className="font-heading text-3xl md:text-4xl font-light text-center mb-4 leading-tight text-primary">
        Where and when did it happen?
      </h3>
      <p className="text-center text-muted-foreground mb-10 max-w-md mx-auto">
        The sooner we know the details, the stronger your claim. Evidence disappears fast.
      </p>
      <div className="space-y-10">
        <FunnelField label="Where did the crash happen?">
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="briefing-input"
            placeholder="City, State or intersection"
          />
        </FunnelField>
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">How soon do you need counsel?</p>
          <div className="flex flex-wrap gap-3">
            {URGENCIES.map((u) => (
              <button
                key={u}
                onClick={() => set("urgency", u)}
                className={`px-5 py-2.5 border text-sm rounded-sm transition-colors ${
                  form.urgency === u ? "bg-primary text-paper border-primary font-medium" : "border-border text-foreground hover:border-primary"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <FunnelControls onPrev={prev} onNext={next} canNext={!!form.location && !!form.urgency} />
    </div>
  );
}