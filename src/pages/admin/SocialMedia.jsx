import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Share2, RefreshCw, Calendar, Image as ImageIcon, Bot, Rocket,
  Loader2, CheckCircle, Clock, Filter, Zap
} from "lucide-react";

const PLATFORMS = ["facebook", "instagram", "twitter", "linkedin", "tiktok", "google_business"];
const PLATFORM_COLORS = {
  facebook: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  instagram: "bg-pink-600/20 text-pink-400 border-pink-600/30",
  twitter: "bg-sky-600/20 text-sky-400 border-sky-600/30",
  linkedin: "bg-blue-700/20 text-blue-500 border-blue-700/30",
  tiktok: "bg-white/10 text-white border-white/20",
  google_business: "bg-green-600/20 text-green-400 border-green-600/30",
};

export default function SocialMedia() {
  const queryClient = useQueryClient();
  const [selectedSite, setSelectedSite] = useState(null);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState({});

  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ["dd-sites-social"],
    queryFn: async () => (await base44.entities.LaunchedSite.filter({}, { sort: "-created_date", limit: 100 })).items,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["dd-social-posts", selectedSite, platformFilter],
    queryFn: async () => {
      const query = {};
      if (selectedSite) query.launched_site_id = selectedSite;
      if (platformFilter !== "all") query.platform = platformFilter;
      return (await base44.entities.SocialPost.filter(query, { sort: "-scheduled_at", limit: 100 })).items;
    },
  });

  const { data: allPosts } = useQuery({
    queryKey: ["dd-social-posts-all"],
    queryFn: async () => (await base44.entities.SocialPost.filter({}, { sort: "-scheduled_at", limit: 200 })).items,
  });

  const allPostsList = allPosts || [];
  const stats = {
    total: allPostsList.length,
    scheduled: allPostsList.filter((p) => p.status === "scheduled").length,
    posted: allPostsList.filter((p) => p.status === "posted").length,
    aiGenerated: allPostsList.filter((p) => p.ai_generated).length,
  };

  const postsBySite = (siteId) => allPostsList.filter((p) => p.launched_site_id === siteId);

  const handleGenerate = async (siteId) => {
    setActionLoading((s) => ({ ...s, [`gen-${siteId}`]: true }));
    try {
      await base44.functions.invoke("generateSocialCampaign", { launched_site_id: siteId, generate_images: true });
      await queryClient.invalidateQueries({ queryKey: ["dd-social-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["dd-social-posts-all"] });
    } catch (e) {
      alert("Generation failed: " + e.message);
    } finally {
      setActionLoading((s) => ({ ...s, [`gen-${siteId}`]: false }));
    }
  };

  const handleProvision = async (siteId) => {
    setActionLoading((s) => ({ ...s, [`prov-${siteId}`]: true }));
    try {
      await base44.functions.invoke("provisionSiteSystem", { launched_site_id: siteId });
      await queryClient.invalidateQueries({ queryKey: ["dd-social-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["dd-social-posts-all"] });
    } catch (e) {
      alert("Provisioning failed: " + e.message);
    } finally {
      setActionLoading((s) => ({ ...s, [`prov-${siteId}`]: false }));
    }
  };

  const handleGenerateAll = async () => {
    setActionLoading((s) => ({ ...s, "gen-all": true }));
    try {
      await base44.functions.invoke("generateSocialCampaign", { generate_images: true });
      await queryClient.invalidateQueries({ queryKey: ["dd-social-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["dd-social-posts-all"] });
    } catch (e) {
      alert("Generation failed: " + e.message);
    } finally {
      setActionLoading((s) => ({ ...s, "gen-all": false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Social Media <span className="text-[#00d4ff]">Engine</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Fully automated AI social media system — 30-day campaigns, image generation, multi-platform scheduling.
          </p>
        </div>
        <button
          onClick={handleGenerateAll}
          disabled={actionLoading["gen-all"]}
          className="flex items-center gap-2 rounded-lg border border-[#00f2ff]/30 bg-[#00f2ff]/5 px-4 py-2 text-xs font-medium text-[#00f2ff] transition hover:bg-[#00f2ff]/10 disabled:opacity-50"
        >
          {actionLoading["gen-all"] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Generate All Campaigns
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Share2} label="Total Posts" value={stats.total} />
        <StatCard icon={Clock} label="Scheduled" value={stats.scheduled} accent="text-[#00d4ff]" />
        <StatCard icon={CheckCircle} label="Posted" value={stats.posted} accent="text-emerald-400" />
        <StatCard icon={Bot} label="AI Generated" value={stats.aiGenerated} accent="text-[#00d4ff]" />
      </div>

      {/* Sites */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <Rocket className="h-4 w-4 text-[#00f2ff]" /> Site Campaigns
        </h2>
        {sitesLoading ? (
          <div className="mt-4 flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-white/40" /></div>
        ) : (sites || []).length === 0 ? (
          <p className="mt-4 text-sm text-white/40">No launched sites yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {(sites || []).map((site) => {
              const sitePosts = postsBySite(site.id);
              const scheduledCount = sitePosts.filter((p) => p.status === "scheduled").length;
              const postedCount = sitePosts.filter((p) => p.status === "posted").length;
              return (
                <div key={site.id} className={`flex flex-col gap-3 rounded-lg border p-4 transition sm:flex-row sm:items-center sm:justify-between ${selectedSite === site.id ? "border-[#00f2ff]/40 bg-[#00f2ff]/5" : "border-white/10 bg-white/[0.02]"}`}>
                  <button onClick={() => setSelectedSite(selectedSite === site.id ? null : site.id)} className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{site.name}</span>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${site.status === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>{site.status}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-white/40">
                      <span>{sitePosts.length} total</span>
                      <span className="text-[#00d4ff]">{scheduledCount} scheduled</span>
                      <span className="text-emerald-400">{postedCount} posted</span>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerate(site.id)}
                      disabled={actionLoading[`gen-${site.id}`]}
                      className="flex items-center gap-1.5 rounded-lg border border-[#00f2ff]/30 bg-[#00f2ff]/5 px-3 py-1.5 text-xs text-[#00f2ff] transition hover:bg-[#00f2ff]/10 disabled:opacity-50"
                    >
                      {actionLoading[`gen-${site.id}`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      30-Day Campaign
                    </button>
                    <button
                      onClick={() => handleProvision(site.id)}
                      disabled={actionLoading[`prov-${site.id}`]}
                      className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      {actionLoading[`prov-${site.id}`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
                      Provision System
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="dd-panel rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
            <Calendar className="h-4 w-4 text-[#00f2ff]" /> {selectedSite ? "Site Posts" : "All Posts"}
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-white/40" />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 outline-none"
            >
              <option value="all">All Platforms</option>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {postsLoading ? (
          <div className="mt-4 flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-white/40" /></div>
        ) : (posts || []).length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
            No posts yet. Generate a 30-day campaign for any site above.
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {(posts || []).slice(0, 50).map((post) => (
              <div key={post.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${PLATFORM_COLORS[post.platform] || "border-white/20 text-white/60"}`}>{post.platform}</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${post.status === "posted" ? "bg-emerald-500/20 text-emerald-400" : post.status === "scheduled" ? "bg-[#00f2ff]/20 text-[#00d4ff]" : "bg-white/10 text-white/40"}`}>{post.status}</span>
                    {post.ai_generated && <span className="text-[10px] uppercase tracking-widest text-crimson">AI</span>}
                    {post.image_url && <ImageIcon className="h-3 w-3 text-white/40" />}
                  </div>
                  {post.scheduled_at && (
                    <span className="text-xs text-white/40 whitespace-nowrap">
                      {new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-white/80 line-clamp-2">{post.content}</p>
                {post.hashtags && <p className="mt-1 text-xs text-crimson/80">{post.hashtags}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
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