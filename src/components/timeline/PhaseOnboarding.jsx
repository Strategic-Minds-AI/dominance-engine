import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { User, Mail, MapPin, Building2, Loader2, ArrowRight, RefreshCw, Plus, Edit3 } from "lucide-react";

export default function PhaseOnboarding({ onComplete }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    street_address: "",
    city: "",
    state: "",
    industry: "",
    existing_business_name: "",
    business_stage: "build_new",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const STAGES = [
    { value: "rebrand", label: "Rebrand", icon: RefreshCw, desc: "Refresh my existing brand identity" },
    { value: "build_new", label: "Build New", icon: Plus, desc: "Start from scratch with a new brand" },
    { value: "enhance_existing", label: "Enhance Existing", icon: Edit3, desc: "Improve my current website" },
  ];

  const valid = form.full_name && form.email && form.city && form.state && form.industry;

  const submit = async () => {
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      // Create Client
      const client = await base44.entities.Client.create({
        name: form.existing_business_name || form.full_name,
        contact_email: form.email,
        brand_name: form.existing_business_name || form.full_name,
      });

      // Create OnboardingProfile
      await base44.entities.OnboardingProfile.create({
        user_id: client.id,
        client_id: client.id,
        contact_name: form.full_name,
        contact_email: form.email,
        street_address: form.street_address,
        location_city: form.city,
        location_state: form.state,
        industry: form.industry,
        business_stage: form.business_stage,
        existing_business_name: form.existing_business_name,
        status: "completed",
        completed_at: new Date().toISOString(),
      });

      onComplete({
        client_id: client.id,
        ...form,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <div className="text-center">
        <h2 className="font-heading text-2xl font-bold">Tell us about your business</h2>
        <p className="mt-1 text-sm text-white/50">This kicks off the entire dominance pipeline.</p>
      </div>

      {/* Personal info */}
      <div className="dd-panel rounded-xl p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">
              <User className="h-3 w-3" /> Full Name
            </label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="John Smith"
              className="dd-input mt-1.5"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">
              <Mail className="h-3 w-3" /> Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@business.com"
              className="dd-input mt-1.5"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">
            <MapPin className="h-3 w-3" /> Street Address
          </label>
          <input
            value={form.street_address}
            onChange={(e) => setForm({ ...form, street_address: e.target.value })}
            placeholder="123 Main St, Suite 100"
            className="dd-input mt-1.5"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">City</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Dallas"
              className="dd-input mt-1.5"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40">State</label>
            <input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })}
              placeholder="TX"
              className="dd-input mt-1.5"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">
            <Building2 className="h-3 w-3" /> Industry
          </label>
          <input
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            placeholder="Plumbing, Legal, Dental, HVAC..."
            className="dd-input mt-1.5"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/40">Existing Business Name (optional)</label>
          <input
            value={form.existing_business_name}
            onChange={(e) => setForm({ ...form, existing_business_name: e.target.value })}
            placeholder="Smith & Co Plumbing"
            className="dd-input mt-1.5"
          />
        </div>
      </div>

      {/* Business stage */}
      <div>
        <label className="mb-3 block text-center text-xs font-semibold uppercase tracking-widest text-white/60">
          What do you want to do?
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {STAGES.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setForm({ ...form, business_stage: value })}
              className={`rounded-xl border p-4 text-left transition-all ${
                form.business_stage === value
                  ? "border-[#00f2ff] bg-[#00f2ff]/10 ring-1 ring-[#00f2ff]/30"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <Icon className={`h-5 w-5 ${form.business_stage === value ? "text-[#00f2ff]" : "text-white/40"}`} />
              <div className="mt-2 text-sm font-bold">{label}</div>
              <div className="mt-0.5 text-[11px] text-white/40">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={submit}
          disabled={!valid || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00f2ff] px-8 py-3 text-sm font-bold text-black transition hover:bg-[#00d4ff] disabled:opacity-30"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? "Creating profile..." : "Start GPT Sync"}
        </button>
      </div>
    </motion.div>
  );
}