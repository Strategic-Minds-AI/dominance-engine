import React, { useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Sparkles, Factory, Rocket, Globe, Zap, Bot,
  ArrowLeft, ShieldCheck, MoreHorizontal, X,
} from "lucide-react";

const STEPS = [
  { n: 1, label: "Command Center", path: "/admin", end: true, icon: LayoutDashboard },
  { n: 2, label: "Timeline", path: "/admin/timeline", icon: Sparkles },
  { n: 3, label: "Website Factory", path: "/admin/website-factory", icon: Factory },
  { n: 4, label: "SEO Command", path: "/admin/seo-command", icon: Rocket },
  { n: 5, label: "Launched Sites", path: "/admin/launched-sites", icon: Globe },
  { n: 6, label: "Sync Engine", path: "/admin/sync", icon: Zap },
  { n: 7, label: "Eden Avatar", path: "/admin/eden-avatar", icon: Bot },
];

const TOOLS = [
  { to: "/admin/create", label: "Creation Hub" },
  { to: "/admin/universal-factory", label: "Universal Factory" },
  { to: "/admin/visual-editor", label: "Visual Editor" },
  { to: "/admin/industry-library", label: "Industry Library" },
  { to: "/admin/apex", label: "Apex Control" },
  { to: "/admin/experiments", label: "Experiments" },
  { to: "/admin/social-media", label: "Social Media" },
  { to: "/admin/gpt-sync", label: "GPT Sync" },
  { to: "/admin/packs", label: "Packs" },
  { to: "/admin/pipeline", label: "Pipeline" },
  { to: "/admin/super-agents", label: "Super Agents" },
  { to: "/admin/opportunities", label: "Opportunity Radar" },
  { to: "/admin/preview", label: "Preview" },
  { to: "/admin/provisioning", label: "Provisioning" },
  { to: "/admin/studio", label: "Studio" },
  { to: "/admin/dominance", label: "Dominance" },
  { to: "/admin/programmatic", label: "Programmatic" },
];

export default function AdminLayout() {
  const location = useLocation();
  const [showTools, setShowTools] = useState(false);

  const currentStep = STEPS.findIndex((s) =>
    s.end ? location.pathname === s.path : location.pathname.startsWith(s.path)
  );

  return (
    <div className="dark min-h-screen bg-[#05070a] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#05070a]/90 backdrop-blur px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-[#00f2ff] bg-[#00f2ff]/10">
            <Sparkles className="h-4 w-4 text-[#00f2ff]" />
          </div>
          <span className="font-heading text-sm font-bold tracking-widest uppercase">
            Digital <span className="text-[#00d4ff]">Dominance</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTools(!showTools)}
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" /> More Tools
          </button>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>
      </header>

      {/* Horizontal Step Timeline */}
      <nav className="sticky top-[57px] z-20 border-b border-white/10 bg-[#05070a]/95 backdrop-blur">
        <div className="flex items-center gap-1 overflow-x-auto px-4 py-3">
          {STEPS.map((step, i) => {
            const isActive = currentStep === i;
            const isPast = currentStep > i;
            return (
              <React.Fragment key={step.path}>
                <NavLink
                  to={step.path}
                  end={step.end}
                  className={`flex items-center gap-2 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#00f2ff] text-black"
                      : isPast
                      ? "text-emerald-400 hover:bg-white/5"
                      : "text-white/40 hover:bg-white/5 hover:text-white/70"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive ? "bg-black/20" : isPast ? "bg-emerald-400/15" : "bg-white/10"
                    }`}
                  >
                    {isPast ? "✓" : step.n}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </NavLink>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-4 sm:w-8 ${isPast ? "bg-emerald-400/30" : "bg-white/10"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      {/* Tools dropdown */}
      {showTools && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowTools(false)} />
          <div className="absolute left-0 right-0 z-30 border-b border-white/10 bg-[#0a0c12] px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Additional Tools</span>
              <button onClick={() => setShowTools(false)} className="text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {TOOLS.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  onClick={() => setShowTools(false)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-[#00f2ff]/30 hover:text-white"
                >
                  {t.label}
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main key={location.pathname} className="px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}