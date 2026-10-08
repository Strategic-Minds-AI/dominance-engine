import { Check, X, Circle } from "lucide-react";

const CANARY_STEPS = [
  { n: 1, label: "Business created from onboarding invitation", ready: true, note: "Client entity + invite flow" },
  { n: 2, label: "Owner completes conversational onboarding", ready: false, note: "Onboarding agent not built" },
  { n: 3, label: "Business enrichment returns sourced facts", ready: false, note: "Enrichment engine not built" },
  { n: 4, label: "GPT creates website proposal", ready: true, note: "launchProgrammatic + pageGenerator" },
  { n: 5, label: "Website appears in approval library", ready: true, note: "TemplatePack + Studio" },
  { n: 6, label: "Operator approves a design", ready: true, note: "Studio approval workflow" },
  { n: 7, label: "GitHub source is committed", ready: false, note: "GitHub provisioning adapter not built" },
  { n: 8, label: "Vercel preview is deployed", ready: false, note: "Vercel provisioning adapter not built" },
  { n: 9, label: "Independent QA passes", ready: false, note: "QA validator not built" },
  { n: 10, label: "Supabase stores mission and business state", ready: false, note: "Using Base44 DB; Supabase migration pending" },
  { n: 11, label: "Railway worker processes a job and records receipt", ready: false, note: "Railway worker not provisioned" },
  { n: 12, label: "Sitemap generated and technically validated", ready: true, note: "seoSitemap function" },
  { n: 13, label: "Social drafts, digital card, and brochure created", ready: true, note: "ClientPortal auto-seeds on launch" },
  { n: 14, label: "Synthetic CRM lead is captured", ready: true, note: "Lead entity + funnel" },
  { n: 15, label: "Financial dashboard shows synthetic values", ready: false, note: "Financial intelligence not built" },
  { n: 16, label: "Client portal is accessible on mobile", ready: true, note: "ClientPortal responsive" },
  { n: 17, label: "ChatGPT retrieves mission via external bridge", ready: false, note: "MCP tool catalog not exposed" },
  { n: 18, label: "Backend job state survives browser closure", ready: true, note: "SyncJob persists in DB" },
  { n: 19, label: "Rollback is demonstrably functional", ready: false, note: "Rollback system not built" },
];

export default function CanaryChecklist() {
  const passed = CANARY_STEPS.filter((s) => s.ready).length;
  const total = CANARY_STEPS.length;

  return (
    <div className="border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading text-sm font-bold uppercase">Canary Validation Test</h4>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 bg-secondary border border-border overflow-hidden">
            <div className="h-full bg-crimson transition-all" style={{ width: `${(passed / total) * 100}%` }} />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{passed}/{total}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {CANARY_STEPS.map((s) => (
          <div key={s.n} className="flex items-start gap-2.5 border-b border-border pb-1.5">
            <span className="text-[10px] tabular-nums text-muted-foreground w-5 shrink-0 pt-0.5">{s.n}</span>
            {s.ready ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-xs ${s.ready ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{s.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}