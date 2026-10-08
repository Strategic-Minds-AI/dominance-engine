import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Library, Search, Filter, TrendingUp, DollarSign, Zap, Shield, ChevronDown, ChevronUp } from "lucide-react";

export default function IndustryLibrary() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [archetypeFilter, setArchetypeFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState("opportunity");

  const { data: useCases, isLoading } = useQuery({
    queryKey: ["system-use-cases"],
    queryFn: async () => (await base44.entities.SystemUseCase.filter({}, { sort: "-created_date", limit: 200 })).items,
  });

  const { data: allForFilters } = useQuery({
    queryKey: ["system-use-case-filters"],
    queryFn: async () => (await base44.entities.SystemUseCase.filter({}, { limit: 500, fields: ["industry", "system_archetype", "risk_class"] })).items,
  });

  const industries = useMemo(() => {
    const set = new Set((allForFilters || []).map((u) => u.industry).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [allForFilters]);

  const archetypes = useMemo(() => {
    const set = new Set((allForFilters || []).map((u) => u.system_archetype).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [allForFilters]);

  const filtered = useMemo(() => {
    let list = useCases || [];
    if (industryFilter !== "all") list = list.filter((u) => u.industry === industryFilter);
    if (archetypeFilter !== "all") list = list.filter((u) => u.system_archetype === archetypeFilter);
    if (riskFilter !== "all") list = list.filter((u) => u.risk_class === riskFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        (u.system_idea || "").toLowerCase().includes(q) ||
        (u.core_outcome || "").toLowerCase().includes(q) ||
        (u.subindustry || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "opportunity") {
      list = [...list].sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0));
    } else if (sortBy === "setup_price") {
      list = [...list].sort((a, b) => (b.setup_price || 0) - (a.setup_price || 0));
    }
    return list;
  }, [useCases, industryFilter, archetypeFilter, riskFilter, search, sortBy]);

  const scoreColor = (score) => {
    if (!score) return "text-white/40";
    if (score >= 4) return "text-emerald-400";
    if (score >= 3) return "text-[#00d4ff]";
    return "text-amber-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          X1 Industry <span className="text-[#00d4ff]">Library</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">
          4,000 system use cases across 20 industries × 20 subindustries × 10 system archetypes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Library} label="Total Use Cases" value={allForFilters?.length ?? "—"} />
        <StatCard icon={Filter} label="Industries" value={industries.length - 1} accent="text-[#00d4ff]" />
        <StatCard icon={Zap} label="Archetypes" value={archetypes.length - 1} accent="text-[#00d4ff]" />
        <StatCard icon={TrendingUp} label="Top Score" value={filtered[0]?.opportunity_score?.toFixed(2) || "—"} accent="text-emerald-400" />
      </div>

      {/* Filters */}
      <div className="dd-panel rounded-xl p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40">Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ideas, outcomes..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-sm text-white outline-none focus:border-[#00f2ff]/50 placeholder:text-white/30"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40">Industry</label>
            <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
              {industries.map((i) => <option key={i} value={i}>{i === "all" ? "All Industries" : i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40">Archetype</label>
            <select value={archetypeFilter} onChange={(e) => setArchetypeFilter(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
              {archetypes.map((a) => <option key={a} value={a}>{a === "all" ? "All Archetypes" : a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
              <option value="opportunity">Opportunity Score</option>
              <option value="setup_price">Setup Price</option>
            </select>
          </div>
        </div>
        {riskFilter !== "all" || industryFilter !== "all" || archetypeFilter !== "all" || search.trim() ? (
          <button onClick={() => { setIndustryFilter("all"); setArchetypeFilter("all"); setRiskFilter("all"); setSearch(""); }} className="mt-3 text-xs text-[#00d4ff] hover:underline">
            Clear all filters
          </button>
        ) : null}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-white/10 border-t-[#00f2ff] rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="dd-panel rounded-xl p-8 text-center text-sm text-white/40">No use cases match your filters.</div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-white/40">{filtered.length} use cases</div>
          {filtered.slice(0, 50).map((uc) => (
            <div key={uc.id} className="dd-panel rounded-xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === uc.id ? null : uc.id)} className="w-full p-4 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-[#00f2ff]">{uc.use_case_id}</span>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-white/50">{uc.risk_class}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-medium text-white/90">{uc.system_idea}</h3>
                    <p className="mt-0.5 text-xs text-white/40">{uc.industry} · {uc.subindustry} · {uc.system_archetype}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {uc.opportunity_score && (
                      <div className="text-center">
                        <div className={`text-lg font-bold ${scoreColor(uc.opportunity_score)}`}>{uc.opportunity_score.toFixed(1)}</div>
                        <div className="text-[9px] uppercase tracking-widest text-white/30">Score</div>
                      </div>
                    )}
                    {expanded === uc.id ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
                  </div>
                </div>
              </button>
              {expanded === uc.id && (
                <div className="border-t border-white/10 p-4 space-y-3 text-xs">
                  {uc.core_outcome && (
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-white/40">Core Outcome</span>
                      <p className="mt-1 text-white/70">{uc.core_outcome}</p>
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {uc.frontend_surfaces && <Detail label="Frontend" value={uc.frontend_surfaces} />}
                    {uc.backend_components && <Detail label="Backend" value={uc.backend_components} />}
                    {uc.agents_ai && <Detail label="Agents / AI" value={uc.agents_ai} />}
                    {uc.key_connectors && <Detail label="Connectors" value={uc.key_connectors} />}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Score label="Autonomy" value={uc.autonomy} />
                    <Score label="Monetization" value={uc.monetization} />
                    <Score label="Complexity" value={uc.complexity} />
                    <Score label="Repeatability" value={uc.repeatability} />
                    {uc.setup_price && <div className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-emerald-400" /><span className="text-white/60">${uc.setup_price.toLocaleString()} setup</span></div>}
                    {uc.monthly_price && <div className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-emerald-400" /><span className="text-white/60">${uc.monthly_price.toLocaleString()}/mo</span></div>}
                  </div>
                  {uc.monetization_model && <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2"><span className="text-[10px] uppercase tracking-widest text-white/40">Model</span> <span className="ml-2 text-white/70">{uc.monetization_model}</span></div>}
                  {uc.recommended_stack && <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2"><span className="text-[10px] uppercase tracking-widest text-white/40">Stack</span> <span className="ml-2 text-white/70">{uc.recommended_stack}</span></div>}
                </div>
              )}
            </div>
          ))}
          {filtered.length > 50 && <p className="text-center text-xs text-white/40">Showing first 50 of {filtered.length}. Refine filters to see more.</p>}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="dd-panel rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-white/50">{label}</span>
        <Icon className="h-4 w-4 text-[#00f2ff]" />
      </div>
      <div className={`mt-2 text-2xl font-bold ${accent || "text-white"}`}>{value}</div>
    </div>
  );
}

function Detail({ label, value }) {
  return <div><span className="text-[10px] uppercase tracking-widest text-white/40">{label}</span><p className="mt-0.5 text-white/60">{value}</p></div>;
}

function Score({ label, value }) {
  return <div className="flex items-center gap-1"><span className="text-[10px] uppercase tracking-widest text-white/40">{label}</span><span className="text-white/70">{value}/5</span></div>;
}