import React from "react";
import { Link } from "react-router-dom";
import { Cpu, Settings, BarChart3, Target, ArrowRight, Sparkles } from "lucide-react";
import { Image } from "@/components/ui/image";

const LOGO_URL = "https://media.base44.com/images/public/user_69b98b0a75d69ef410a89852/a5ee44d08_FACEBOOKIMAGE.png";

const SERVICES = [
  { icon: Cpu, label: "AI STRATEGY" },
  { icon: Settings, label: "CUSTOM SYSTEMS" },
  { icon: BarChart3, label: "AUTOMATION" },
  { icon: Target, label: "GROWTH" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Galactic background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,170,255,0.12),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,242,255,0.08),_transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,242,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      {/* Stylized Earth globe + network (bottom half) */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[140vw] h-[70vh] max-w-[1100px]">
        <div
          className="absolute inset-0 rounded-[50%] opacity-60"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(0,170,255,0.18), rgba(5,7,10,0.95) 70%)",
            boxShadow: "0 0 200px 40px rgba(0,170,255,0.15) inset",
          }}
        />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" fill="none">
          <g stroke="rgba(0,242,255,0.35)" strokeWidth="0.6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ellipse key={`m${i}`} cx="400" cy="500" rx={80 + i * 42} ry={40 + i * 22} />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`l${i}`} x1={80 + i * 64} y1="500" x2={80 + i * 64} y2="120" opacity={0.25} />
            ))}
          </g>
          <g fill="rgba(0,242,255,0.9)">
            {[[180, 360], [320, 300], [460, 340], [560, 280], [250, 420], [500, 420], [620, 380]].map(([x, y], i) => (
              <circle key={`n${i}`} cx={x} cy={y} r="2.5" />
            ))}
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        {/* Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#00f2ff] blur-2xl opacity-40" />
          <div className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-full ring-2 ring-[#00f2ff] ring-offset-0 shadow-[0_0_60px_rgba(0,242,255,0.5)] overflow-hidden">
            <Image src={LOGO_URL} alt="Strategic Minds AI logo" fittingType="fill" className="h-full w-full" />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-[0.2em] uppercase">
          <span className="text-white">STRATEGIC </span>
          <span className="text-[#00d4ff] drop-shadow-[0_0_18px_rgba(0,212,255,0.7)]">MINDS AI</span>
        </h1>

        {/* Tagline */}
        <p className="mt-3 text-sm sm:text-base tracking-[0.35em] uppercase text-[#00d4ff]/80">
          Intelligence In Motion
        </p>

        {/* Service icons row */}
        <div className="mt-12 flex items-center justify-center gap-6 sm:gap-12">
          {SERVICES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full ring-1 ring-[#00f2ff]/60 bg-[#00f2ff]/5 shadow-[0_0_30px_rgba(0,242,255,0.25)]">
                <Icon className="h-7 w-7 sm:h-9 sm:w-9 text-[#00f2ff]" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] sm:text-xs tracking-widest uppercase text-white/70">{label}</span>
            </div>
          ))}
        </div>

        {/* Hero heading */}
        <h2 className="mt-16 max-w-3xl text-2xl sm:text-4xl font-bold leading-tight">
          We Build Intelligent <span className="text-[#00d4ff]">Business Systems.</span>
        </h2>

        {/* CTA */}
        <Link
          to="/admin"
          className="group mt-10 inline-flex items-center gap-3 rounded-full border-2 border-[#00f2ff] bg-[#00f2ff]/5 px-8 py-3.5 text-sm sm:text-base font-bold uppercase tracking-widest text-white shadow-[0_0_40px_rgba(0,242,255,0.35)] transition hover:bg-[#00f2ff]/15 hover:shadow-[0_0_60px_rgba(0,242,255,0.5)]"
        >
          <Sparkles className="h-4 w-4 text-[#00f2ff]" />
          Build Smarter. Grow Faster.
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00f2ff] text-black transition group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <p className="mt-6 text-xs text-white/40 max-w-md">
          A governed, Google-compliant programmatic website factory. Discover demand, generate differentiated sites, preview before publishing, and provision to Supabase, Vercel, Railway &amp; GoDaddy.
        </p>
      </div>
    </div>
  );
}