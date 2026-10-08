import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Loader2, Plus, Trash2, ExternalLink, Rocket, Check, Copy, MapPin, FileCode, X,
} from "lucide-react";
import { US_CITIES } from "@/lib/usCities";

const SITE_URL = "https://scale-dominance.base44.app";
const PRACTICE_AREAS = [
  "Car Accident", "Truck Collision", "Motorcycle Accident",
  "Pedestrian Accident", "Rideshare Accident", "Bicycle Accident",
];

const SAMPLE_LOCATIONS = [
  { city: "Los Angeles", state: "California", state_code: "CA", county: "Los Angeles", region: "West", population: 3898747 },
  { city: "Houston", state: "Texas", state_code: "TX", county: "Harris", region: "South", population: 2304580 },
  { city: "Phoenix", state: "Arizona", state_code: "AZ", county: "Maricopa", region: "West", population: 1608139 },
  { city: "Chicago", state: "Illinois", state_code: "IL", county: "Cook", region: "Midwest", population: 2716450 },
  { city: "Miami", state: "Florida", state_code: "FL", county: "Miami-Dade", region: "South", population: 442241 },
  { city: "Dallas", state: "Texas", state_code: "TX", county: "Dallas", region: "South", population: 1304379 },
  { city: "Atlanta", state: "Georgia", state_code: "GA", county: "Fulton", region: "South", population: 498715 },
  { city: "Denver", state: "Colorado", state_code: "CO", county: "Denver", region: "West", population: 715522 },
  { city: "Seattle", state: "Washington", state_code: "WA", county: "King", region: "West", population: 737015 },
  { city: "Boston", state: "Massachusetts", state_code: "MA", county: "Suffolk", region: "Northeast", population: 654476 },
  { city: "Las Vegas", state: "Nevada", state_code: "NV", county: "Clark", region: "West", population: 641903 },
  { city: "Nashville", state: "Tennessee", state_code: "TN", county: "Davidson", region: "South", population: 689447 },
];

export default function Dominance() {
  const [selected, setSelected] = useState(new Set());
  const [locations, setLocations] = useState([]);
  const [locText, setLocText] = useState("");
  const [locLoading, setLocLoading] = useState(true);
  const [pages, setPages] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageArea, setPageArea] = useState("all");
  const [status, setStatus] = useState("published");
  const [batchSize, setBatchSize] = useState(200);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [copied, setCopied] = useState("");
  const [customKw, setCustomKw] = useState("");
  const [industry, setIndustry] = useState("Legal");
  const [tone, setTone] = useState("professional, authoritative, trustworthy");

  const loadLocations = useCallback(async () => {
    setLocLoading(true);
    try {
      const res = await base44.entities.Location.filter({}, { sort: "state_code", limit: 500 });
      setLocations(res.items || []);
    } catch { setLocations([]); }
    finally { setLocLoading(false); }
  }, []);

  const loadPages = useCallback(async () => {
    setPageLoading(true);
    try {
      const q = { status: "published" };
      if (pageArea !== "all") q.practice_area = pageArea;
      const res = await base44.entities.GeneratedPage.filter(q, { sort: "-created_date", limit: 50 });
      setPages(res.items || []);
    } catch { setPages([]); }
    finally { setPageLoading(false); }
  }, [pageArea]);

  useEffect(() => { loadLocations(); }, [loadLocations]);
  useEffect(() => { loadPages(); }, [loadPages]);

  const toggle = (a) => setSelected((s) => { const n = new Set(s); n.has(a) ? n.delete(a) : n.add(a); return n; });
  const addCustomKw = () => { const k = customKw.trim(); if (!k) return; setSelected((s) => new Set([...s, k])); setCustomKw(""); };
  const removeKw = (a) => setSelected((s) => { const n = new Set(s); n.delete(a); return n; });

  const addLocations = async () => {
    const rows = locText.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const parts = l.split(",").map((p) => p.trim());
      return { city: parts[0], state_code: (parts[1] || "").toUpperCase(), state: parts[2] || "", county: parts[3] || "" };
    }).filter((r) => r.city && r.state_code);
    if (!rows.length) return;
    try { await base44.entities.Location.bulkCreate(rows); setLocText(""); loadLocations(); } catch (e) { alert("Could not add locations: " + e.message); }
  };

  const seedSample = async () => { try { await base44.entities.Location.bulkCreate(SAMPLE_LOCATIONS); loadLocations(); } catch (e) { alert("Could not seed: " + e.message); } };
  const seedBig = async () => { try { await base44.entities.Location.bulkCreate(US_CITIES); loadLocations(); } catch (e) { alert("Could not seed: " + e.message); } };
  const clearLocations = async () => { if (!confirm("Delete all locations? Generated pages stay.")) return; try { await base44.entities.Location.deleteMany({}); loadLocations(); } catch (e) { alert("Could not delete: " + e.message); } };

  const generate = async () => {
    const areas = [...selected];
    if (!areas.length || !locations.length) return;
    setGenerating(true);
    setProgress({ done: 0, total: areas.length * locations.length, created: 0, updated: 0 });
    let created = 0, updated = 0;
    for (let i = 0; i < locations.length; i += batchSize) {
      const chunk = locations.slice(i, i + batchSize);
      try {
        const res = await base44.functions.invoke("generateLegalPages", {
          practice_areas: areas, location_ids: chunk.map((l) => l.id),
          status, site_url: SITE_URL, industry, content_tone: tone,
        });
        created += res.data?.created || 0;
        updated += res.data?.updated || 0;
      } catch (e) { alert("Batch failed: " + e.message); break; }
      setProgress({ done: Math.min(i + batchSize, locations.length), total: locations.length, created, updated });
    }
    setGenerating(false);
    loadPages();
  };

  const togglePageStatus = async (p) => {
    const next = p.status === "published" ? "draft" : "published";
    try { await base44.entities.GeneratedPage.update(p.id, { status: next }); loadPages(); } catch (e) { alert("Could not update: " + e.message); }
  };

  const deletePage = async (p) => {
    if (!confirm("Delete this page?")) return;
    try { await base44.entities.GeneratedPage.delete(p.id); loadPages(); } catch (e) { alert("Could not delete: " + e.message); }
  };

  const copy = (label, text) => { navigator.clipboard?.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500); };
  const matrix = selected.size * locations.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-30">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-heading text-xl">YOUR FIRM</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-crimson border-l border-border pl-6">Admin · Legal Firm Digital Dominance</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/admin" className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">Leads</Link>
            <Link to="/" className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to site</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 space-y-12">
        <section className="border border-border p-6 md:p-8">
          <h2 className="font-heading text-2xl font-bold text-primary uppercase mb-2">Programmatic Site Factory</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">Generate hundreds of thousands of unique, Google-compliant landing pages — one per practice area × city — each with its own URL, unique title and meta description, canonical tag, LegalService + FAQ schema, and a sitemap entry.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mt-6">
            <Metric label="Locations" value={locations.length} />
            <Metric label="Practice areas" value={PRACTICE_AREAS.length} />
            <Metric label="Selected areas" value={selected.size} />
            <Metric label="Pages to generate" value={matrix} highlight />
          </div>
        </section>

        <section>
          <StepTitle n={1} title="Choose keywords / practice areas" />
          <p className="text-xs text-muted-foreground mb-3">Quick-select legal practice areas, or add any custom keyword for any industry.</p>
          <div className="flex flex-wrap gap-2">
            {PRACTICE_AREAS.map((a) => (
              <button key={a} onClick={() => toggle(a)} className={`px-4 py-2 text-xs tracking-[0.15em] uppercase border transition-colors ${selected.has(a) ? "bg-primary text-paper border-primary" : "border-border hover:border-primary"}`}>
                {selected.has(a) && <Check className="w-3 h-3 inline mr-1.5" />}{a}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input value={customKw} onChange={(e) => setCustomKw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomKw()} placeholder="Add custom keyword (e.g., Slip and Fall, Medical Malpractice, Roofing, HVAC)" className="flex-1 border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={addCustomKw} className="px-4 py-2 bg-foreground text-background text-xs tracking-[0.15em] uppercase hover:opacity-90">Add</button>
          </div>
          {selected.size > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {[...selected].map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs border border-primary/30 bg-primary/5">
                  {k}
                  <button onClick={() => removeKw(k)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </section>

        <section>
          <StepTitle n={2} title="Manage locations" />
          {locLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : (
            <>
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <button onClick={seedSample} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-primary"><Plus className="w-3.5 h-3.5" /> Seed 12 sample cities</button>
                <button onClick={seedBig} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-crimson text-crimson hover:bg-crimson hover:text-paper"><Plus className="w-3.5 h-3.5" /> Seed 120 US cities</button>
                {locations.length > 0 && <button onClick={clearLocations} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-destructive hover:border-destructive"><Trash2 className="w-3.5 h-3.5" /> Clear all</button>}
                <span className="self-center text-muted-foreground">{locations.length} locations loaded</span>
              </div>
              <textarea value={locText} onChange={(e) => setLocText(e.target.value)} rows={4} placeholder={"One per line: City, ST, State, County\nLos Angeles, CA, California, Los Angeles\nAustin, TX, Texas, Travis"} className="w-full border border-border p-3 text-sm font-mono mb-3 outline-none focus:border-primary" />
              <button onClick={addLocations} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-paper text-xs tracking-[0.15em] uppercase hover:brightness-110"><Plus className="w-3.5 h-3.5" /> Add locations</button>
              {locations.length > 0 && (
                <div className="mt-5 grid sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto">
                  {locations.map((l) => (
                    <div key={l.id} className="flex items-center gap-2 border border-border px-3 py-2 text-xs"><MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{l.city}, {l.state_code}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <section>
          <StepTitle n={3} title="Generate pages" />
          <div className="border border-border p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <label className="flex items-center gap-2"><span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Status</span><select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-border px-3 py-1.5 text-sm outline-none"><option value="published">Published</option><option value="draft">Draft</option></select></label>
              <label className="flex items-center gap-2"><span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Batch size</span><input type="number" value={batchSize} min={10} max={500} onChange={(e) => setBatchSize(Math.max(10, Math.min(500, +e.target.value || 200)))} className="border border-border px-3 py-1.5 text-sm w-24 outline-none" /><span className="text-xs text-muted-foreground">locations per request</span></label>
              <label className="flex items-center gap-2"><span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Industry</span><input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Legal, Medical, Home Services..." className="border border-border px-3 py-1.5 text-sm w-40 outline-none" /></label>
              <label className="flex items-center gap-2 flex-1 min-w-[200px]"><span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Tone</span><input type="text" value={tone} onChange={(e) => setTone(e.target.value)} className="border border-border px-3 py-1.5 text-sm flex-1 outline-none" /></label>
            </div>
            <button onClick={generate} disabled={generating || !matrix} className="inline-flex items-center gap-2 bg-crimson text-paper px-6 py-3 text-xs font-semibold tracking-[0.25em] uppercase rounded-sm hover:brightness-110 disabled:opacity-40">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {generating ? "Generating…" : `Generate ${matrix} pages`}
            </button>
            {progress && (
              <div className="text-sm">
                <div className="h-2 bg-secondary border border-border overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} /></div>
                <p className="mt-2 text-muted-foreground">{progress.done} / {progress.total} locations · {progress.created} created · {progress.updated} updated</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Pages are upserted by slug, so re-running updates existing pages and adds new ones without duplicates.</p>
          </div>
        </section>

        <section>
          <StepTitle n={4} title="Google compliance checklist" />
          <div className="grid sm:grid-cols-2 gap-2">
            {["Unique title tag and meta description per page","Unique, helpful content (not keyword-swapped duplicates)","Canonical URL on every page","LegalService + FAQPage JSON-LD structured data","Mobile-responsive, fast pages","Internal linking between related city pages","XML sitemap of all published pages","robots.txt referencing the sitemap"].map((c) => (
              <div key={c} className="flex items-start gap-2 border border-border p-3 text-sm"><Check className="w-4 h-4 text-crimson shrink-0 mt-0.5" /> {c}</div>
            ))}
          </div>
        </section>

        <section>
          <StepTitle n={5} title="SEO feed" />
          <div className="space-y-2">
            <FeedRow icon={FileCode} label="Sitemap index" url={`${SITE_URL}/functions/seoSitemap?index=1`} copied={copied === "sitemap-index"} onCopy={() => copy("sitemap-index", `${SITE_URL}/functions/seoSitemap?index=1`)} />
            <FeedRow icon={FileCode} label="Sitemap (all)" url={`${SITE_URL}/functions/seoSitemap`} copied={copied === "sitemap"} onCopy={() => copy("sitemap", `${SITE_URL}/functions/seoSitemap`)} />
            <FeedRow icon={FileCode} label="robots.txt" url={`${SITE_URL}/functions/seoRobots`} copied={copied === "robots"} onCopy={() => copy("robots", `${SITE_URL}/functions/seoRobots`)} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">Tip: in the Domains dashboard, redirect /sitemap.xml → /functions/seoSitemap and /robots.txt → /functions/seoRobots for clean crawl URLs.</p>
        </section>

        <section>
          <StepTitle n={6} title="Generated pages" />
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button onClick={() => setPageArea("all")} className={`px-3 py-1.5 text-xs tracking-[0.15em] uppercase border ${pageArea === "all" ? "bg-foreground text-background border-foreground" : "border-border"}`}>All</button>
            {PRACTICE_AREAS.map((a) => (
              <button key={a} onClick={() => setPageArea(a)} className={`px-3 py-1.5 text-xs tracking-[0.15em] uppercase border ${pageArea === a ? "bg-foreground text-background border-foreground" : "border-border"}`}>{a}</button>
            ))}
          </div>
          {pageLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : pages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8">No pages yet. Generate some above.</p>
          ) : (
            <div className="border-t border-border">
              {pages.map((p) => (
                <div key={p.id} className="border-b border-border py-4 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-12 md:col-span-6">
                    <a href={`${SITE_URL}/${p.slug}`} target="_blank" rel="noreferrer" className="font-medium text-sm hover:text-crimson inline-flex items-center gap-1.5">{p.title} <ExternalLink className="w-3 h-3" /></a>
                    <p className="text-xs text-muted-foreground mt-0.5">/{p.slug}</p>
                  </div>
                  <div className="col-span-6 md:col-span-3 text-xs text-muted-foreground">{p.practice_area} · {p.city}, {p.state_code}</div>
                  <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-2">
                    <button onClick={() => togglePageStatus(p)} className="text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 border border-border hover:border-primary">{p.status}</button>
                    <button onClick={() => deletePage(p)} className="p-1.5 border border-border text-destructive hover:border-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StepTitle({ n, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-7 h-7 rounded-sm bg-primary text-paper flex items-center justify-center font-heading text-sm font-bold">{n}</span>
      <h3 className="font-heading text-xl font-bold text-primary uppercase">{title}</h3>
    </div>
  );
}
function Metric({ label, value, highlight }) {
  return (
    <div className="bg-background p-5">
      <div className={`font-heading text-3xl font-light tabular-nums ${highlight ? "text-crimson" : "text-primary"}`}>{value.toLocaleString()}</div>
      <p className="text-[10px] tracking-[0.2em] uppercase mt-1 text-muted-foreground">{label}</p>
    </div>
  );
}
function FeedRow({ icon: Icon, label, url, copied, onCopy }) {
  return (
    <div className="flex items-center gap-3 border border-border p-3">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground w-20 shrink-0">{label}</span>
      <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate flex-1">{url}</a>
      <button onClick={onCopy} className="inline-flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 border border-border hover:border-primary shrink-0">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}</button>
    </div>
  );
}