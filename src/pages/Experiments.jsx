import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, FlaskConical, Pause, Play } from "lucide-react";

export default function Experiments() {
  const [versions, setVersions] = useState([]);
  const [visits, setVisits] = useState({});
  const [leads, setLeads] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, visitAgg, leadAgg] = await Promise.all([
        base44.entities.SiteVersion.filter({ status: "live" }, { sort: "-created_date", limit: 100 }),
        base44.entities.Visit.aggregate({ groupBy: "slug" }),
        base44.entities.Lead.aggregate({ groupBy: "variant" }),
      ]);
      setVersions(vRes.items || []);
      const vm = {};
      (visitAgg.rows || []).forEach((r) => { vm[r.slug] = r.count; });
      setVisits(vm);
      const lm = {};
      (leadAgg.rows || []).forEach((r) => { lm[r.variant || "_none"] = r.count; });
      setLeads(lm);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setWeight = async (v, w) => {
    setBusyId(v.id);
    try { await base44.entities.SiteVersion.update(v.id, { ab_weight: w }); load(); } finally { setBusyId(""); }
  };
  const toggle = async (v) => setWeight(v, (v.ab_weight || 0) > 0 ? 0 : 1);

  const rows = [
    { slug: "_control", name: "React site (control)", isControl: true },
    ...versions.map((v) => ({ slug: v.slug, name: v.name, version: v, isControl: false })),
  ];
  const totalVisits = Object.values(visits).reduce((a, b) => a + (b || 0), 0);
  const totalLeads = Object.values(leads).reduce((a, b) => a + (b || 0), 0);
  const activeVariants = versions.filter((v) => (v.ab_weight || 0) > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-30">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-heading text-xl">YOUR FIRM</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground border-l border-border pl-6">A/B Experiments</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/admin/studio" className="text-[10px] tracking-[0.2em] uppercase text-crimson hover:underline">Studio</Link>
            <Link to="/admin" className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Admin</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10">
        <section className="border border-border p-6 md:p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold text-primary uppercase mb-2 flex items-center gap-2"><FlaskConical className="w-6 h-6" /> Frontend A/B Testing</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Each live version with a weight above 0 becomes a variant. New visitors are split by weight (the React site is always a control variant with weight 1). Visits and leads are attributed per variant so you can compare conversion.
          </p>
          <div className="grid grid-cols-3 gap-px bg-border mt-6">
            <Metric label="Total visits" value={totalVisits} />
            <Metric label="Total leads" value={totalLeads} />
            <Metric label="Active variants" value={activeVariants} />
          </div>
        </section>

        {loading ? <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div> : (
          <div className="border-t border-border">
            {rows.map((r) => {
              const v = visits[r.slug] || 0;
              const l = leads[r.slug] || 0;
              const rate = v ? ((l / v) * 100) : 0;
              const active = !r.isControl && ((r.version?.ab_weight || 0) > 0);
              return (
                <div key={r.slug} className="border-b border-border py-5 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{r.name}</span>
                      {r.isControl ? <span className="text-[10px] tracking-[0.15em] uppercase border border-border px-2 py-0.5">control</span>
                        : active ? <span className="text-[10px] tracking-[0.15em] uppercase bg-foreground text-background px-2 py-0.5">running</span>
                        : <span className="text-[10px] tracking-[0.15em] uppercase border border-border text-muted-foreground px-2 py-0.5">paused</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.isControl ? "Existing React funnel site" : `/v/${r.slug}`}</p>
                  </div>
                  <div className="col-span-4 md:col-span-2"><Stat label="Visits" value={v} /></div>
                  <div className="col-span-4 md:col-span-2"><Stat label="Leads" value={l} /></div>
                  <div className="col-span-4 md:col-span-2">
                    <Stat label="Conv. rate" value={`${rate.toFixed(1)}%`} />
                    <div className="h-1.5 bg-secondary mt-1.5 overflow-hidden"><div className="h-full bg-crimson" style={{ width: `${Math.min(100, rate)}%` }} /></div>
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                    {r.isControl ? <span className="text-xs text-muted-foreground">weight 1 (fixed)</span> : (
                      <>
                        <input type="number" min={0} max={10} step={1} value={r.version?.ab_weight || 0} disabled={busyId === r.version?.id} onChange={(e) => setWeight(r.version, Math.max(0, +e.target.value || 0))} className="w-16 border border-border px-2 py-1 text-sm outline-none" />
                        <button onClick={() => toggle(r.version)} disabled={busyId === r.version?.id} className="p-1.5 border border-border hover:border-foreground" title={active ? "Pause" : "Start"}>{active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-6">Visits are recorded when a visitor lands on a variant (or the control). Leads are attributed to the variant the visitor last saw. Set a version's weight to 0 to pause it; the React control always stays in the mix.</p>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-background p-5">
      <div className="font-heading text-3xl font-light tabular-nums text-primary">{value.toLocaleString()}</div>
      <p className="text-[10px] tracking-[0.2em] uppercase mt-1 text-muted-foreground">{label}</p>
    </div>
  );
}
function Stat({ label, value }) {
  return <div><div className="font-heading text-xl tabular-nums">{value}</div><p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">{label}</p></div>;
}