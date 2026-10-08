import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Loader2, Rocket, Check, ExternalLink, FileCode, Copy, MapPin,
  Users, Layers, Globe, Zap, AlertCircle, ChevronRight,
} from "lucide-react";
import { US_CITIES } from "@/lib/usCities";

const SITE_URL = "https://scale-dominance.base44.app";
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

export default function Programmatic() {
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState([]);
  const [packs, setPacks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locText, setLocText] = useState("");
  const [loading, setLoading] = useState({ clients: true, packs: true, locs: true });

  const [clientId, setClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [packId, setPackId] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [keywords, setKeywords] = useState("");
  const [contentTone, setContentTone] = useState("professional, authoritative, trustworthy");
  const [industry, setIndustry] = useState("Legal");
  const [selectedLocs, setSelectedLocs] = useState(new Set());

  const [launching, setLaunching] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadAll = useCallback(async () => {
    const [c, p, l] = await Promise.allSettled([
      base44.entities.Client.filter({}, { sort: "name", limit: 500 }),
      base44.entities.TemplatePack.filter({ status: "approved" }, { sort: "-created_date", limit: 500 }),
      base44.entities.Location.filter({}, { sort: "state_code", limit: 500 }),
    ]);
    if (c.status === "fulfilled") setClients(c.value.items || []);
    if (p.status === "fulfilled") setPacks(p.value.items || []);
    if (l.status === "fulfilled") setLocations(l.value.items || []);
    setLoading({ clients: false, packs: false, locs: false });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const selectedPack = packs.find((p) => p.id === packId);
  const keywordList = keywords.split(",").map((k) => k.trim()).filter(Boolean);
  const matrix = keywordList.length * selectedLocs.size;

  const createClient = async () => {
    if (!newClientName.trim()) return;
    try {
      const c = await base44.entities.Client.create({ name: newClientName.trim(), brand_name: newClientName.trim() });
      setClients((cs) => [...cs, c]);
      setClientId(c.id);
      setNewClientName("");
    } catch (e) { setError(e.message); }
  };

  const addLocations = async () => {
    const rows = locText.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const parts = l.split(",").map((p) => p.trim());
      return { city: parts[0], state_code: (parts[1] || "").toUpperCase(), state: parts[2] || "", county: parts[3] || "" };
    }).filter((r) => r.city && r.state_code);
    if (!rows.length) return;
    try { await base44.entities.Location.bulkCreate(rows); setLocText(""); loadAll(); } catch (e) { setError(e.message); }
  };

  const seedSample = async () => { try { await base44.entities.Location.bulkCreate(SAMPLE_LOCATIONS); loadAll(); } catch (e) { setError(e.message); } };
  const seedBig = async () => { try { await base44.entities.Location.bulkCreate(US_CITIES); loadAll(); } catch (e) { setError(e.message); } };

  const toggleLoc = (id) => setSelectedLocs((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAllLocs = () => setSelectedLocs(new Set(locations.map((l) => l.id)));
  const clearLocs = () => setSelectedLocs(new Set());

  const launch = async () => {
    if (!clientId || !packId || !siteName.trim() || !siteSlug.trim() || !keywordList.length || !selectedLocs.size) return;
    setLaunching(true); setError(""); setProgress({ phase: "Generating AI content matrix…", done: 0 });
    try {
      const locIds = [...selectedLocs];
      const res = await base44.functions.invoke("launchProgrammatic", {
        template_pack_id: packId, client_id: clientId,
        site_name: siteName.trim(), site_slug: siteSlug.trim().toLowerCase().replace(/\s+/g, "-"),
        domain: domain.trim(), keywords: keywordList, location_ids: locIds, content_tone: contentTone, industry,
      });
      setResult(res.data);
      setStep(6);
    } catch (e) {
      setError(e.message || "Launch failed");
    } finally {
      setLaunching(false); setProgress(null);
    }
  };

  const copy = (label, text) => { navigator.clipboard?.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500); };
  const canLaunch = clientId && packId && siteName.trim() && siteSlug.trim() && keywordList.length && selectedLocs.size;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-30">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-heading text-xl">YOUR FIRM</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-crimson border-l border-border pl-6">Admin · Universal Programmatic Engine</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/admin/launched-sites" className="text-[10px] tracking-[0.2em] uppercase text-crimson hover:brightness-110">Launched Sites</Link>
            <Link to="/admin" className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">Leads</Link>
            <Link to="/" className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10">
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {["Client", "Template", "Site Setup", "Keywords", "Locations", "Launch"].map((label, i) => (
            <button key={label} onClick={() => i + 1 < 6 && setStep(i + 1)} className={`flex items-center gap-2 shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors ${step === i + 1 ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${step === i + 1 ? "bg-background text-foreground" : "bg-secondary"}`}>{i + 1}</span>
              {label}
              {i < 5 && <ChevronRight className="w-3 h-3 opacity-40" />}
            </button>
          ))}
        </div>

        {error && <div className="mb-6 flex items-center gap-2 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle className="w-4 h-4" />{error}</div>}

        {step === 1 && (
          <section className="border border-border p-6 md:p-8">
            <StepHead n={1} icon={Users} title="Choose a client" />
            {loading.clients ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {clients.map((c) => (
                    <button key={c.id} onClick={() => setClientId(c.id)} className={`text-left border p-4 transition-colors ${clientId === c.id ? "border-primary bg-primary/5" : "border-border hover:border-primary"}`}>
                      <p className="font-medium text-sm">{c.name}</p>
                      {c.domain && <p className="text-xs text-muted-foreground mt-1">{c.domain}</p>}
                    </button>
                  ))}
                  {clients.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No clients yet. Create one below.</p>}
                </div>
                <div className="flex items-end gap-3 border-t border-border pt-5">
                  <div className="flex-1">
                    <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">New client name</label>
                    <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Acme Law Firm" className="w-full mt-1 border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <button onClick={createClient} className="px-4 py-2 bg-foreground text-background text-xs tracking-[0.15em] uppercase hover:opacity-90">Create</button>
                </div>
                {clientId && <div className="mt-4 flex justify-end"><button onClick={() => setStep(2)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-paper text-xs tracking-[0.2em] uppercase">Continue <ChevronRight className="w-4 h-4" /></button></div>}
              </>
            )}
          </section>
        )}

        {step === 2 && (
          <section className="border border-border p-6 md:p-8">
            <StepHead n={2} icon={Layers} title="Choose a template from the library" />
            {loading.packs ? <Loader2 className="w-5 h-5 animate-spin" /> : packs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approved packs in the library. Approve packs in the Studio first.</p>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {packs.map((p) => (
                    <button key={p.id} onClick={() => setPackId(p.id)} className={`text-left border overflow-hidden transition-colors ${packId === p.id ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary"}`}>
                      <div className="aspect-video bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground p-2 text-center">{p.name}</div>
                      <div className="p-3">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mt-1">{p.kind.replace("_", " ")}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {packId && <div className="mt-4 flex justify-end"><button onClick={() => setStep(3)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-paper text-xs tracking-[0.2em] uppercase">Continue <ChevronRight className="w-4 h-4" /></button></div>}
              </>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="border border-border p-6 md:p-8">
            <StepHead n={3} icon={Globe} title="Site setup" />
            <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
              <Field label="Site name"><input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Acme Law — Auto Accident" className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
              <Field label="URL slug (site live at /v/:slug)"><input value={siteSlug} onChange={(e) => setSiteSlug(e.target.value)} placeholder="acme-auto-accident" className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
              <Field label="Custom domain (optional)"><input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="https://acmeautolaw.com" className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
              <Field label="Industry"><input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Legal, Medical, Home Services..." className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
              <Field label="Content tone"><input value={contentTone} onChange={(e) => setContentTone(e.target.value)} placeholder="professional, authoritative, empathetic" className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
            </div>
            {selectedPack && <div className="mt-5 text-xs text-muted-foreground">Template: <span className="text-foreground font-medium">{selectedPack.name}</span></div>}
            <div className="mt-5 flex justify-end"><button onClick={() => setStep(4)} disabled={!siteName.trim() || !siteSlug.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-paper text-xs tracking-[0.2em] uppercase disabled:opacity-40">Continue <ChevronRight className="w-4 h-4" /></button></div>
          </section>
        )}

        {step === 4 && (
          <section className="border border-border p-6 md:p-8">
            <StepHead n={4} icon={Zap} title="Keywords / practice areas" />
            <p className="text-sm text-muted-foreground mb-3">Comma-separated. Each keyword becomes a page per location.</p>
            <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={3} placeholder="Car Accident Lawyer, Truck Accident Attorney, Motorcycle Accident Lawyer" className="w-full border border-border p-3 text-sm outline-none focus:border-primary" />
            {keywordList.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{keywordList.map((k) => <span key={k} className="px-3 py-1 text-xs border border-primary/30 bg-primary/5">{k}</span>)}</div>}
            <div className="mt-5 flex justify-end"><button onClick={() => setStep(5)} disabled={!keywordList.length} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-paper text-xs tracking-[0.2em] uppercase disabled:opacity-40">Continue <ChevronRight className="w-4 h-4" /></button></div>
          </section>
        )}

        {step === 5 && (
          <section className="border border-border p-6 md:p-8">
            <StepHead n={5} icon={MapPin} title="Choose locations" />
            <div className="flex flex-wrap gap-2 mb-4 text-xs">
              <button onClick={seedSample} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-primary">Seed 12 cities</button>
              <button onClick={seedBig} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-crimson text-crimson hover:bg-crimson hover:text-paper">Seed 120 US cities</button>
              {locations.length > 0 && <><button onClick={selectAllLocs} className="px-3 py-1.5 border border-border hover:border-primary">Select all</button><button onClick={clearLocs} className="px-3 py-1.5 border border-border">Clear selection</button></>}
              <span className="self-center text-muted-foreground">{selectedLocs.size} / {locations.length} selected</span>
            </div>
            <textarea value={locText} onChange={(e) => setLocText(e.target.value)} rows={3} placeholder={"One per line: City, ST, State, County\nLos Angeles, CA, California, Los Angeles"} className="w-full border border-border p-3 text-sm font-mono mb-3 outline-none focus:border-primary" />
            <button onClick={addLocations} className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs tracking-[0.15em] uppercase hover:opacity-90 mb-5">Add locations</button>
            {loading.locs ? <Loader2 className="w-5 h-5 animate-spin" /> : locations.length > 0 && (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-72 overflow-auto border-t border-border pt-3">
                {locations.map((l) => (
                  <button key={l.id} onClick={() => toggleLoc(l.id)} className={`flex items-center gap-2 border px-3 py-2 text-xs text-left transition-colors ${selectedLocs.has(l.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary"}`}>
                    {selectedLocs.has(l.id) && <Check className="w-3 h-3 text-primary shrink-0" />}
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    {l.city}, {l.state_code}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
              <div className="text-sm">
                <span className="text-muted-foreground">Pages to generate: </span>
                <span className="font-heading text-2xl text-crimson">{matrix.toLocaleString()}</span>
              </div>
              <button onClick={launch} disabled={!canLaunch || launching} className="inline-flex items-center gap-2 bg-crimson text-paper px-6 py-3 text-xs font-semibold tracking-[0.25em] uppercase hover:brightness-110 disabled:opacity-40">
                {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                {launching ? (progress?.phase || "Launching…") : `Launch ${matrix.toLocaleString()} pages`}
              </button>
            </div>
          </section>
        )}

        {step === 6 && result && (
          <section className="space-y-6">
            <div className="border border-border p-6 md:p-8 bg-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-crimson text-paper flex items-center justify-center"><Check className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-heading text-2xl">Launch complete</h3>
                  <p className="text-sm text-muted-foreground">{result.created} pages created · {result.updated} updated · {result.total} total</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                <Metric label="Pages" value={result.total} />
                <Metric label="AI content" value={result.content_generated ? "Yes" : "Fallback"} />
                <Metric label="Site version" value="Live" />
                <Metric label="Sitemap" value="Generated" />
              </div>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase mb-3">Proof links</h4>
              <div className="space-y-2">
                <ProofRow icon={ExternalLink} label="Live site" url={`${SITE_URL}/v/${result.site_slug}`} copied={copied === "site"} onCopy={() => copy("site", `${SITE_URL}/v/${result.site_slug}`)} />
                <ProofRow icon={FileCode} label="Sitemap" url={`${SITE_URL}/sitemap-${result.site_slug}.xml`} copied={copied === "sitemap"} onCopy={() => copy("sitemap", `${SITE_URL}/sitemap-${result.site_slug}.xml`)} />
                {result.sample_pages?.slice(0, 3).map((p, i) => (
                  <ProofRow key={i} icon={FileCode} label={`Page ${i + 1}`} url={`${SITE_URL}${p.route_path}`} copied={copied === `page${i}`} onCopy={() => copy(`page${i}`, `${SITE_URL}${p.route_path}`)} />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/admin/launched-sites" className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs tracking-[0.2em] uppercase">View in Launched Sites <ChevronRight className="w-4 h-4" /></Link>
              <button onClick={() => { setStep(1); setResult(null); }} className="px-5 py-2.5 border border-border text-xs tracking-[0.2em] uppercase hover:border-foreground">Launch another</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StepHead({ n, icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-8 h-8 rounded-sm bg-primary text-paper flex items-center justify-center"><Icon className="w-4 h-4" /></span>
      <h3 className="font-heading text-xl font-bold text-primary uppercase">{title}</h3>
    </div>
  );
}
function Field({ label, children }) {
  return <div><label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>;
}
function Metric({ label, value, highlight }) {
  return <div className="bg-background p-4"><div className={`font-heading text-2xl font-light tabular-nums ${highlight ? "text-crimson" : "text-primary"}`}>{value}</div><p className="text-[10px] tracking-[0.2em] uppercase mt-1 text-muted-foreground">{label}</p></div>;
}
function ProofRow({ icon: Icon, label, url, copied, onCopy }) {
  return <div className="flex items-center gap-3 border border-border p-3"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-xs tracking-[0.15em] uppercase text-muted-foreground w-16 shrink-0">{label}</span><a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate flex-1">{url}</a><button onClick={onCopy} className="inline-flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 border border-border hover:border-primary shrink-0">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}</button></div>;
}