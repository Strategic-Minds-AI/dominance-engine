import React, { useEffect, useState } from "react";
import { X, Maximize2, ImageIcon } from "lucide-react";
import PackPreview from "./PackPreview";
import ImageLightbox from "./ImageLightbox";
import { Image } from "@/components/ui/image";
import { extractPackImages } from "@/lib/packImages";

export default function PreviewLightbox({ pack, onClose }) {
  const [imgLightbox, setImgLightbox] = useState({ open: false, index: 0 });
  const images = extractPackImages(pack);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !imgLightbox.open) onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, imgLightbox.open]);

  useEffect(() => {
    const onNav = (e) => {
      setImgLightbox((lb) => {
        const dir = e.detail;
        const next = lb.index + dir;
        if (next < 0 || next >= images.length) return lb;
        return { ...lb, index: next };
      });
    };
    window.addEventListener("img-lightbox-nav", onNav);
    return () => window.removeEventListener("img-lightbox-nav", onNav);
  }, [images.length]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-6 h-14 text-white shrink-0">
        <div className="min-w-0">
          <p className="font-heading text-lg leading-tight truncate">{pack.name}</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">{pack.kind.replace("_", " ")}</p>
        </div>
        <button onClick={onClose} className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-white/20 text-white hover:bg-white/10">
          <X className="w-3.5 h-3.5" /> Close
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <PackPreview pack={pack} displayW={960} />
        {images.length > 0 && (
          <div className="w-full max-w-[960px]">
            <div className="flex items-center gap-2 mb-3 text-[10px] tracking-[0.2em] uppercase text-white/60">
              <ImageIcon className="w-3.5 h-3.5" /> Uploaded photos · {images.length} · click to expand full resolution
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgLightbox({ open: true, index: i })}
                  className="relative aspect-square border border-white/15 overflow-hidden group/thumb hover:border-white/40 transition-colors"
                  title="View full resolution"
                >
                  <Image src={src} alt={`Asset ${i + 1}`} fittingType="fill" referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {imgLightbox.open && images.length > 0 && (
        <ImageLightbox images={images} index={imgLightbox.index} onClose={() => setImgLightbox({ open: false, index: 0 })} />
      )}
    </div>
  );
}