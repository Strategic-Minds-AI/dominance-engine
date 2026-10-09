import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Loader2, Plus, RefreshCw, Zap, Clock, Check, X,
  Globe, Smartphone, Server, Image, Bot, FileText, Share2, Search, Package,
  TrendingUp, Activity, AlertCircle, Trash2, ExternalLink,
} from "lucide-react";

const JOB_TYPES = [
  { id: "website", label: "Website", icon: Globe, desc: "Generate landing pages with SEO content" },
  { id: "app", label: "App", icon: Smartphone, desc: "Generate an app specification" },
  { id: "system", label: "System", icon: Server, desc: "Generate a system architecture plan" },
  { id: "logo", label: "Logo", icon: Image, desc: "Generate a logo with DALL-E" },
  { id: "agents", label: "Agents", icon: Bot, desc: "Dispatch agent tasks to the fleet" },
  { id: "content", label: "Content", icon: FileText, desc: "Update brochures & business cards" },
  { id: "social", label: "Social", icon: Share2, desc: "Generate social media posts" },
  { id: "seo", label: "SEO", icon: Search, desc: "Generate SEO-optimized pages" },
  { id: "custom", label: "Custom", icon: Package, desc: "Anything — GPT figures it out" },
];

const SCHEDULES = [
  { id: "once", label: "One-time" },
  { id: "hourly", label: "Every hour" },
  { id: "daily", label: "Every day" },
  { id: "weekly", label: "Every week" },
  { id: "continuous", label: "Continuous (every minute)" },
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

const STATUS_STYLES = {
  pending: "border border-border",
  syncing: "bg-primary text-paper",
  completed: "bg-foreground text-background",
  failed: "bg-destructive text-destructive-foreground",
};

export default function SyncDashboard() {
  const [jobs, setJobs] = useState([]);
  const [sites, setSites] = useState([]);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [previewPack, setPreviewPack] = useState(null);
  const [newJob, setNewJob] = useState({
    title: "", description: "", job_type: "custom",
    source_url: "", target_site_id: "", schedule: "once", priority: "medium",
  });
  const [runResult, setRunResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [j, s, p] = await Promise.all([
        base44.entities.SyncJob.filter({}, { sort: "-created_date", limit: 100 }),
        base44.entities.LaunchedSite.filter({}, { sort: "name", limit: 100, fields: ["id", "name", "slug"] }),
        base44.entities.TemplatePack.filter({ source: "gpt_sync" }, { sort: "-created_date", limit: 24, fields: ["id", "name", "kind", "description", "preview_html", "status", "created_date"] }),
      ]);
      setJobs(j.items || []);
      setSites(s.items || []);
      setPacks(p.items || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createJob = async () => {
    if (!newJob.title.trim()) return;
    try {
      await base44.entities.SyncJob.create({ ...newJob, status: "pending", autonomous: true, gpt_model: "openai/gpt-4o" });
      setNewJob({ title: "", description: "", job_type: "custom", source_url: "", target_site_id: "", schedule: "once", priority: "medium" });
      setShowForm(false);
      load();
    } catch (e) { alert("Could not create job: " + e.message); }
  };

  const runSync = async (jobId) => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await base44.functions.invoke("syncEngine", jobId ? { job_id: jobId } : {});
      setRunResult(res.data);
      load();
    } catch (e) { setRunResult({ error: e.message }); }
    finally { setRunning(false); }
  };

  const deleteJob = async (job) => {
    if (!confirm("Delete this sync job?")) return;
    try { await base44.entities.SyncJob.delete(job.id); load(); }
    catch (e) { alert("Could not delete: " + e.message); }
  };

  const stats = {
    pending: jobs.filter(j => j.status === "pending").length,
    syncing: jobs.filter(j => j.status === "syncing").length,
    completed: jobs.filter(j => j.status === "completed").length,
    failed: jobs.filter(j => j.status === "failed").length,
  };

  const selectedType = JOB_TYPES.find(t => t.id === newJob.job_type);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-30">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-heading text-xl">YOUR FIRM</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-crimson border-l border-border pl-6">Universal Sync Engine</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/admin" className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">Leads</Link>
            <Link to="/admin/launched-sites" className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">Sites</Link>
            <Link to="/" className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 space-y-8">
        <section className="border border-border p-6 md:p-8 bg-gradient-to-br from-foreground to-foreground/90 text-background">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-sm bg-crimson flex items-center justify-center"><Zap className="w-5 h-5 text-paper" /></div>
                <h2 className="font-heading text-2xl font-bold uppercase">24/7 Persistent Sync</h2>
              </div>
              <p className="text-sm text-background/70 max-w-xl">Powered by your GPT business account through the Vercel AI Gateway. Install any website, app, system, logo, agent, or content — the engine runs continuously and processes jobs from the queue.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 border border-background/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] tracking-[0.2em] uppercase">Engine Online</span>
              </div>
              <button onClick={() => runSync()} disabled={running} className="inline-flex items-center gap-2 bg-crimson text-paper px-5 py-2.5 text-xs tracking-[0.2em] uppercase hover:brightness-110 disabled:opacity-40">
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {running ? "Syncing…" : "Run sync now"}
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border">
          <StatCard icon={Clock} label="Pending" value={stats.pending} color="text-primary" />
          <StatCard icon={Activity} label="Syncing" value={stats.syncing} color="text-crimson" />
          <StatCard icon={Check} label="Completed" value={stats.completed} color="text-emerald-600" />
          <StatCard icon={AlertCircle} label="Failed" value={stats.failed} color="text-destructive" />
        </div>

        {runResult && (
          <div className={`border p-4 ${runResult.error ? "border-destructive bg-destructive/5" : "border-emerald-600 bg-emerald-50"}`}>
            {runResult.error ? (
              <p className="text-sm text-destructive">{runResult.error}</p>
            ) : (
              <div>
                <p className="text-sm font-medium mb-2">Sync complete — {runResult.processed} jobs processed</p>
                {(runResult.results || []).map((r, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-center gap-2 py-1">
                    {r.status === "completed" || r.status === "recurring" ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-destructive" />}
                    <span className="font-medium">{r.title}</span><span>— {r.status}</span>
                    {r.actions != null && <span>— {r.actions} actions</span>}
                    {r.error && <span className="text-destructive">— {r.error}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showForm && (
          <section className="border border-border p-6 space-y-5">
            <h3 className="font-heading text-lg font-bold uppercase">New Sync Job</h3>
            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">What to install</label>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {JOB_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setNewJob(j => ({ ...j, job_type: t.id }))} className={`border p-3 text-center transition-colors ${newJob.job_type === t.id ? "border-primary bg-primary/5" : "border-border hover:border-foreground"}`}>
                      <Icon className={`w-5 h-5 mx-auto mb-1.5 ${newJob.job_type === t.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-[10px] tracking-[0.1em] uppercase block">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{selectedType?.desc}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">Title</label>
                <input value={newJob.title} onChange={(e) => setNewJob(j => ({ ...j, title: e.target.value }))} placeholder="e.g., Install a dental clinic website for Austin, TX" className="w-full border border-border px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">Source URL (optional)</label>
                <input value={newJob.source_url} onChange={(e) => setNewJob(j => ({ ...j, source_url: e.target.value }))} placeholder="https://example.com (content to sync from)" className="w-full border border-border px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">Description — tell GPT exactly what to install</label>
              <textarea value={newJob.description} onChange={(e) => setNewJob(j => ({ ...j, description: e.target.value }))} rows={4} placeholder="e.g., Generate a 5-page website for a personal injury law firm in Dallas, TX. Include a home page, practice areas (car accidents, truck accidents, slip and fall), about us, and contact page. Each page should have SEO-optimized content with local keywords." className="w-full border border-border p-3 text-sm outline-none focus:border-primary" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">Target site (optional)</label>
                <select value={newJob.target_site_id} onChange={(e) => setNewJob(j => ({ ...j, target_site_id: e.target.value }))} className="w-full border border-border px-3 py-2.5 text-sm outline-none bg-background">
                  <option value="">— Create new —</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">Schedule</label>
                <select value={newJob.schedule} onChange={(e) => setNewJob(j => ({ ...j, schedule: e.target.value }))} className="w-full border border-border px-3 py-2.5 text-sm outline-none bg-background">
                  {SCHEDULES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">Priority</label>
                <select value={newJob.priority} onChange={(e) => setNewJob(j => ({ ...j, priority: e.target.value }))} className="w-full border border-border px-3 py-2.5 text-sm outline-none bg-background">
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={createJob} disabled={!newJob.title.trim()} className="inline-flex items-center gap-2 bg-crimson text-paper px-5 py-2.5 text-xs tracking-[0.2em] uppercase hover:brightness-110 disabled:opacity-40">
                <Plus className="w-4 h-4" /> Add to sync queue
              </button>
              <button onClick={() => setShowForm(false)} className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold uppercase">Sync Queue</h3>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs tracking-[0.15em] uppercase hover:border-foreground">
                <Plus className="w-3.5 h-3.5" /> New sync job
              </button>
            )}
          </div>
          {loading ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : jobs.length === 0 ? (
            <div className="border border-border p-10 text-center">
              <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No sync jobs yet. Add one to start the 24/7 engine.</p>
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-crimson text-paper px-4 py-2 text-xs tracking-[0.2em] uppercase hover:brightness-110">
                <Plus className="w-3.5 h-3.5" /> Create your first sync job
              </button>
            </div>
          ) : (
            <div className="border-t border-border">
              {jobs.map((job) => {
                const typeInfo = JOB_TYPES.find(t => t.id === job.job_type) || JOB_TYPES[8];
                const Icon = typeInfo.icon;
                const targetSite = sites.find(s => s.id === job.target_site_id);
                return (
                  <div key={job.id} className="border-b border-border py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-sm border border-border flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-muted-foreground" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-sm font-medium truncate">{job.title}</h4>
                          <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 shrink-0 ${STATUS_STYLES[job.status] || ""}`}>{job.status}</span>
                          {job.schedule !== "once" && (
                            <span className="text-[10px] tracking-[0.15em] uppercase text-primary shrink-0 flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> {job.schedule}</span>
                          )}
                        </div>
                        {job.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{job.description}</p>}
                        {job.result && <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-2">{job.result}</p>}
                        <div className="flex items-center gap-4 text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                          <span>{typeInfo.label}</span><span>· {job.priority}</span>
                          {job.actions_count > 0 && <span>· {job.actions_count} actions</span>}
                          {targetSite && <span>· → {targetSite.name}</span>}
                          {job.last_synced_at && <span>· last: {new Date(job.last_synced_at).toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {job.status === "pending" && (
                          <button onClick={() => runSync(job.id)} disabled={running} className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-crimson text-crimson hover:bg-crimson hover:text-paper disabled:opacity-40">
                            <Zap className="w-3 h-3" /> Run now
                          </button>
                        )}
                        <button onClick={() => deleteJob(job)} className="p-1.5 border border-border text-destructive hover:border-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {packs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold uppercase">Generated Visual Packs</h3>
              <Link to="/admin/studio" className="text-[10px] tracking-[0.2em] uppercase text-crimson hover:brightness-110">View in Studio →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packs.map((pack) => (
                <button key={pack.id} onClick={() => setPreviewPack(pack)} className="border border-border text-left hover:border-foreground transition-colors group">
                  <div className="aspect-video bg-secondary/30 overflow-hidden border-b border-border relative">
                    {pack.preview_html ? (
                      <iframe srcDoc={pack.preview_html} className="absolute inset-0 w-full h-full pointer-events-none" sandbox="" loading="lazy" title={pack.name} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No preview</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">{pack.kind}</span>
                      <span className={`text-[10px] tracking-[0.15em] uppercase px-1.5 py-0.5 ${pack.status === "approved" ? "bg-foreground text-background" : "border border-border"}`}>{pack.status}</span>
                    </div>
                    <h4 className="text-sm font-medium truncate group-hover:text-crimson">{pack.name}</h4>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {previewPack && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setPreviewPack(null)}>
            <div className="bg-background max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-heading text-lg font-bold">{previewPack.name}</h3>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{previewPack.kind} · {previewPack.status}</p>
                </div>
                <button onClick={() => setPreviewPack(null)} className="p-2 border border-border hover:border-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-hidden bg-secondary/30">
                {previewPack.preview_html ? (
                  <iframe srcDoc={previewPack.preview_html} className="w-full h-full min-h-[500px]" sandbox="" title={previewPack.name} />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No preview HTML</div>
                )}
              </div>
            </div>
          </div>
        )}

        <section className="border border-border p-6">
          <h3 className="font-heading text-lg font-bold uppercase mb-4">How the 24/7 sync works</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Step n={1} title="Add a job" desc="Describe what to install in natural language. GPT figures out the rest." />
            <Step n={2} title="GPT analyzes" desc="Your GPT business account reads the request and generates an action plan." />
            <Step n={3} title="Engine executes" desc="Pages, posts, logos, agents, and content are created automatically." />
            <Step n={4} title="Runs 24/7" desc="A scheduled workflow processes the queue every hour. Recurring jobs re-run on schedule." />
          </div>
          <div className="mt-6 p-4 border border-border bg-secondary/30">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Note:</strong> The scheduled workflow that powers 24/7 automatic processing requires Base44 integration credits, which are currently exhausted. Credits reset on 2026-10-12. Until then, use the "Run sync now" button to process jobs manually. All GPT AI calls route through your Vercel AI Gateway key and are not affected by the credit limit.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="border-r border-b border-border p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color || "text-muted-foreground"}`} />
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
      </div>
      <div className="font-heading text-3xl font-light tabular-nums">{value}</div>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="border border-border p-4">
      <div className="w-7 h-7 rounded-sm bg-foreground text-background flex items-center justify-center font-heading text-sm font-bold mb-3">{n}</div>
      <h4 className="text-sm font-medium mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
    </div>
  );
}