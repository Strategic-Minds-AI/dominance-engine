import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Plus, Rocket, Loader2, X, LayoutDashboard, Check, Shield,
  Globe, Zap, Bot, FileCode, Users, Layers, Activity,
} from "lucide-react";
import SystemHealth from "@/components/apex/SystemHealth";
import MissionPipeline from "@/components/apex/MissionPipeline";
import CanaryChecklist from "@/components/apex/CanaryChecklist";
import GuardianPanel from "@/components/apex/GuardianPanel";

const SUBSYSTEMS = [
  { icon: Zap, label: "Sync Engine", path: "/admin/sync", desc: "24/7 universal sync" },
  { icon: Globe, label: "Launched Sites", path: "/admin/launched-sites", desc: "Portfolio management" },
  { icon: Rocket, label: "Programmatic", path: "/admin/programmatic", desc: "Site launch wizard" },
  { icon: Layers, label: "Studio", path: "/admin/studio", desc: "Approval library" },
  { icon: FileCode, label: "Dominance", path: "/admin/dominance", desc: "Page factory" },
  { icon: Activity, label: "Experiments", path: "/admin/experiments", desc: "A/B testing" },
  { icon: Users, label: "Leads", path: "/admin", desc: "CRM pipeline" },
  { icon: Bot, label: "Eden Avatar", path: "/admin/eden-avatar", desc: "Concierge AI" },
];

export default function ApexControl() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [health, setHealth] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, sites, jobs, leads, agents] = await Promise.allSettled([
        base44.entities.Mission.filter({ status: "active" }, { sort: "-created_date", limit: 50 }),
        base44.entities.LaunchedSite.count({ status: "live" }),
        base44.entities.SyncJob.count({ status: "pending" }),
        base44.entities.Lead.count({}),
        base44.entities.AgentTask.count({ status: "in_progress" }),
      ]);
      setMissions(m.status === "fulfilled" ? m.value.items || [] : []);
      setHealth({
        sites: sites.status === "fulfilled" ? sites.value : 0,
        jobs: jobs.status === "fulfilled" ? jobs.value : 0,
        leads: leads.status === "fulfilled" ? leads.value : 0,
        agents: agents.status === "fulfilled" ? agents.value : 0,
      });
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-30">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-heading text-xl">APEX</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-crimson border-l border-border pl-6">
              Digital Dominance V4.1 · Mission Control
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-crimson hover:brightness-110">
              <Plus className="w-3.5 h-3.5" /> New Mission
            </button>
            <Link to="/" className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-8 space-y-8">
        <SystemHealth health={health} missions={missions.length} />

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-crimson" />
              <h3 className="font-heading text-sm font-bold uppercase">Active Missions</h3>
            </div>
            {loading ? (
              <div className="border border-border p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <MissionPipeline missions={missions} />
            )}
          </div>
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-4 h-4 text-crimson" />
              <h3 className="font-heading text-sm font-bold uppercase">Canary Proof</h3>
            </div>
            <CanaryChecklist />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-crimson" />
            <h3 className="font-heading text-sm font-bold uppercase">Autonomous Guardian</h3>
          </div>
          <GuardianPanel />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-4 h-4 text-crimson" />
            <h3 className="font-heading text-sm font-bold uppercase">Subsystem Access</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SUBSYSTEMS.map((s) => (
              <Link key={s.path} to={s.path} className="border border-border p-4 hover:border-foreground transition-colors group">
                <s.icon className="w-4 h-4 text-muted-foreground mb-2 group-hover:text-crimson" />
                <p className="text-xs font-medium">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {showForm && <MissionForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function MissionForm({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCanary, setIsCanary] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const missionId = `DD-V4-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      await base44.entities.Mission.create({
        title: title.trim(),
        mission_id: missionId,
        description: description.trim(),
        is_canary: isCanary,
        priority,
        stage: "discover",
        status: "active",
        checklist: JSON.stringify({}),
        canary_results: JSON.stringify({}),
      });
      onCreated();
    } catch (e) {
      alert("Could not create mission: " + e.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-background max-w-lg w-full border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-heading text-lg font-bold">New Mission</h3>
          <button onClick={onClose} className="p-1.5 border border-border hover:border-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Mission title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Acme Law — Digital Dominance" className="w-full mt-1 border border-border px-3 py-2 text-sm outline-none focus:border-primary" autoFocus />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Objectives</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe what this mission should accomplish..." className="w-full mt-1 border border-border px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isCanary} onChange={e => setIsCanary(e.target.checked)} className="w-4 h-4" />
              <span>Canary test mission</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Priority</span>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="border border-border px-2 py-1.5 text-sm outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>
          <button onClick={create} disabled={saving || !title.trim()} className="w-full inline-flex items-center justify-center gap-2 bg-crimson text-paper px-5 py-3 text-xs font-semibold tracking-[0.25em] uppercase hover:brightness-110 disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {saving ? "Creating..." : "Launch Mission"}
          </button>
        </div>
      </div>
    </div>
  );
}