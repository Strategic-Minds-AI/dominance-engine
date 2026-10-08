import React from "react";

export default function AgentCard({ agent, onLaunch }) {
  return (
    <article className="dd-panel rounded-xl p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#00f2ff]/40 dd-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#00f2ff]/10 border border-[#00f2ff]/30">
          <span className="text-2xl">{agent.icon}</span>
        </div>
        {agent.apex && <span className="rounded-full bg-[#00f2ff] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">APEX</span>}
        {agent.flagship && !agent.apex && <span className="rounded-full border border-[#00f2ff]/40 bg-[#00f2ff]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#00f2ff]">FLAGSHIP</span>}
      </div>
      <div>
        <h3 className="font-heading font-bold text-lg text-white">{agent.label}</h3>
        <p className="text-sm text-white/55 mt-1 leading-relaxed">{agent.description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {agent.skills.map((s) => (
          <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{s}</span>
        ))}
      </div>
      <button onClick={() => onLaunch(agent)} className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#00f2ff] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#00d4ff]">
        Launch agent
      </button>
    </article>
  );
}