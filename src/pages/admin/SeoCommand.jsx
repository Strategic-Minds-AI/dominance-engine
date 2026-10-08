import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Rocket, Zap, Bot, Search, Wrench, Eye, Brain, Shield, Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const SEO_AGENTS = [
  { name: "vision_cortex_orchestrator", icon: Brain, desc: "Master autonomous AI — runs the entire Search Dominance OS. 7-phase strategy: discover, research, test, validate, perfect, achieve, evolve.", color: "text-purple-400" },
  { name: "seo_commander", icon: Rocket, desc: "Autonomous orchestrator — coordinates the agent council, drives every URL to top-5 non-stop.", color: "text-[#00d4ff]" },
  { name: "seo_scout", icon: Search, desc: "Relentless discoverer — sweeps forums, Google blogs, patents, top SEO sites for ranking methods.", color: "text-emerald-400" },
  { name: "seo_builder", icon: Zap, desc: "Autonomous executor — CloudBrowser citation building, social media, GBP, content deployment.", color: "text-amber-400" },
  { name: "seo_healer", icon: Wrench, desc: "Autonomous repair — diagnoses blocked rows, generates fixes, retries failed operations.", color: "text-orange-400" },
  { name: "browser_swarm", icon: Eye, desc: "Browser automation — drives CloudBrowser engine for scraping, extraction, form filling.", color: "text-blue-400" },
  { name: "questionable_auditor", icon: Shield, desc: "Ingestion quality gate — audits questionable items, promotes or trashes based on 3 filters.", color: "text-red-400" },
];

export default function SeoCommand() {
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState(null);
  const [form, setForm] = useState({ name: "", locations: "", services: "" });
  const queryClient = useQueryClient();

  const { data: campaigns } = useQuery({
    queryKey: ["launch-campaigns"],
    queryFn: async () => (await base44.entities.LaunchCampaign.filter({}, { sort: "-created_date", limit: 20 })).items,
  });

  const { data: websites } = useQuery({
    queryKey: ["dd-websites-for-launch"],
    queryFn: async () => (await base44.entities.Website.filter({ status: { $in: ["preview_ready", "published"] } }, { limit: 50 })).items,
  });

  const launchCampaign = async () => {
    if (!form.name || !form.locations || !form.services || !websites?.length) return;
    setLaunching(true);
    setLaunchResult(null);
    try {
      const res = await base44.functions.invoke("launchCampaign", {
        name: form.name,
        locations_text: form.locations,
        services_text: form.services,
        website_ids: websites.map((w) => w.id),
      });
      setLaunchResult(res.data || res);
      queryClient.invalidateQueries({ queryKey: ["launch-campaigns"] });
    } catch (e) {
      setLaunchResult({ error: e.message });
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          SEO <span className="text-[#00d4ff]">Command</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Build-Scale-Dominate launch engine + 7 SEO autonomous agents from seo-generator6.
        </p>
      </div>

      {/* SEO Agents */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <Bot className="h-4 w-4 text-[#00f2ff]" /> Autonomous SEO Agent Fleet
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SEO_AGENTS.map(({ name, icon: Icon, desc, color }) => (
            <div key={name} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="text-sm font-medium">{name}</span>
              </div>
              <p className="mt-2 text-xs text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Campaign */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <Rocket className="h-4 w-4 text-[#00f2ff]" /> Launch Programmatic Campaign
        </h2>
        <p className="mt-1 text-xs text-white/40">Queue mass page generation across locations × services. The Generation Queue Processor workflow drains the queue every 5 minutes.</p>
        <div className="mt-4 grid gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40">Campaign Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Dallas Plumbing Launch" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00f2ff]/50" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40">Locations (one per line)</label>
              <textarea value={form.locations} onChange={(e) => setForm({ ...form, locations: e.target.value })} rows={4} placeholder={"Dallas\nFort Worth\nArlington"} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00f2ff]/50" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40">Services (one per line)</label>
              <textarea value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} rows={4} placeholder={"Emergency Plumbing\nWater Heater Repair\nDrain Cleaning"} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00f2ff]/50" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={launchCampaign} disabled={launching || !form.name || !form.locations || !form.services} className="inline-flex items-center gap-2 rounded-lg bg-[#00f2ff] px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40">
              {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Launch Campaign
            </button>
            <span className="text-xs text-white/40">{websites?.length || 0} website templates ready</span>
          </div>
          {launchResult && (
            <div className={`rounded-lg border p-3 text-sm ${launchResult.error ? "border-red-500/30 bg-red-500/5 text-red-300" : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"}`}>
              {launchResult.error ? <><AlertCircle className="inline h-4 w-4 mr-1" /> {launchResult.error}</> : <><CheckCircle className="inline h-4 w-4 mr-1" /> Campaign launched: {launchResult.total_pages} pages queued across {websites.length} templates</>}
            </div>
          )}
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <Zap className="h-4 w-4 text-[#00f2ff]" /> Active Campaigns
        </h2>
        {!campaigns?.length ? (
          <p className="mt-3 text-sm text-white/40">No campaigns yet. Launch one above.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-white/40">{c.pages_generated || 0} / {c.total_pages || 0} pages generated</div>
                </div>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${c.status === "completed" ? "bg-emerald-500/15 text-emerald-300" : c.status === "running" ? "bg-[#00f2ff]/15 text-[#00d4ff]" : "bg-white/5 text-white/40"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO Function Catalog */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <Brain className="h-4 w-4 text-[#00f2ff]" /> SEO Generator Function Catalog
        </h2>
        <p className="mt-1 text-xs text-white/40">120 backend functions from seo-generator6 — autonomous SEO pipeline, site audits, competitor analysis, content generation, ranking method discovery, and more. Available for invocation via the Vision Cortex Orchestrator agent.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {["GodModeOrchestrator","MasterOrchestrator","AutonomousPipeline","DigitalDominanceGenerator","VisionCortexOrchestrator","SystemSelfReflection","EvolutionEngine","AutonomousSystemImplementer","AutonomousConvergence","SystemDNA","SiteAudit","TechnicalSeoAudit","CroAudit","SecurityScan","AnalyzeCompetitors","DeepDiscoveryScan","ExtractDesignDNA","ContentGenerator","RewriteContentForSeo","GenerateHeadlines","GenerateCopyVariants","KeywordCluster","ScrapeIndustryKnowledge","ScrapeIndustryPricing","ComputeIndustryBenchmarks","GenerateRankingMethods","ResearchBestMethods","DiscoverTopPerformers","TractionScanner","BacklinkTracker","DraftOutreach","CoreWebVitalsMonitor","SchemaValidator","InternalLinkOptimizer","IndexNowPing","GenerateSitemap","SearchConsoleIndex","SyncSearchConsole","CompetitorWatchdog","AnomalyDetection","PredictiveRankingModel","ABTestRunner","CrossDomainAuthorityBuilder","AISearchVisibility","MultiPlatformSocialSync","GoogleBusinessProfileSync","WeeklyDigest","SprintPlanner","GenerateRepairPlan","FixEngine","AutoHealingEscalation","ValidateSystem","ScrapeUrl","SeoCrawlSite","DispatchBrowserJob","CloneTopNiches","RecloneSite","EndToEndGenerator","DeepArchitecturePipeline","GenerateNearMeCandidates","DiscoverUltraHighSearchPhrases","StrategySimulator","EvolutionEngine","LiveSimulatorPersona","ScrapeBase44Apps","ProvisioningManager","ABTestRunner","AreTwinOptimizer","DiscoverTopPerformers","BulkProcess","VercelDomains","IndexNowPing","MultiPlatformSocialSync","ResearchBestMethods","IngestComplianceRequirements","StripeCheckout","OnboardClient","TractionScanner","WeeklyDigest","ManageApiKey","ScoreValidation","ResolveVariables","SystemDNA","AnalyzeCompetitors","ValidateSystem","ScoutTechNews","BatchSubmitToSites","AreBenchmark","AlgorithmUpdateMonitor","VercelAIGateway","EndToEndGenerator","ValidationMesh","UniversalImplementer","FixEngine","GoogleWorkspaceSync"].map((fn, i) => (
            <div key={i} className="rounded border border-white/10 bg-white/[0.02] px-2 py-1.5 text-[11px] font-mono text-white/50">{fn}</div>
          ))}
        </div>
        <p className="mt-3 text-xs text-amber-400/60">Note: SEO functions require their shared modules and entities to be installed before invocation. The 7 agents and BSD launch system are fully installed and ready.</p>
      </div>
    </div>
  );
}