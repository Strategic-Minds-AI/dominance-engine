import React from "react";
import { Link } from "react-router-dom";
import { Bot, Palette, ArrowRight, Sparkles, Zap, Share2, Rocket, ShieldCheck } from "lucide-react";

export default function CreationHub() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Creation <span className="text-[#00d4ff]">Hub</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Two roads to launch your Digital Dominance system — AI-guided or self-built.
        </p>
      </div>

      {/* Two Roads */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Road 1: AI-Assisted */}
        <Link to="/admin/eden-avatar" className="group dd-panel rounded-xl p-6 hover:border-[#00f2ff]/40 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00f2ff]/10 ring-1 ring-[#00f2ff]/30">
              <Bot className="h-6 w-6 text-[#00f2ff]" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold">AI-Assisted Build</h2>
              <p className="text-xs text-white/40">Eden guides you → GPT creates samples → you approve → system launches</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              "Voice-enabled onboarding with Eden Skye",
              "GPT generates website samples from your brief",
              "Approve the design, system does the rest",
              "Auto-provisions admin portal + social media + agent team",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00f2ff]/15 text-[10px] text-[#00f2ff]">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#00f2ff]">
            Start with Eden <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Road 2: Self-Build */}
        <Link to="/admin/visual-editor" className="group dd-panel rounded-xl p-6 hover:border-[#00f2ff]/40 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00f2ff]/10 ring-1 ring-[#00f2ff]/30">
              <Palette className="h-6 w-6 text-[#00f2ff]" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold">Build It Yourself</h2>
              <p className="text-xs text-white/40">Chat-driven visual editor → AI builds live → save to Studio → launch</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              "Describe what you want in plain English",
              "AI builds and edits the website live in the preview",
              "Toggle desktop, tablet, mobile views",
              "Save to Studio, approve, then launch programmatically",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00f2ff]/15 text-[10px] text-[#00f2ff]">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#00f2ff]">
            Open Visual Editor <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      {/* Quick Access */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <Sparkles className="h-4 w-4 text-[#00f2ff]" /> System Modules
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/admin/studio", icon: Palette, label: "Studio", desc: "Pack review & versions" },
            { to: "/admin/programmatic", icon: Rocket, label: "Programmatic", desc: "Launch sites at scale" },
            { to: "/admin/social-media", icon: Share2, label: "Social Media", desc: "30-day AI campaigns" },
            { to: "/admin/super-agents", icon: ShieldCheck, label: "Super Agents", desc: "8-agent fleet" },
          ].map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-[#00f2ff]/40 hover:bg-[#00f2ff]/5">
              <Icon className="h-5 w-5 text-[#00f2ff]" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{label}</div>
                <div className="truncate text-xs text-white/40">{desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-[#00f2ff]" />
            </Link>
          ))}
        </div>
      </div>

      {/* GPT Sync Info */}
      <div className="dd-panel rounded-xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
          <Zap className="h-4 w-4 text-[#00f2ff]" /> GPT Sync Endpoint
        </h2>
        <p className="mt-2 text-xs text-white/50">
          GPT (or any external tool) can POST approved mockups directly into your system. They land as pending review — nothing goes live until you approve.
        </p>
        <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-xs text-white/60">
          <div className="text-white/40"># POST mockups from GPT</div>
          <div className="mt-1">curl -X POST https://scale-dominance.base44.app/functions/ingestPack \</div>
          <div className="pl-4">-H "Content-Type: application/json" \</div>
          <div className="pl-4">-d '{"{"} "sync_token": "&lt;PACK_SYNC_TOKEN&gt;", "name": "Hero Mockup v2", "kind": "web_pack", "preview_html": "...", "source": "gpt_sync" {"}"}'</div>
        </div>
      </div>
    </div>
  );
}