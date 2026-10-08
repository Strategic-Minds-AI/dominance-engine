// Agent metadata for the portal UI — mirrors base44/shared/gatewayAgents.ts
// (frontend can't import backend shared modules, so we duplicate the display data)
export const AGENT_LIST = [
  { id: "orchestrator", label: "The Orchestrator", tagline: "Apex master agent — commands the entire fleet", icon: "Crown", color: "#1a1a2e", taskType: "planning" },
  { id: "social_strategist", label: "Social Strategist", tagline: "Social media super-agent — content, calendars, engagement", icon: "Share2", color: "#e94560", taskType: "social_content" },
  { id: "growth_operator", label: "Growth Operator", tagline: "Autonomous SEO & Google growth agent", icon: "TrendingUp", color: "#0f3460", taskType: "seo_audit" },
  { id: "sales_engine", label: "Sales Engine", tagline: "Revenue super-agent — leads, outreach, pipeline, closing", icon: "DollarSign", color: "#16a34a", taskType: "sales_outreach" },
  { id: "brand_guardian", label: "Brand Guardian", tagline: "Content & brand super-agent — voice, copy, positioning", icon: "Shield", color: "#7c3aed", taskType: "content_writing" },
  { id: "code_architect", label: "Code Architect", tagline: "Coding super-agent — write, review, debug, ship", icon: "Code", color: "#0891b2", taskType: "code_generation" },
  { id: "replicator", label: "Replicator", tagline: "Mass deployment agent — clone validated systems at scale", icon: "Copy", color: "#ea580c", taskType: "template_generation" },
  { id: "swarm", label: "Swarm", tagline: "Parallel coordination — split goals, dispatch, aggregate", icon: "Network", color: "#dc2626", taskType: "complex_reasoning" },
];