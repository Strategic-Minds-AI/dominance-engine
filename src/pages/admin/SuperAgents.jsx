import React, { useState } from "react";
import { Bot, ArrowLeft } from "lucide-react";
import AgentCard from "@/components/agents/AgentCard";
import AgentChat from "@/components/agents/AgentChat";

const AGENTS = [
  {
    name: "orchestrator",
    label: "The Orchestrator",
    icon: "🧠",
    description: "The apex master agent. Receives any business goal, decomposes it across stages, and commands the entire specialist fleet through the AgentTask queue.",
    skills: ["Decomposition", "Dispatch", "Mission Briefs", "Fleet Routing"],
    apex: true,
  },
  {
    name: "swarm",
    label: "Swarm",
    icon: "🐝",
    description: "Parallel coordination super-agent. Splits a goal into independent subtasks and dispatches them across the fleet simultaneously for maximum throughput.",
    skills: ["Parallel Dispatch", "Subtask Splitting", "Aggregation"],
  },
  {
    name: "growth_operator",
    label: "Growth Operator",
    icon: "📈",
    description: "Takes any URL end-to-end through Google Search Console, GA4, GTM, sitemap submission, index coverage, competitor intelligence, and continuous monitoring.",
    skills: ["GSC", "GA4", "Sitemaps", "SEO Audit", "Indexing"],
    flagship: true,
  },
  {
    name: "code_architect",
    label: "Code Architect",
    icon: "💻",
    description: "Writes, reviews, refactors, debugs and ships production code across the stack. Acts like an elite staff engineer pair-programming with you.",
    skills: ["Code Gen", "Review", "Refactor", "Debug", "Architect"],
  },
  {
    name: "brand_guardian",
    label: "Brand Guardian",
    icon: "🎨",
    description: "Owns brand voice, messaging, content strategy, and copywriting across every touchpoint. Ready-to-ship copy, not theory.",
    skills: ["Brand Voice", "Copy", "Content Strategy", "Positioning"],
  },
  {
    name: "social_strategist",
    label: "Social Strategist",
    icon: "📱",
    description: "Plans campaigns, writes platform-native content, designs posting calendars, analyzes engagement, and grows audiences across channels.",
    skills: ["Social Content", "Calendars", "Engagement", "Audits"],
  },
  {
    name: "sales_engine",
    label: "Sales Engine",
    icon: "💰",
    description: "Lead generation, qualification, outreach sequences, pipeline management, follow-up automation, and closing playbooks — from prospect to closed deal.",
    skills: ["Lead Gen", "Outreach", "Pipeline", "Closing"],
  },
  {
    name: "replicator",
    label: "Replicator",
    icon: "🌀",
    description: "Clones and deploys the entire Xtreme AI agent fleet to new domains, systems, and Base44 apps at any scale. Mass deployment via batch operations.",
    skills: ["Fleet Cloning", "Mass Deploy", "Blueprints", "Resilience"],
  },
];

export default function SuperAgents() {
  const [active, setActive] = useState(null);

  if (active) {
    return <AgentChat agentName={active.name} agentLabel={active.label} onBack={() => setActive(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight text-white">
          <Bot className="h-6 w-6 text-[#00f2ff]" /> Super Agents
        </h1>
        <p className="mt-1 text-sm text-white/50">
          The Xtreme AI fleet — 8 super-agents powered by the Vercel AI Gateway. Launch any agent to start a conversation. Agents persist work to the AgentTask queue and command the existing Website, Opportunity, Pack, and ProvisioningJob entities.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-[#00f2ff]/30 bg-[#00f2ff]/5 p-3 text-xs text-[#00f2ff]">
        <span className="h-2 w-2 rounded-full bg-[#00f2ff] animate-pulse" />
        <span>Conversations run on the Vercel AI Gateway — independent of Base44 integration credits. Each agent routes to its optimal model automatically.</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.name} agent={agent} onLaunch={(a) => setActive(a)} />
        ))}
      </div>
    </div>
  );
}