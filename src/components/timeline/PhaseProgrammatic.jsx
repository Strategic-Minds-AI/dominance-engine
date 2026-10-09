import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, Layers, Check, MapPin, Wrench, ArrowRight, RotateCcw } from "lucide-react";

export default function PhaseProgrammatic({ onboarding, buildResult, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 2, 95));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const generate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);
    try {
      const res = await base44.functions.invoke("generateProgrammaticSites", {
        client_id: onboarding.client_id,
        launched_site_id: buildResult?.launched_site_id || "",
        industry: onboarding.industry,
        brand_name: onboarding.existing_business_name || onboarding.full_name,
        base_city: onboarding.city,
        base_state: onboarding.state,
      });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      setResult(data);
      setProgress(100);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="flex items-center justify-center gap-2 font-heading text-2xl font-bold">
          <Layers className="h-6 w-6 text-[#00f2ff]" /> Programmatic 100x
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Generate 100 Google-compliant pages — 10 locations × 10 services with unique AI content.
        </p>
      </div>

      {!result && !loading && (
        <div className="flex justify-center">
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00f2ff] px-8 py-3 text-sm font-bold text-black hover:bg-[#00d4ff]"
          >
            <Layers className="h-4 w-4" /> Generate 100 Pages
          </button>
        </div>
      )}

      {loading && (
        <div className="dd-panel rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#00f2ff]" />
            <div className="text-sm font-semibold text-white/80">
              Generating {result?.total_pages || 100} unique pages...
            </div>
            <div className="w-full max-w-md">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00f2ff] to-[#00d4ff]"
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-center text-xs text-white/40">{progress}%</div>
            </div>
            <div className="text-xs text-white/30">AI content matrix + internal linking + schema markup</div>
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
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="dd-panel rounded-xl p-5 text-center">
              <Layers className="mx-auto h-7 w-7 text-[#00f2ff]" />
              <div className="mt-2 text-3xl font-bold">{result.total_pages}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">Pages Generated</div>
            </div>
            <div className="dd-panel rounded-xl p-5 text-center">
              <MapPin className="mx-auto h-7 w-7 text-emerald-400" />
              <div className="mt-2 text-3xl font-bold">{result.locations?.length || 0}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">Locations</div>
            </div>
            <div className="dd-panel rounded-xl p-5 text-center">
              <Wrench className="mx-auto h-7 w-7 text-amber-400" />
              <div className="mt-2 text-3xl font-bold">{result.services?.length || 0}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">Services</div>
            </div>
          </div>

          {/* Locations */}
          <div className="dd-panel rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              <MapPin className="h-4 w-4 text-emerald-400" /> Locations
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.locations?.map((loc, i) => (
                <span key={i} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="dd-panel rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              <Wrench className="h-4 w-4 text-amber-400" /> Services
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.services?.map((svc, i) => (
                <span key={i} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                  {svc}
                </span>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <Check className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="text-sm font-semibold text-emerald-300">Google-Compliant</div>
              <div className="text-xs text-emerald-300/60">{result.compliance_note}</div>
            </div>
          </div>

          {/* Done */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <Check className="h-8 w-8 text-emerald-400" strokeWidth={3} />
            </div>
            <div className="text-lg font-bold text-emerald-300">Dominance Pipeline Complete!</div>
            <div className="text-sm text-white/50">
              {result.total_pages} pages + {buildResult?.social_posts_created || 0} social posts + {buildResult?.pages_created || 0} website pages
            </div>
            <button
              onClick={() => onComplete()}
              className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-bold text-white/80 hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" /> Start New Campaign
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}