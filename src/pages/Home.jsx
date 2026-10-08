import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

const HERO_URL =
  "https://media.base44.com/images/public/6ac7bc6cf0b681d8bc7f7aeb/cf93062aa_FACEBOOKIMAGE2.png";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#00050A] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,170,255,0.10),_transparent_60%)]" />

      {/* Call Now — top right */}
      <a
        href="tel:+15555550100"
        className="absolute right-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_30px_rgba(0,212,255,0.45)] transition hover:bg-[#00D4FF]/20 hover:shadow-[0_0_50px_rgba(0,212,255,0.7)] sm:px-5 sm:py-2.5 sm:text-sm"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00D4FF] text-black">
          <Phone className="h-3.5 w-3.5" />
        </span>
        Call Now
      </a>

      {/* Full-bleed responsive hero — fills desktop + mobile */}
      <img
        src={HERO_URL}
        alt="Strategic Minds AI — Intelligence In Motion"
        className="absolute inset-0 h-full w-full object-contain"
      />
      {/* Bottom gradient for CTA legibility on any viewport */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-[#00050A] via-[#00050A]/60 to-transparent" />

      {/* CTA — bottom center, responsive padding */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-8 sm:pb-12">
        <Link
          to="/admin"
          className="group inline-flex items-center gap-2.5 rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm shadow-[0_0_30px_rgba(0,212,255,0.45)] transition hover:bg-[#00D4FF]/20 hover:shadow-[0_0_55px_rgba(0,212,255,0.7)] sm:px-8 sm:py-3.5 sm:text-sm"
        >
          Build Smarter. <span className="text-[#00D4FF]">Grow Faster.</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00D4FF] text-black transition group-hover:translate-x-1">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}