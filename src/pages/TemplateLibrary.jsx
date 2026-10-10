import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight,
  X,
  Eye,
  Sparkles,
  Globe,
  Palette,
  Layout,
  Monitor,
  Loader2,
  TrendingUp,
  DollarSign,
  Zap,
} from "lucide-react";
import { CORE_SERVICES } from "@/data/dominanceRegistry";

const KINDS = [
  { key: "all", label: "All", icon: Layout },
  { key: "web_pack", label: "Websites", icon: Globe },
  { key: "logo_pack", label: "Logos", icon: Palette },
  { key: "brand_pack", label: "Brand Kits", icon: Sparkles },
  { key: "mockup", label: "Mockups", icon: Monitor },
];

const KIND_COLORS = {
  web_pack: "#00D4FF",
  logo_pack: "#A78BFA",
  brand_pack: "#34D399",
  mockup: "#FBBF24",
};

export default function TemplateLibrary() {
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState(null);

  const { data: packs, isLoading } = useQuery({
    queryKey: ["template-packs-public"],
    queryFn: async () =>
      (await base44.entities.TemplatePack.filter(
        { status: "approved" },
        { sort: "-created_date", limit: 100 }
      )).items,
  });

  const filtered = useMemo(
    () =>
      (packs || []).filter((p) => filter === "all" || p.kind === filter),
    [packs, filter]
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#00050A] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,170,255,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,212,255,0.06),_transparent_60%)]" />

      {/* Back link */}
      <Link
        to="/"
        className="absolute left-4 top-[calc(1rem+env(safe-area-inset-top))] z-30 inline-flex items-center gap-2 rounded-full border-2 border-[#00D4FF]/40 bg-[#00D4FF]/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70 backdrop-blur-sm transition hover:border-[#00D4FF] hover:text-white sm:px-5 sm:py-2.5"
      >
        ← Home
      </Link>

      {/* Hero header */}
      <header className="relative z-10 px-4 pt-24 pb-10 text-center sm:pt-32 sm:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#00D4FF]">
            <Sparkles className="h-3 w-3" /> Template Library
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl">
            Beautiful Designs.
            <br />
            <span className="text-[#00D4FF]">Ready to Launch.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/50 sm:text-base">
            A curated collection of AI-generated website, logo, and brand kit
            templates. Preview any design, then customize it for your business.
          </p>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {KINDS.map((k) => {
            const active = filter === k.key;
            const Icon = k.icon;
            return (
              <button
                key={k.key}
                onClick={() => setFilter(k.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  active
                    ? "border-2 border-[#00D4FF] bg-[#00D4FF] text-black shadow-[0_0_25px_rgba(0,212,255,0.5)]"
                    : "border border-white/10 bg-white/[0.02] text-white/50 hover:border-white/25 hover:text-white/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {k.label}
              </button>
            );
          })}
        </motion.div>
      </header>

      {/* Grid */}
      <main className="relative z-10 px-4 pb-20 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#00D4FF]" />
            <span className="text-xs uppercase tracking-widest text-white/40">
              Loading templates…
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/10 bg-white/[0.02]">
              <Layout className="h-7 w-7 text-white/30" />
            </div>
            <p className="text-sm text-white/40">
              No templates in this category yet.
            </p>
            <Link
              to="/admin/website-factory"
              className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#00D4FF]/20"
            >
              Generate One <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pack, i) => (
              <TemplateCard
                key={pack.id}
                pack={pack}
                index={i}
                onPreview={() => setPreview(pack)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Top 20 Industries */}
      <section className="relative z-10 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#00D4FF]/30 bg-[#00D4FF]/5">
              <TrendingUp className="h-5 w-5 text-[#00D4FF]" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                Top 20 <span className="text-[#00D4FF]">Industries</span>
              </h2>
              <p className="text-xs text-white/40">
                Highest-intent verticals by search volume and lead value
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_SERVICES.map((s, i) => (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <Link
                  to={`/admin/website-factory?service=${encodeURIComponent(s.name)}`}
                  className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/[0.04]"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00D4FF]/10 text-xs font-bold text-[#00D4FF]">
                      {s.rank}
                    </span>
                    {s.emergency && (
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                    )}
                  </div>
                  <h3 className="mt-2 font-heading text-sm font-bold leading-tight">
                    {s.name}
                  </h3>
                  <div className="mt-auto pt-3 flex items-center justify-between text-[10px] text-white/40">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {(s.est_volume / 1000).toFixed(0)}K/mo
                    </span>
                    <span className="flex items-center gap-1 text-[#00D4FF]">
                      <DollarSign className="h-3 w-3" />
                      {s.lead_value}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="relative z-10 flex justify-center px-4 pb-16">
        <Link
          to="/admin"
          className="group inline-flex items-center gap-2.5 rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm shadow-[0_0_30px_rgba(0,212,255,0.45)] transition hover:bg-[#00D4FF]/20 hover:shadow-[0_0_55px_rgba(0,212,255,0.7)] sm:px-8 sm:py-3.5 sm:text-sm"
        >
          Start Building.{" "}
          <span className="text-[#00D4FF]">Scale Dominance.</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00D4FF] text-black transition group-hover:translate-x-1">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      {/* Full preview modal */}
      <AnimatePresence>
        {preview && (
          <PreviewModal pack={preview} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TemplateCard({ pack, index, onPreview }) {
  const color = KIND_COLORS[pack.kind] || "#00D4FF";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4) }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-white/20"
    >
      {/* Preview area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        {pack.preview_html ? (
          <iframe
            srcDoc={pack.preview_html}
            title={pack.name}
            className="pointer-events-none absolute top-0 left-0 h-[300%] w-[300%] origin-top-left scale-[0.3333]"
            sandbox="allow-same-origin"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/[0.03] to-transparent">
            <Globe className="h-10 w-10 text-white/20" />
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <button
            onClick={onPreview}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/20 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-[#00D4FF]/30"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
        {/* Kind badge */}
        <div
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {pack.kind.replace("_", " ")}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="truncate font-heading text-lg font-bold">{pack.name}</h3>
        {pack.description && (
          <p className="mt-1 line-clamp-2 text-xs text-white/50">
            {pack.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-white/30">
            v{pack.version || "1.0.0"}
          </span>
          <button
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00D4FF] transition hover:text-white"
          >
            View <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PreviewModal({ pack, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 bg-[#00050A] px-5 py-4">
          <div className="min-w-0">
            <div className="truncate font-heading text-lg font-bold text-white">
              {pack.name}
            </div>
            {pack.description && (
              <div className="mt-0.5 truncate text-xs text-white/50">
                {pack.description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/website-factory"
              className="hidden items-center gap-2 rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#00D4FF]/20 sm:inline-flex"
            >
              Use Template <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-auto bg-white">
          {pack.preview_html ? (
            <iframe
              srcDoc={pack.preview_html}
              title={pack.name}
              className="h-[70vh] w-full"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex h-[70vh] items-center justify-center text-black/30">
              <Globe className="h-12 w-12" />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}