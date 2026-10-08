import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileCode, TrendingUp, Users, Globe, ExternalLink } from "lucide-react";

const SITE_URL = "https://scale-dominance.base44.app";

export default function PortalOverview({ site }) {
  const [leadsCount, setLeadsCount] = useState(0);
  const [visits, setVisits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [leadsRes, visitAgg] = await Promise.allSettled([
          base44.functions.invoke("getSiteLeads", { site_slug: site.slug }),
          base44.entities.Visit.aggregate({ groupBy: "version_id" }),
        ]);
        if (leadsRes.status === "fulfilled") setLeadsCount(leadsRes.value?.data?.leads?.length || 0);
        if (visitAgg.status === "fulfilled") {
          const rows = visitAgg.value?.rows || [];
          setVisits(rows.find((r) => r.version_id === site.site_version_id)?.count || 0);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, [site.id]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border">
        <Stat icon={FileCode} label="Pages" value={site.pages_count || 0} />
        <Stat icon={Globe} label="Locations" value={site.locations_count || 0} />
        <Stat icon={TrendingUp} label="Visits" value={visits} />
        <Stat icon={Users} label="Leads" value={leadsCount} highlight />
      </div>

      <div>
        <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">Quick Links</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <LinkCard icon={ExternalLink} label="Live Website" href={site.proof_url} />
          <LinkCard icon={FileCode} label="Sitemap" href={site.sitemap_url} />
          <LinkCard icon={Globe} label="Site Version" href={`${SITE_URL}/v/${site.slug}`} />
        </div>
      </div>

      <div>
        <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">Keywords</h3>
        <p className="text-sm text-muted-foreground">{site.keywords || "No keywords set"}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-px bg-border border border-border">
        <InfoBox label="Status" value={site.status} />
        <InfoBox label="Domain" value={site.domain || "Not connected"} />
        <InfoBox label="Template" value={site.template_pack_id ? "Assigned" : "None"} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, highlight }) {
  return <div className="border-r border-b border-border p-5"><div className="flex items-center gap-2 mb-2"><Icon className="w-4 h-4 text-muted-foreground" /><p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</p></div><div className={`font-heading text-3xl font-light tabular-nums ${highlight ? "text-crimson" : ""}`}>{value.toLocaleString()}</div></div>;
}
function LinkCard({ icon: Icon, label, href }) {
  return <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 border border-border p-4 hover:border-primary transition-colors"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-sm flex-1 truncate">{label}</span><ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /></a>;
}
function InfoBox({ label, value }) {
  return <div className="bg-background p-4"><p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</p><p className="text-sm mt-1 capitalize">{value}</p></div>;
}