import { Globe, Zap, Users, Bot, Activity, TrendingUp } from "lucide-react";

export default function SystemHealth({ health, missions }) {
  const cards = [
    { icon: Activity, label: "Active missions", value: missions, tone: "primary" },
    { icon: Globe, label: "Live sites", value: health.sites || 0, tone: "default" },
    { icon: Zap, label: "Sync jobs queued", value: health.jobs || 0, tone: "default" },
    { icon: Users, label: "Leads captured", value: health.leads || 0, tone: "default" },
    { icon: Bot, label: "Agents in progress", value: health.agents || 0, tone: "default" },
    { icon: TrendingUp, label: "Credits", value: "Exhausted", tone: "warn" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-t border-l border-border">
      {cards.map((c) => (
        <div key={c.label} className="border-r border-b border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <c.icon className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{c.label}</p>
          </div>
          <div className={`font-heading text-2xl font-light tabular-nums ${c.tone === "primary" ? "text-primary" : c.tone === "warn" ? "text-crimson text-base" : ""}`}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}