import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";

const HERO_URL =
  "https://media.base44.com/images/public/6ac7bc6cf0b681d8bc7f7aeb/cf93062aa_FACEBOOKIMAGE2.png";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#00050A]">
      {/* Full-bleed hero image — the brand design IS the home page */}
      <div className="absolute inset-0">
        <Image
          src={HERO_URL}
          alt="Strategic Minds AI — Intelligence In Motion"
          fittingType="fill"
          className="h-full w-full"
        />
      </div>

      {/* Clickable CTA overlaid on the image's button area */}
      <div className="absolute inset-x-0 bottom-[6%] z-10 flex justify-center px-4">
        <Link
          to="/admin"
          className="group inline-flex items-center gap-3 rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/5 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-white shadow-[0_0_40px_rgba(0,212,255,0.45)] transition hover:bg-[#00D4FF]/15 hover:shadow-[0_0_70px_rgba(0,212,255,0.7)] sm:px-8 sm:py-3.5"
        >
          Build Smarter. <span className="text-[#00D4FF]">Grow Faster.</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00D4FF] text-black transition group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}