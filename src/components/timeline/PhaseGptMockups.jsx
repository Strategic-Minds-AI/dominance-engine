import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Check, ArrowRight, X, Eye, RefreshCw } from "lucide-react";

export default function PhaseGptMockups({ onboarding, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [mockups, setMockups] = useState([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const triggered = useRef(false);

  const generate = async () => {
    if (!onboarding?.client_id) return;
    setLoading(true);
    setError("");
    setMockups([]);
    try {
      const res = await base44.functions.invoke("generateGptMockups", {
        client_id: onboarding.client_id,
        industry: onboarding.industry,
        brand_name: onboarding.existing_business_name || onboarding.full_name,
        business_stage: onboarding.business_stage,
        city: onboarding.city,
        state: onboarding.state,
      });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      setMockups(data.mockups || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger mockup generation when business input arrives from onboarding
  useEffect(() => {
    if (triggered.current) return;
    if (onboarding?.client_id && mockups.length === 0 && !loading) {
      triggered.current = true;
      generate();
    }
  }, [onboarding?.client_id]);

  const confirm = () => {
    if (!selected) return;
    onComplete({ selected_mockup: selected });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="flex items-center justify-center gap-2 font-heading text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-[#00f2ff]" /> GPT Sync — 10 Mockups
        </h2>
        <p className="mt-1 text-sm text-white/50">
          AI generates 10 unique design directions for {onboarding.existing_business_name || onboarding.full_name}.
        </p>
      </div>

      {/* Sync status */}
      <div className="dd-panel rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white/80">GPT Sync Engine</div>
            <div className="mt-0.5 text-xs text-white/40">
              Routes through your paid Vercel AI Gateway — not Base44 credits.
            </div>
          </div>
          {mockups.length === 0 && !loading && (
            <span className="text-xs text-white/40">Auto-generating from your business input...</span>
          )}
          {mockups.length > 0 && !loading && (
            <button
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </button>
          )}
          {mockups.length > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
              {mockups.length} mockups ready
            </span>
          )}
        </div>

        {loading && (
          <div className="mt-6 flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00f2ff]" />
            <div className="text-sm text-white/50">Generating 10 unique design directions...</div>
            <div className="text-xs text-white/30">This takes 30-60 seconds on the Vercel AI Gateway</div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Mockup grid */}
      {mockups.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockups.map((m, i) => (
            <motion.div
              key={m.id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                selected?.id === m.id
                  ? "border-[#00f2ff] ring-2 ring-[#00f2ff]/30"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Iframe preview */}
              <div className="relative aspect-[4/3] overflow-hidden bg-white">
                <iframe
                  srcDoc={m.html}
                  title={m.name}
                  className="pointer-events-none h-[400px] w-[267px] origin-top-left scale-[0.67]"
                  sandbox="allow-same-origin"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold">{m.name}</div>
                    <div className="text-[11px] text-white/40">{m.description}</div>
                  </div>
                  {m.palette?.length > 0 && (
                    <div className="flex gap-1">
                      {m.palette.slice(0, 3).map((c, j) => (
                        <div key={j} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c }} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setPreview(m)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-white/70 hover:bg-white/10"
                  >
                    <Eye className="mr-1 inline h-3 w-3" /> Preview
                  </button>
                  <button
                    onClick={() => setSelected(m)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                      selected?.id === m.id
                        ? "bg-[#00f2ff] text-black"
                        : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {selected?.id === m.id ? (
                      <><Check className="mr-1 inline h-3 w-3" /> Selected</>
                    ) : "Select"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={confirm}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00f2ff] px-8 py-3 text-sm font-bold text-black hover:bg-[#00d4ff]"
          >
            Build with "{selected.name}" <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Full preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-black">{preview.name}</div>
                  <div className="text-xs text-black/50">{preview.description}</div>
                </div>
                <button onClick={() => setPreview(null)} className="rounded-lg p-1.5 hover:bg-black/10">
                  <X className="h-5 w-5 text-black" />
                </button>
              </div>
              <div className="h-[70vh] overflow-auto bg-white">
                <iframe srcDoc={preview.html} title={preview.name} className="h-full w-full" sandbox="allow-same-origin" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}