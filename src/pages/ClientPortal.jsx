import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, LayoutDashboard, Users, Share2, CreditCard, FileText, Loader2, ExternalLink, Sparkles } from "lucide-react";
import PortalOverview from "@/components/portal/PortalOverview";
import PortalCRM from "@/components/portal/PortalCRM";
import PortalSocial from "@/components/portal/PortalSocial";
import PortalBusinessCard from "@/components/portal/PortalBusinessCard";
import PortalBrochure from "@/components/portal/PortalBrochure";
import PortalAgents from "@/components/portal/PortalAgents";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "crm", label: "CRM", icon: Users },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "agents", label: "Super Agents", icon: Sparkles },
  { id: "card", label: "Business Card", icon: CreditCard },
  { id: "brochure", label: "Brochure", icon: FileText },
];

export default function ClientPortal() {
  const { siteSlug } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.LaunchedSite.filter({ slug: siteSlug }, { limit: 1 });
      const sites = res.items || [];
      if (sites.length === 0) { setError("Site not found"); return; }
      setSite(sites[0]);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [siteSlug]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center flex-col gap-4"><p className="text-destructive">{error}</p><Link to="/admin/launched-sites" className="text-sm text-crimson underline">Back to Launched Sites</Link></div>;
  if (!site) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-30">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-heading text-xl">{site.name}</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-crimson border-l border-border pl-6">Client Portal</span>
          </div>
          <div className="flex items-center gap-5">
            <a href={site.proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-crimson hover:brightness-110"><ExternalLink className="w-3.5 h-3.5" /> Live Site</a>
            <Link to="/admin/launched-sites" className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Admin</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-8">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 shrink-0 px-4 py-2.5 text-xs tracking-[0.15em] uppercase border transition-colors ${tab === t.id ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <PortalOverview site={site} />}
        {tab === "crm" && <PortalCRM site={site} />}
        {tab === "social" && <PortalSocial site={site} />}
        {tab === "agents" && <PortalAgents site={site} />}
        {tab === "card" && <PortalBusinessCard site={site} />}
        {tab === "brochure" && <PortalBrochure site={site} />}
      </div>
    </div>
  );
}