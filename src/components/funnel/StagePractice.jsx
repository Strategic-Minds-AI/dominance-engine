import FunnelControls from "./FunnelControls";

const AREAS = [
  "Car Accident", "Truck Collision", "Motorcycle Accident",
  "Pedestrian Accident", "Rideshare Accident", "Bicycle Accident", "Other",
];

export default function StagePractice({ form, set, next, prev }) {
  return (
    <div className="w-full">
      <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6 text-center">Step 1 of 3</p>
      <h3 className="font-heading text-3xl md:text-4xl font-light text-center mb-4 leading-tight text-primary">
        What kind of crash were you in?
      </h3>
      <p className="text-center text-muted-foreground mb-10 max-w-md mx-auto">
        Pick the one that fits. Most crashes settle for far more than the insurance company first offers.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {AREAS.map((a) => (
          <button
            key={a}
            onClick={() => set("case_type", a)}
            className={`text-left p-5 border text-sm transition-colors rounded-sm ${
              form.case_type === a ? "bg-primary text-paper border-primary font-medium" : "border-border text-foreground hover:border-primary"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <FunnelControls onPrev={prev} onNext={next} canNext={!!form.case_type} />
    </div>
  );
}