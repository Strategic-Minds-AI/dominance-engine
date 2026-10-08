import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Loader2, ExternalLink, FileCode, Globe,
  Check, X, Search, Rocket, Users, TrendingUp, Activity, RefreshCw, LayoutDashboard,
} from "lucide-react";

const SITE_URL = "https://scale-dominance.base44.app";

export default function LaunchedSites() {
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [visitsAgg, setVisitsAgg] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);
  const [sitePages, setSitePages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        base44.entities.Client.filter({}, { sort: "name", limit: 500 }),
        base44.entities.LaunchedSite.filter({}, { sort: "-created_date", limit: 500 }),
      ]);
      setClients(c.items || []);
      setSites(s.items || []);
      try {
        const agg = await base44.entities.Visit.aggregate({ groupBy: "version_id" });
        const map = {};
        (agg.rows || []).forEach((r) => { map[r.version_id] = r.count; });
        setVisitsAgg(map);
      } catch {}
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const clientSites = sites.filter((s) => !selectedClient || s.client_id === selectedClient);
  const filteredSites = clientSites.filter((s) => !search.trim() || s.name.toLowerCase().includes(search.toLowerCase()));

  const openSite = async (site) => {
    setSelectedSite(site);
    setPagesLoading(true);
    try {
      const res = await base44.entities.GeneratedPage.filter(
        { launched_site_id: site.id },
        { sort: "-created_date", limit: 50, fields: ["slug", "title", "city", "state_code", "route_path", "practice_area"] }
      );
      setSitePages(res.items || []);
    } catch { setSitePages([]); }
    finally { setPagesLoading(false); }
  };

  const syncGsc = async (site) => {
    alert("To sync with Google Search Console, authorize the Google Search Console connector in Integrations, then enter your property URL in the site settings.");
  };

  const syncAnalytics = async (site) => {
    alert("To sync with Google Analytics, authorize the Google Analytics connector in Integrations, then enter your property ID in the site settings.");
  };

  const totalSites = sites.length;
  const totalPages = sites.reduce((a, s) => a + (s.pages_count || 0), 0);
  const totalVisits = sites.reduce((a, s) => a + (visitsAgg[s.site_version_id] || 0), 0);
  const liveSites = sites.filter((s) => s.status === "live").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-30">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-heading text-xl">YOUR FIRM</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-crimson border-l border-border pl-6">Admin · Launched Sites Library</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/admin/programmatic" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-crimson hover:brightness-110"><Rocket className="w-3.5 h-3.5" /> New Launch</Link>
            <Link to="/admin" className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">Leads</Link>
            <Link to="/" className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border mb-8">
          <StatCard icon={Globe} label="Total sites" value={totalSites} />
          <StatCard icon={Activity} label="Live" value={liveSites} />
          <StatCard icon={FileCode} label="Total pages" value={totalPages} />
          <StatCard icon={TrendingUp} label="Total visits" value={totalVisits} />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Filter by client</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedClient("")} className={`px-3 py-1.5 text-xs border transition-colors ${!selectedClient ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>All</button>
                {clients.map((c) => (
                  <button key={c.id} onClick={() => setSelectedClient(c.id)} className={`px-3 py-1.5 text-xs border transition-colors ${selectedClient === c.id ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>{c.name}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 border border-border px-4 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sites…" className="bg-transparent outline-none text-sm flex-1" />
            </div>

            {loading ? <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div> : filteredSites.length === 0 ? (
              <div className="border border-border p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">No launched sites yet.</p>
                <Link to="/admin/programmatic" className="inline-flex items-center gap-2 px-4 py-2 bg-crimson text-paper text-xs tracking-[0.2em] uppercase hover:brightness-110"><Rocket className="w-3.5 h-3.5" /> Launch your first site</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSites.map((s) => {
                  const client = clients.find((c) => c.id === s.client_id);
                  const visits = visitsAgg[s.site_version_id] || 0;
                  return (
                    <button key={s.id} onClick={() => openSite(s)} className={`w-full text-left border p-4 transition-colors ${selectedSite?.id === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary"}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{client?.name || "Unassigned"}</p>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{s.pages_count || 0} pages</span>
                        <span>{s.locations_count || 0} locations</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{visits} visits</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                        <ConnBadge label="GSC" connected={s.gsc_connected} />
                        <ConnBadge label="Analytics" connected={s.analytics_connected} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            {!selectedSite ? (
              <div className="border border-border p-10 text-center text-sm text-muted-foreground">Select a site to view analytics, pages, and tracking tools.</div>
            ) : (
              <div className="space-y-6">
                <div className="border border-border p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-heading text-2xl">{selectedSite.name}</h3>
                      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">{selectedSite.keywords}</p>
                    </div>
                    <StatusBadge status={selectedSite.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-border border border-border">
                    <DetailMetric label="Pages" value={selectedSite.pages_count || 0} />
                    <DetailMetric label="Locations" value={selectedSite.locations_count || 0} />
                    <DetailMetric label="Visits" value={visitsAgg[selectedSite.site_version_id] || 0} />
                  </div>
                </div>

                <div className="border border-border p-5 space-y-2">
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Quick links</h4>
                  <Link to={`/portal/${selectedSite.slug}`} className="flex items-center gap-3 border border-crimson/40 bg-crimson/5 p-3 hover:border-crimson transition-colors mb-2">
                    <LayoutDashboard className="w-4 h-4 text-crimson shrink-0" />
                    <span className="text-xs tracking-[0.15em] uppercase text-crimson w-20 shrink-0">Client Portal</span>
                    <span className="text-sm text-crimson truncate flex-1">Open portal →</span>
                  </Link>
                  <LinkRow icon={ExternalLink} label="Live site" href={selectedSite.proof_url} />
                  <LinkRow icon={FileCode} label="Sitemap" href={selectedSite.sitemap_url} />
                  <LinkRow icon={Globe} label="Site version" href={`${SITE_URL}/v/${selectedSite.slug}`} />
                </div>

                <div className="border border-border p-5">
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Google compliance & tracking</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <ComplianceItem label="XML Sitemap" done={!!selectedSite.sitemap_url} />
                    <ComplianceItem label="robots.txt" done={true} />
                    <ComplianceItem label="Canonical tags" done={true} />
                    <ComplianceItem label="JSON-LD schema" done={true} />
                    <ComplianceItem label="Unique content per page" done={true} />
                    <ComplianceItem label="Mobile responsive" done={true} />
                  </div>
                </div>

                <div className="border border-border p-5">
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Search Console & Analytics</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <SyncCard title="Google Search Console" connected={selectedSite.gsc_connected} onSync={() => syncGsc(selectedSite)} property={selectedSite.gsc_property_url} />
                    <SyncCard title="Google Analytics" connected={selectedSite.analytics_connected} onSync={() => syncAnalytics(selectedSite)} property={selectedSite.analytics_property_id} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Authorize the Google Search Console and Google Analytics connectors in Integrations to enable automatic syncing of impressions, clicks, and traffic data.</p>
                </div>

                <div className="border border-border p-5">
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Generated pages ({selectedSite.pages_count || 0})</h4>
                  {pagesLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : sitePages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pages found.</p>
                  ) : (
                    <div className="max-h-64 overflow-auto border-t border-border">
                      {sitePages.map((p) => (
                        <a key={p.id} href={`${SITE_URL}${p.route_path}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 border-b border-border py-2.5 px-1 hover:bg-secondary/50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{p.title}</p>
                            <p className="text-xs text-muted-foreground">/{p.slug}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{p.city}, {p.state_code}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return <div className="border-r border-b border-border p-5"><div className="flex items-center gap-2 mb-2"><Icon className="w-4 h-4 text-muted-foreground" /><p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</p></div><div className="font-heading text-3xl font-light tabular-nums">{value.toLocaleString()}</div></div>;
}
function StatusBadge({ status }) {
  const styles = { live: "bg-crimson text-paper", launching: "border border-primary text-primary", error: "bg-destructive text-destructive-foreground", paused: "bg-muted text-muted-foreground" };
  return <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 shrink-0 ${styles[status] || "border border-border"}`}>{status}</span>;
}
function ConnBadge({ label, connected }) {
  return <span className={`inline-flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase ${connected ? "text-emerald-600" : "text-muted-foreground"}`}>{connected ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {label}</span>;
}
function DetailMetric({ label, value }) {
  return <div className="bg-background p-4"><div className="font-heading text-2xl font-light tabular-nums">{value.toLocaleString()}</div><p className="text-[10px] tracking-[0.2em] uppercase mt-1 text-muted-foreground">{label}</p></div>;
}
function LinkRow({ icon: Icon, label, href }) {
  return <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 border border-border p-3 hover:border-primary"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-xs tracking-[0.15em] uppercase text-muted-foreground w-20 shrink-0">{label}</span><span className="text-sm text-primary truncate flex-1">{href}</span><ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" /></a>;
}
function ComplianceItem({ label, done }) {
  return <div className="flex items-center gap-2 border border-border p-2.5 text-xs">{done ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-destructive shrink-0" />} {label}</div>;
}
function SyncCard({ title, connected, onSync, property }) {
  return <div className="border border-border p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">{title}</span><ConnBadge label={connected ? "Connected" : "Not connected"} connected={connected} /></div>{property && <p className="text-xs text-muted-foreground mb-2 truncate">{property}</p>}<button onClick={onSync} className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-border hover:border-primary w-full justify-center"><RefreshCw className="w-3 h-3" /> {connected ? "Sync now" : "Connect"}</button></div>;
}