import React, { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function ImageLightbox({ images, index, onClose }) {
  const total = images.length;
  const go = useCallback(
    (dir) => {
      window.dispatchEvent(new CustomEvent("img-lightbox-nav", { detail: dir }));
    },
    []
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, go]);

  if (!total) return null;
  const img = images[index];

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-6 h-14 text-white shrink-0">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">Full resolution · {index + 1} / {total}</p>
        <button onClick={onClose} className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-white/20 text-white hover:bg-white/10">
          <X className="w-3.5 h-3.5" /> Close
        </button>
      </div>
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
        <Image src={img} alt="Full resolution asset" fittingType="fit" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" style={{ imageRendering: "auto" }} />
        {total > 1 && (
          <>
            <button onClick={() => go(-1)} disabled={index === 0} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => go(1)} disabled={index === total - 1} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}