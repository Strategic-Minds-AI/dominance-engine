import { Check } from "lucide-react";

const STAGES = [
  { key: "discover", label: "Discover" },
  { key: "research", label: "Research" },
  { key: "design", label: "Design" },
  { key: "build", label: "Build" },
  { key: "test", label: "Test" },
  { key: "approve", label: "Approve" },
  { key: "provision", label: "Provision" },
  { key: "launch", label: "Launch" },
  { key: "optimize", label: "Optimize" },
  { key: "measure", label: "Measure" },
];

export default function MissionPipeline({ missions }) {
  if (!missions.length) {
    return (
      <div className="border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">No active missions. Create one to begin the lifecycle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {missions.map((m) => {
        const stageIdx = STAGES.findIndex((s) => s.key === m.stage);
        const pct = m.progress_pct || Math.round((stageIdx / (STAGES.length - 1)) * 100);
        return (
          <div key={m.id} className="border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {m.is_canary && <span className="text-[9px] tracking-[0.2em] uppercase bg-crimson text-paper px-1.5 py-0.5">Canary</span>}
                  <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{m.mission_id || "DD-V4-PENDING"}</span>
                </div>
                <h4 className="font-medium text-sm mt-1 truncate">{m.title}</h4>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground">{pct}%</span>
                <span className={`text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 ${m.status === "active" ? "bg-foreground text-background" : "border border-border"}`}>{m.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
              {STAGES.map((s, i) => {
                const done = i < stageIdx;
                const current = i === stageIdx;
                return (
                  <div key={s.key} className="flex items-center shrink-0">
                    <div className={`flex items-center gap-1 px-2 py-1 text-[9px] tracking-[0.15em] uppercase border ${
                      done ? "bg-primary text-paper border-primary" :
                      current ? "border-crimson text-crimson bg-crimson/5" :
                      "border-border text-muted-foreground"
                    }`}>
                      {done && <Check className="w-2.5 h-2.5" />}
                      {s.label}
                    </div>
                    {i < STAGES.length - 1 && <div className={`w-3 h-px ${done ? "bg-primary" : "bg-border"}`} />}
                  </div>
                );
              })}
            </div>
            {m.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{m.description}</p>}
          </div>
        );
      })}
    </div>
  );
}