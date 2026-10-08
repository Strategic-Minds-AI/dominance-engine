import React, { useState, useEffect } from "react";
import PackPreview from "./PackPreview";
import PreviewLightbox from "./PreviewLightbox";
import ImageLightbox from "./ImageLightbox";
import { Image } from "@/components/ui/image";
import { extractPackImages } from "@/lib/packImages";
import { Check, X, GitBranch, Loader2, Maximize2, ImageIcon } from "lucide-react";

const KIND_LABEL = { web_pack: "Web Pack", mockup: "Mockup", logo_pack: "Logo Pack", brand_pack: "Brand Pack" };
const STATUS_STYLE = {
  pending_review: "border border-foreground text-foreground",
  approved: "bg-foreground text-background",
  rejected: "bg-muted text-muted-foreground line-through",
};

export default function PackLibrary({ packs, loading, onApprove, onReject, onCreateVersion, busyId }) {
  const [expanded, setExpanded] = useState(null);
  const [lightbox, setLightbox] = useState({ images: [], index: 0 });

  useEffect(() => {
    const onNav = (e) => {
      setLightbox((lb) => {
        const dir = e.detail;
        const next = lb.index + dir;
        if (next < 0 || next >= lb.images.length) return lb;
        return { ...lb, index: next };
      });
    };
    window.addEventListener("img-lightbox-nav", onNav);
    return () => window.removeEventListener("img-lightbox-nav", onNav);
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!packs.length) return <p className="py-20 text-center text-muted-foreground text-sm">No packs ingested yet. Use the Ingest tab to add one.</p>;
  return (
    <>
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {packs.map((p) => {
        const images = extractPackImages(p);
        return (
        <div key={p.id} className="border border-border bg-background overflow-hidden flex flex-col">
          <div className="p-4 flex justify-center bg-secondary/30 border-b border-border relative group">
            <PackPreview pack={p} displayW={300} />
            <button
              onClick={() => setExpanded(p)}
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-2.5 py-1.5 bg-background/90 border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:border-foreground"
              title="Expand preview"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Expand
            </button>
          </div>
          {images.length > 0 && (
            <div className="px-5 pt-4">
              <div className="flex items-center gap-1.5 mb-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                <ImageIcon className="w-3 h-3" /> {images.length} photo{images.length !== 1 ? "s" : ""}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {images.slice(0, 8).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox({ images, index: i })}
                    className="aspect-square border border-border overflow-hidden hover:border-foreground transition-colors group/thumb"
                    title="View full resolution"
                  >
                    <Image src={src} alt={`Asset ${i + 1}`} fittingType="fill" referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                  </button>
                ))}
                {images.length > 8 && (
                  <button onClick={() => setLightbox({ images, index: 8 })} className="aspect-square border border-border flex items-center justify-center text-[10px] tracking-[0.1em] uppercase text-muted-foreground hover:border-foreground hover:text-foreground">
                    +{images.length - 8}
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h4 className="font-heading text-lg leading-tight">{p.name}</h4>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">{KIND_LABEL[p.kind]} · {p.source === "gpt_sync" ? "GPT Sync" : "Manual"}</p>
              </div>
              <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 ${STATUS_STYLE[p.status]}`}>{p.status.replace("_", " ")}</span>
            </div>
            {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{p.description}</p>}
            <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-border">
              {p.status !== "approved" && (
                <button disabled={busyId === p.id} onClick={() => onApprove(p)} className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 bg-foreground text-background hover:opacity-90 disabled:opacity-40">
                  {busyId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                </button>
              )}
              {p.status !== "rejected" && (
                <button disabled={busyId === p.id} onClick={() => onReject(p)} className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-border hover:border-foreground disabled:opacity-40">
                  <X className="w-3 h-3" /> Reject
                </button>
              )}
              {p.status === "approved" && (
                <button onClick={() => onCreateVersion(p)} className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-crimson text-crimson hover:bg-crimson hover:text-paper">
                  <GitBranch className="w-3 h-3" /> Publish as version
                </button>
              )}
            </div>
          </div>
        </div>
        );
      })}
    </div>
    {expanded && <PreviewLightbox pack={expanded} onClose={() => setExpanded(null)} />}
    {lightbox.images.length > 0 && (
      <ImageLightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox({ images: [], index: 0 })} />
    )}
    </>
  );
}