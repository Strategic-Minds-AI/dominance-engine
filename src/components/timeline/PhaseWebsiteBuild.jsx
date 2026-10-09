import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, Rocket, Share2, Check, ArrowRight, Globe, Calendar, Image as ImageIcon, Hash } from "lucide-react";

export default function PhaseWebsiteBuild({ onboarding, mockup, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [stepLabel, setStepLabel] = useState("");

  const build = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const steps = [
      "Generating industry keywords...",
      "Creating AI content matrix...",
      "Building website pages...",
      "Launching site...",
      "Generating 30-day social calendar...",
      "Creating social media images...",
    ];
    let si = 0;
    setStepLabel(steps[0]);
    const interval = setInterval(() => {
      si = Math.min(si + 1, steps.length - 1);
      setStepLabel(steps[si]);
    }, 8000);

    try {
      const res = await base44.functions.invoke("buildDominanceSystem", {
        client_id: onboarding.client_id,
        template_pack_id: mockup?.id || "",
        brand_name: onboarding.existing_business_name || onboarding.full_name,
        industry: onboarding.industry,
        city: onboarding.city,
        state: onboarding.state,
        contact_email: onboarding.email,
        contact_phone: "",
        business_stage: onboarding.business_stage,
      });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const PLATFORM_ICONS = {
    facebook: "📘", instagram: "📸", twitter: "🐦", linkedin: "💼", tiktok: "🎵", google_business: "📍",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="flex items-center justify-center gap-2 font-heading text-2xl font-bold">
          <Rocket className="h-6 w-6 text-[#00f2ff]" /> Website + Social Media Engine
        </h2>
        <p className="mt-1 text-sm text-white/50">
          GPT builds your full website while the system deploys it, then generates a 30-day automated social campaign.
        </p>
      </div>

      {!result && !loading && (
        <div className="flex justify-center">
          <button
            onClick={build}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00f2ff] px-8 py-3 text-sm font-bold text-black hover:bg-[#00d4ff]"
          >
            <Rocket className="h-4 w-4" /> Build Full System
          </button>
        </div>
      )}

      {loading && (
        <div className="dd-panel rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#00f2ff]" />
            <div className="text-sm font-semibold text-white/80">{stepLabel}</div>
            <div className="text-xs text-white/30">AI is working through your paid Vercel AI Gateway</div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Stats row */}
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { icon: Globe, label: "Pages Built", value: result.pages_created, color: "text-[#00f2ff]" },
              { icon: Share2, label: "Social Posts", value: result.social_posts_created, color: "text-emerald-400" },
              { icon: ImageIcon, label: "Images Gen", value: result.social_images_generated, color: "text-amber-400" },
              { icon: Hash, label: "Keywords", value: result.keywords?.length || 0, color: "text-purple-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="dd-panel rounded-xl p-4 text-center">
                <Icon className={`mx-auto h-6 w-6 ${color}`} />
                <div className="mt-2 text-2xl font-bold">{value}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
              </div>
            ))}
          </div>

          {/* Website preview link */}
          <div className="dd-panel rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00f2ff]/10">
                <Globe className="h-6 w-6 text-[#00f2ff]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">Your website is live</div>
                <a
                  href={result.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00f2ff] hover:underline"
                >
                  {result.site_url}
                </a>
              </div>
              <Check className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.keywords?.map((k, i) => (
                <span key={i} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* Social campaign */}
          <div className="dd-panel rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              <Calendar className="h-4 w-4 text-[#00f2ff]" /> 30-Day Social Campaign
            </div>
            <div className="mt-4 max-h-[400px] space-y-2 overflow-y-auto pr-2">
              {result.social_posts?.map((post, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-start gap-3">
                    <div className="text-lg">{PLATFORM_ICONS[post.platform] || "📱"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
                        Day {post.day} · {post.platform}
                      </div>
                      <div className="mt-0.5 text-xs text-white/70 line-clamp-2">{post.content}</div>
                      {post.hashtags && (
                        <div className="mt-1 text-[10px] text-[#00f2ff]/70">{post.hashtags}</div>
                      )}
                    </div>
                    {post.image_url && (
                      <img src={post.image_url} alt="" className="h-12 w-12 rounded object-cover" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => onComplete(result)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00f2ff] px-8 py-3 text-sm font-bold text-black hover:bg-[#00d4ff]"
            >
              Scale to 100 Pages <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}