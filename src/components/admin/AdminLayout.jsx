import React, { useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Radar, Factory, Eye, Server, RefreshCw, Package,
  Sparkles, Menu, X, ArrowLeft, ShieldCheck
} from "lucide-react";

const NAV = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Command Center" },
  { to: "/admin/opportunities", icon: Radar, label: "Opportunity Radar" },
  { to: "/admin/website-factory", icon: Factory, label: "Website Factory" },
  { to: "/admin/preview", icon: Eye, label: "Preview" },
  { to: "/admin/provisioning", icon: Server, label: "Provisioning" },
  { to: "/admin/gpt-sync", icon: RefreshCw, label: "GPT Sync" },
  { to: "/admin/packs", icon: Package, label: "Packs" },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#05070a]/90 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden rounded-lg border border-white/10 p-2 hover:bg-white/5"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-[#00f2ff] bg-[#00f2ff]/10">
              <Sparkles className="h-4 w-4 text-[#00f2ff]" />
            </div>
            <span className="font-heading text-sm font-bold tracking-widest uppercase">
              Digital <span className="text-[#00d4ff]">Dominance</span>
            </span>
          </Link>
        </div>
        <Link to="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } lg:block fixed lg:sticky top-[57px] lg:top-[57px] z-20 h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto border-r border-white/10 bg-[#05070a] px-3 py-4`}
        >
          <nav className="space-y-1">
            {NAV.map(({ to, end, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-[#00f2ff]/10 text-[#00f2ff] ring-1 ring-[#00f2ff]/30"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 rounded-lg border border-[#00f2ff]/20 bg-[#00f2ff]/5 p-3 text-xs text-white/60">
            <div className="flex items-center gap-2 font-semibold text-[#00d4ff]">
              <ShieldCheck className="h-4 w-4" /> Google-compliant
            </div>
            <p className="mt-1 leading-relaxed">
              Every generated page passes the workbook gates: people-first, unique value, no doorway fleets, no scaled thin content.
            </p>
          </div>
        </aside>

        {/* Main */}
        <main key={location.pathname} className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}