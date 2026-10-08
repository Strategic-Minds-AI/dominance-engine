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

      {/* Shrunk, contained hero */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="relative w-full max-w-2xl">
          <div className="overflow-hidden rounded-2xl ring-1 ring-[#00D4FF]/30 shadow-[0_0_60px_rgba(0,212,255,0.25)]">
            <img
              src={HERO_URL}
              alt="Strategic Minds AI — Intelligence In Motion"
              className="block w-full h-auto"
            />
          </div>

          {/* Clickable CTA overlaid on the image's button area */}
          <div className="absolute inset-x-0 bottom-[5%] flex justify-center px-4">
            <Link
              to="/admin"
              className="group inline-flex items-center gap-2.5 rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/5 px-5 py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white shadow-[0_0_30px_rgba(0,212,255,0.45)] transition hover:bg-[#00D4FF]/15 hover:shadow-[0_0_55px_rgba(0,212,255,0.7)] sm:px-7 sm:py-3"
            >
              Build Smarter. <span className="text-[#00D4FF]">Grow Faster.</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00D4FF] text-black transition group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}