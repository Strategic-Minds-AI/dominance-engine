import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, Mail, Phone } from "lucide-react";

const STATUS_STYLE = {
  new: "bg-foreground text-background",
  contacted: "border border-foreground",
  qualified: "bg-primary text-primary-foreground",
  retained: "bg-primary text-primary-foreground",
  closed: "bg-muted text-muted-foreground",
};

export default function PortalCRM({ site }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke("getSiteLeads", { site_slug: site.slug, launched_site_id: site.id });
        setLeads(res.data?.leads || []);
      } catch { setLeads([]); }
      finally { setLoading(false); }
    })();
  }, [site.slug, site.id]);

  const filtered = leads.filter((l) => !search.trim() || (l.name || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-xl font-bold uppercase">Lead CRM</h3>
        <p className="text-xs text-muted-foreground mt-1">Leads captured from your website funnel appear here in real time.</p>
      </div>

      <div className="flex items-center gap-3 border border-border px-4 py-2.5 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads…" className="bg-transparent outline-none text-sm flex-1" />
      </div>

      {loading ? <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div> :
       filtered.length === 0 ? <p className="text-sm text-muted-foreground py-10">No leads yet. Leads from your website will appear here automatically.</p> :
       <div className="border-t border-border">
         {filtered.map((l) => (
           <div key={l.id} className="border-b border-border py-5 px-2 grid grid-cols-12 gap-4 items-center">
             <div className="col-span-12 md:col-span-4">
               <p className="font-medium text-sm">{l.name}</p>
               <p className="text-xs text-muted-foreground mt-0.5">{l.case_type || "—"}</p>
             </div>
             <div className="col-span-6 md:col-span-3 text-xs">
               {l.email && <a href={`mailto:${l.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Mail className="w-3 h-3" /> <span className="truncate">{l.email}</span></a>}
             </div>
             <div className="col-span-4 md:col-span-3 text-xs">
               {l.phone && <a href={`tel:${l.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Phone className="w-3 h-3" /> {l.phone}</a>}
             </div>
             <div className="col-span-2 md:col-span-2 flex justify-end">
               <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 ${STATUS_STYLE[l.status] || "border border-border"}`}>{l.status}</span>
             </div>
           </div>
         ))}
       </div>
      }
    </div>
  );
}