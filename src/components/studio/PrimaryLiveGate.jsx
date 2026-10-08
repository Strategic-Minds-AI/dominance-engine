import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { getVariant, setVariant, pickWeighted, recordVisit } from "@/lib/ab";

export default function PrimaryLiveGate({ children }) {
  const [state, setState] = useState("checking");
  const [html, setHtml] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const abRes = await base44.entities.SiteVersion.filter(
          { status: "live", ab_weight: { $gt: 0 } },
          { limit: 100 }
        );
        const abVersions = abRes.items || [];
        if (!alive) return;

        if (abVersions.length) {
          const candidates = [
            ...abVersions.map((v) => ({ slug: v.slug, weight: v.ab_weight || 1, version: v })),
            { slug: "_control", weight: 1, version: null },
          ];
          let chosen = candidates.find((c) => c.slug === getVariant());
          if (!chosen) { chosen = pickWeighted(candidates); setVariant(chosen.slug); }

          if (chosen.slug === "_control") {
            recordVisit("_control", "", true);
            setState("site");
            return;
          }
          const pr = await base44.entities.TemplatePack.filter(
            { id: chosen.version.template_pack_id, status: "approved" },
            { limit: 1 }
          );
          const p = pr.items?.[0];
          if (!alive) return;
          if (!p || !p.preview_html) { setState("site"); return; }
          recordVisit(chosen.slug, chosen.version.id, false);
          setHtml(p.preview_html);
          setName(chosen.version.name);
          setState("live");
          return;
        }

        const vr = await base44.entities.SiteVersion.filter(
          { is_primary: true, status: "live" },
          { limit: 1 }
        );
        const v = vr.items?.[0];
        if (!alive) return;
        if (!v) { setState("site"); return; }
        const pr = await base44.entities.TemplatePack.filter(
          { id: v.template_pack_id, status: "approved" },
          { limit: 1 }
        );
        const p = pr.items?.[0];
        if (!alive) return;
        if (!p || !p.preview_html) { setState("site"); return; }
        setHtml(p.preview_html);
        setName(v.name);
        setState("live");
      } catch {
        if (alive) setState("site");
      }
    })();
    return () => { alive = false; };
  }, []);

  if (state === "checking") {
    return <div className="fixed inset-0 flex items-center justify-center bg-paper"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>;
  }
  if (state === "live") {
    return (
      <iframe title={name} srcDoc={html} sandbox="allow-same-origin allow-popups" style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0 }} />
    );
  }
  return children;
}