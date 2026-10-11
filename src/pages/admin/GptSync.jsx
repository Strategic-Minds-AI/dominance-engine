import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Save, CheckCircle2, Loader2, Link2, ShieldCheck } from "lucide-react";
import { APPROVAL_MATRIX, SOURCE_REGISTRY_DEFAULT, SYSTEM_INSTRUCTIONS_DEFAULT, MASTER_PROMPT_DEFAULT, CONNECTOR_BINDINGS } from "@/data/gptSyncDefaults";

export default function GptSync() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    project_name: "DIGITAL DOMINANCE",
    system_instructions: SYSTEM_INSTRUCTIONS_DEFAULT,
    master_invocation_prompt: MASTER_PROMPT_DEFAULT,
    source_registry: SOURCE_REGISTRY_DEFAULT,
    connector_bindings: CONNECTOR_BINDINGS,
    approval_matrix: APPROVAL_MATRIX,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const { data: configs } = useQuery({
    queryKey: ["dd-gpt-config"],
    queryFn: async () => (await base44.entities.GptSyncConfig.filter({}, { sort: "-created_date", limit: 5 })).items,
  });
  const existing = (configs || [])[0];

  useEffect(() => {
    if (existing) {
      setForm({
        project_name: existing.project_name || form.project_name,
        system_instructions: existing.system_instructions || SYSTEM_INSTRUCTIONS_DEFAULT,
        master_invocation_prompt: existing.master_invocation_prompt || MASTER_PROMPT_DEFAULT,
        source_registry: existing.source_registry || SOURCE_REGISTRY_DEFAULT,
        connector_bindings: existing.connector_bindings || CONNECTOR_BINDINGS,
        approval_matrix: existing.approval_matrix || APPROVAL_MATRIX,
        notes: existing.notes || "",
      });
    }
  }, [existing?.id]);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      if (existing) {
        await base44.entities.GptSyncConfig.update(existing.id, { ...form, sync_state: "config_saved_unverified", last_sync_at: new Date().toISOString() });
      } else {
        await base44.entities.GptSyncConfig.create({ ...form, sync_state: "config_saved_unverified", last_sync_at: new Date().toISOString() });
      }
      setMsg("Configuration saved. Two-way GPT/runtime synchronization is not yet verified. Copy the instructions and complete connector validation.");
      qc.invalidateQueries({ queryKey: ["dd-gpt-config"] });
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  };

  const copy = (text) => { navigator.clipboard?.writeText(text); setMsg("Copied to clipboard."); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
          <RefreshCw className="h-6 w-6 text-[#00f2ff]" /> GPT <span className="text-[#00d4ff]">Sync</span>
        </h1>
        <p className="mt-1 text-sm text-white/50">Prepare the Digital Dominance GPT configuration. A saved configuration is not proof of authenticated, bidirectional runtime synchronization.</p>
      </div>

      {existing?.sync_state === "synced" && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Previously marked synced (not independently verified) {existing.last_sync_at ? new Date(existing.last_sync_at).toLocaleString() : "—"}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="dd-panel rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">System instructions</h2>
            <button onClick={() => copy(form.system_instructions)} className="text-xs text-[#00f2ff] hover:underline">Copy</button>
          </div>
          <textarea value={form.system_instructions} onChange={(e) => setForm({ ...form, system_instructions: e.target.value })} rows={10} className="dd-input mt-2 font-mono text-xs leading-relaxed" />
        </div>
        <div className="dd-panel rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Master invocation prompt</h2>
            <button onClick={() => copy(form.master_invocation_prompt)} className="text-xs text-[#00f2ff] hover:underline">Copy</button>
          </div>
          <textarea value={form.master_invocation_prompt} onChange={(e) => setForm({ ...form, master_invocation_prompt: e.target.value })} rows={10} className="dd-input mt-2 font-mono text-xs leading-relaxed" />
        </div>
      </div>

      <div className="dd-panel rounded-xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Source registry</h2>
        <textarea value={form.source_registry} onChange={(e) => setForm({ ...form, source_registry: e.target.value })} rows={6} className="dd-input mt-2 font-mono text-xs leading-relaxed" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="dd-panel rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70"><Link2 className="h-4 w-4 text-[#00f2ff]" /> Connector bindings</h2>
          <div className="mt-3 space-y-1.5">
            {form.connector_bindings.map((c, i) => (
              <div key={c.capability} className="flex items-center justify-between text-xs">
                <span className="text-white/70">{c.capability}</span>
                <span className={`rounded px-2 py-0.5 ${c.available ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/40"}`}>{c.tool}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dd-panel rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70"><ShieldCheck className="h-4 w-4 text-[#00f2ff]" /> Approval matrix</h2>
          <div className="mt-3 space-y-1">
            {form.approval_matrix.map((a) => (
              <div key={a.action} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{a.action}</span>
                <span className={`rounded px-2 py-0.5 font-bold ${a.default === "AUTO" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{a.default}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#00f2ff] px-4 py-2 text-sm font-bold text-black hover:bg-[#00d4ff] disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save sync config
        </button>
        {msg && <span className="text-xs text-emerald-400">{msg}</span>}
      </div>
    </div>
  );
}