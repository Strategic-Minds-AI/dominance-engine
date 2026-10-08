import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2 } from "lucide-react";
import IngestForm from "@/components/studio/IngestForm";
import PackLibrary from "@/components/studio/PackLibrary";
import VersionManager from "@/components/studio/VersionManager";

const TABS = ["Ingest", "Library", "Versions"];

export default function Studio() {
  const [tab, setTab] = useState("Ingest");
  const [packs, setPacks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [preselectPackId, setPreselectPackId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, v] = await Promise.all([
        base44.entities.TemplatePack.filter({}, { sort: "-created_date", limit: 100 }),
        base44.entities.SiteVersion.filter({}, { sort: "-created_date", limit: 100 }),
      ]);
      setPacks(p.items || []);
      setVersions(v.items || []);
    } catch { setPacks([]); setVersions([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (pack) => {
    setBusyId(pack.id);
    try {
      await base44.entities.TemplatePack.update(pack.id, { status: "approved" });
      await base44.entities.Approval.updateMany({ template_pack_id: pack.id }, { $set: { status: "approved", resolved_at: new Date().toISOString() } });
      load();
    } finally { setBusyId(""); }
  };
  const reject = async (pack) => {
    setBusyId(pack.id);
    try {
      await base44.entities.TemplatePack.update(pack.id, { status: "rejected" });
      await base44.entities.Approval.updateMany({ template_pack_id: pack.id }, { $set: { status: "rejected", resolved_at: new Date().toISOString() } });
      load();
    } finally { setBusyId(""); }
  };
  const createVersion = (pack) => { setPreselectPackId(pack.id); setTab("Versions"); };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-30">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-heading text-xl">STRATEGIC MINDS AI</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground border-l border-border pl-6">Studio · Creation, Approval & Version Control</span>
          </div>
          <Link to="/admin" className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Admin
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10">
        <div className="flex gap-2 mb-8 border-b border-border">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-xs tracking-[0.2em] uppercase border-b-2 -mb-px transition-colors ${tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t}
              {t === "Library" && packs.length > 0 && <span className="ml-2 text-[10px] opacity-60">{packs.length}</span>}
              {t === "Versions" && versions.length > 0 && <span className="ml-2 text-[10px] opacity-60">{versions.length}</span>}
            </button>
          ))}
        </div>

        {loading ? <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div> : (
          <>
            {tab === "Ingest" && <IngestForm onIngested={load} />}
            {tab === "Library" && <PackLibrary packs={packs} loading={loading} onApprove={approve} onReject={reject} onCreateVersion={createVersion} busyId={busyId} />}
            {tab === "Versions" && <VersionManager versions={versions} packs={packs} loading={loading} preselectPackId={preselectPackId} onChanged={load} />}
          </>
        )}
      </div>
    </div>
  );
}