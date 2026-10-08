// ============================================================
// DIGITAL DOMINANCE — Source-Truth Registry
// Converged from the Master Workbook (34 sheets), Top 300 NearMe/NearYou,
// the GPT Project source truth, and the Enterprise V2 factory contract.
// This is the "according to Google requirements" spec the factory enforces.
// ============================================================

export const CORE_SERVICES = [
  { rank: 1, name: "Plumber", slug: "plumber", vertical: "home_repair", est_volume: 2400000, lead_value: 350, emergency: true, pmax: true },
  { rank: 2, name: "Electrician", slug: "electrician", vertical: "home_repair", est_volume: 1800000, lead_value: 400, emergency: true, pmax: true },
  { rank: 3, name: "HVAC / AC Repair", slug: "hvac-repair", vertical: "home_repair", est_volume: 1500000, lead_value: 500, emergency: true, pmax: true },
  { rank: 4, name: "Roofer", slug: "roofer", vertical: "home_repair", est_volume: 1200000, lead_value: 800, emergency: true, pmax: true },
  { rank: 5, name: "Dentist", slug: "dentist", vertical: "health", est_volume: 1100000, lead_value: 300, emergency: false, pmax: false },
  { rank: 6, name: "Locksmith", slug: "locksmith", vertical: "auto_security", est_volume: 900000, lead_value: 200, emergency: true, pmax: false },
  { rank: 7, name: "Towing", slug: "towing", vertical: "auto", est_volume: 820000, lead_value: 150, emergency: true, pmax: false },
  { rank: 8, name: "Pest Control", slug: "pest-control", vertical: "home_repair", est_volume: 750000, lead_value: 250, emergency: false, pmax: true },
  { rank: 9, name: "Auto Repair", slug: "auto-repair", vertical: "auto", est_volume: 700000, lead_value: 400, emergency: false, pmax: false },
  { rank: 10, name: "Water Damage Restoration", slug: "water-damage-restoration", vertical: "home_repair", est_volume: 550000, lead_value: 2500, emergency: true, pmax: true },
  { rank: 11, name: "Tree Removal", slug: "tree-removal", vertical: "outdoor", est_volume: 450000, lead_value: 800, emergency: true, pmax: false },
  { rank: 12, name: "Carpet Cleaning", slug: "carpet-cleaning", vertical: "home_repair", est_volume: 380000, lead_value: 150, emergency: false, pmax: false },
  { rank: 13, name: "Garage Door Repair", slug: "garage-door-repair", vertical: "home_repair", est_volume: 350000, lead_value: 300, emergency: true, pmax: false },
  { rank: 14, name: "Mover", slug: "mover", vertical: "logistics", est_volume: 320000, lead_value: 700, emergency: false, pmax: true },
  { rank: 15, name: "House Cleaning", slug: "house-cleaning", vertical: "home_repair", est_volume: 290000, lead_value: 180, emergency: false, pmax: true },
  { rank: 16, name: "Lawn Care", slug: "lawn-care", vertical: "outdoor", est_volume: 260000, lead_value: 160, emergency: false, pmax: true },
  { rank: 17, name: "Appliance Repair", slug: "appliance-repair", vertical: "home_repair", est_volume: 240000, lead_value: 220, emergency: true, pmax: true },
  { rank: 18, name: "Epoxy Flooring", slug: "epoxy-flooring", vertical: "home_repair", est_volume: 180000, lead_value: 1200, emergency: false, pmax: false },
  { rank: 19, name: "Fence Installation", slug: "fence-installation", vertical: "outdoor", est_volume: 160000, lead_value: 900, emergency: false, pmax: false },
  { rank: 20, name: "Solar Installation", slug: "solar-installation", vertical: "home_repair", est_volume: 140000, lead_value: 3000, emergency: false, pmax: false },
];

export const METROS = [
  { rank: 1, name: "Miami-Fort Lauderdale-West Palm Beach, FL", city: "Miami", state: "FL", priority: "High" },
  { rank: 2, name: "Orlando-Kissimmee-Sanford, FL", city: "Orlando", state: "FL", priority: "High" },
  { rank: 3, name: "Tampa-St. Petersburg-Clearwater, FL", city: "Tampa", state: "FL", priority: "High" },
  { rank: 4, name: "Jacksonville, FL", city: "Jacksonville", state: "FL", priority: "High" },
  { rank: 5, name: "New York-Newark-Jersey City, NY-NJ-PA", city: "New York", state: "NY", priority: "High" },
  { rank: 6, name: "Los Angeles-Long Beach-Anaheim, CA", city: "Los Angeles", state: "CA", priority: "High" },
  { rank: 7, name: "Chicago-Naperville-Elgin, IL-IN-WI", city: "Chicago", state: "IL", priority: "High" },
  { rank: 8, name: "Houston-The Woodlands-Sugar Land, TX", city: "Houston", state: "TX", priority: "High" },
  { rank: 9, name: "Dallas-Fort Worth-Arlington, TX", city: "Dallas", state: "TX", priority: "High" },
  { rank: 10, name: "Atlanta-Sandy Springs-Roswell, GA", city: "Atlanta", state: "GA", priority: "High" },
  { rank: 11, name: "Phoenix-Mesa-Chandler, AZ", city: "Phoenix", state: "AZ", priority: "Medium" },
  { rank: 12, name: "Denver-Aurora-Lakewood, CO", city: "Denver", state: "CO", priority: "Medium" },
];

export const EMERGENCY_VERTICALS = [
  "Water Damage Restoration", "Fire Damage Restoration", "Biohazard Cleanup", "Flood Restoration",
  "Commercial Refrigeration Repair", "Emergency Plumber", "Emergency Electrician", "Emergency HVAC",
  "Emergency Roofing", "Emergency Locksmith", "Emergency Towing", "Emergency Tree Removal",
  "Burst Pipe Repair", "Gas Leak Repair", "Sewage Cleanup", "Board-Up Service",
];

export const INTENTS = [
  { key: "transactional", label: "Transactional", example: "[service] near me" },
  { key: "emergency", label: "Emergency", example: "24 hour [service]" },
  { key: "comparison", label: "Comparison", example: "best [service] near me" },
  { key: "cost", label: "Cost", example: "[service] cost" },
  { key: "availability", label: "Availability", example: "same day [service]" },
  { key: "informational", label: "Informational", example: "why is [system] leaking" },
];

export const PATTERNS = [
  { key: "near_me", label: "Near Me", multiplier: 1.0, search_boost: 1.0, domain_suffix: "nearme.com" },
  { key: "near_you", label: "Near You", multiplier: 0.85, search_boost: 0.7, domain_suffix: "nearyou.com" },
  { key: "branded_hub", label: "Branded Hub", multiplier: 1.0, search_boost: 1.0, domain_suffix: "" },
];

// Sheet 01 — Google Rules (SAFE / AVOID)
export const GOOGLE_RULES = [
  { rule: "People-first content", status: "SAFE", requirement: "Create for users first. Add original information, first-hand evidence, useful tools, complete answers and clear authorship.", priority: "Critical" },
  { rule: "Search-intent language", status: "SAFE", requirement: "Use words users search for naturally in titles, headings, alt text and link text.", priority: "High" },
  { rule: "Scaled AI content", status: "AVOID", requirement: "Do not mass-generate unoriginal pages primarily to manipulate rankings.", priority: "Critical" },
  { rule: "Doorway pages", status: "AVOID", requirement: "Do not create many region/city/domain variants that funnel users to one destination with little unique value.", priority: "Critical" },
  { rule: "Keyword stuffing", status: "AVOID", requirement: "No unnatural repetition or hidden keyword blocks.", priority: "Critical" },
  { rule: "Fake locations", status: "AVOID", requirement: "No invented offices, service areas, or geographic claims.", priority: "Critical" },
  { rule: "Fake reviews", status: "AVOID", requirement: "No fabricated social proof or review schema.", priority: "Critical" },
  { rule: "Hidden text/links", status: "AVOID", requirement: "No text/links hidden from users but present for crawlers.", priority: "Critical" },
  { rule: "Deceptive redirects", status: "AVOID", requirement: "No redirects that mislead users or crawlers about destination.", priority: "Critical" },
  { rule: "Misleading structured data", status: "AVOID", requirement: "Schema must match visible content exactly.", priority: "High" },
];

// Sheet 02 — Page Change Matrix (every page must change)
export const PAGE_CHANGE_MATRIX = [
  { element: "Canonical URL", change: "Yes", rule: "Unique page identity; avoid duplicate aliases." },
  { element: "Title", change: "Yes", rule: "Service + truthful location/intent + differentiator; unique." },
  { element: "H1", change: "Yes", rule: "Natural user-facing promise aligned to purpose." },
  { element: "Meta description", change: "Yes", rule: "Unique summary tied to real service/location/proof." },
  { element: "Intro", change: "Yes", rule: "Immediately answer who/what/where/when and next step." },
  { element: "Service specifics", change: "Yes", rule: "Methods, equipment, materials, exclusions, response sequence." },
  { element: "Local specifics", change: "Yes", rule: "Coverage, arrival logic, climate/permit/property context." },
  { element: "Proof", change: "Yes", rule: "Real photos, cases, credentials, warranty, SLAs." },
  { element: "FAQ", change: "Yes", rule: "Intent-matched Q&As with verified answers." },
  { element: "Internal links", change: "Yes", rule: "Descriptive anchors to genuinely useful related pages." },
];

// Sheet 09 — Programmatic SEO gates
export const PROGRAMMATIC_SEO_GATES = [
  { control: "Verified inputs", spec: "Client/entity, service, location, proof, pricing logic, FAQs, contact routing, analytics IDs.", status: "SAFE" },
  { control: "Generation gate", spec: "Generate only when required proof/data fields pass completeness rules.", status: "SAFE" },
  { control: "Differentiation gate", spec: "Each indexable page must add meaningful value beyond service/city token swaps.", status: "SAFE" },
  { control: "Thin-page gate", spec: "If value score fails, do not generate or noindex.", status: "SAFE" },
  { control: "No doorway fleets", spec: "No near-identical region pages funneling to one destination.", status: "SAFE" },
  { control: "No scaled thin AI", spec: "No volume primarily for ranking with little user value.", status: "SAFE" },
];

// Sheet 11 — Content Differentiation layers
export const CONTENT_DIFFERENTIATION = [
  { layer: "Real service specifics", examples: "Methods, equipment, materials, exclusions, response sequence", requirement: "Required" },
  { layer: "Real local specifics", examples: "Coverage, arrival logic, climate/permit/property context", requirement: "Required on location pages" },
  { layer: "Proof", examples: "Photos, cases, credentials, warranty, SLAs, measurements", requirement: "Strong" },
  { layer: "Interactive utility", examples: "Estimator, diagnostic, checklist, availability, calculator", requirement: "High leverage" },
  { layer: "Expert insight", examples: "Inspection points, failure modes, decision criteria", requirement: "High leverage" },
];

// Sheet 26 — What Not To Do
export const WHAT_NOT_TO_DO = [
  { pattern: "Doorway city/domain network", status: "AVOID", why: "Near-identical region pages funneling to one destination." },
  { pattern: "Scaled unoriginal AI pages", status: "AVOID", why: "Volume primarily for ranking with little user value." },
  { pattern: "Keyword stuffing", status: "AVOID", why: "Unnatural repetition/hiding." },
  { pattern: "Fake locations", status: "AVOID", why: "Invented offices/service areas/claims." },
  { pattern: "Fake reviews/testimonials", status: "AVOID", why: "Fabricated social proof or review schema." },
  { pattern: "Scraped/copied pages", status: "AVOID", why: "Copied content without added value." },
  { pattern: "Hidden text/links", status: "AVOID", why: "Text/links hidden from users." },
  { pattern: "Deceptive redirects", status: "AVOID", why: "Misleading about destination." },
];

// Sheet 31 — Compliance Checklist
export const COMPLIANCE_CHECKLIST = [
  { control: "Source truth complete", pass: "Client/service/location/proof/contact/permission verified" },
  { control: "Unique user value", pass: "Not token-swapped content" },
  { control: "People-first purpose", pass: "Useful even without search traffic" },
  { control: "No spam pattern", pass: "No doorway/scaled thin/stuffing/link scheme/cloaking" },
  { control: "Crawlability", pass: "200/robots/meta/canonical/internal link correct" },
  { control: "Structured data", pass: "Schema matches visible facts" },
  { control: "Mobile UX", pass: "Fast, accessible, usable on mobile" },
  { control: "Primary conversion", pass: "Useful, working CTA (call/quote/book)" },
  { control: "No fabricated trust", pass: "No fake reviews/locations/credentials" },
  { control: "Independent validator", pass: "Validator receipt on file" },
];

// Sheet 06 — Service Funnels
export const SERVICE_FUNNELS = [
  { funnel: "Emergency Direct Response", layout: "Problem -> immediate credibility -> call/dispatch CTA -> proof -> service area -> FAQ -> CTA", cta: "Call now / dispatch now" },
  { funnel: "Quote-first", layout: "Value prop -> instant quote/estimate -> qualification -> proof -> schedule", cta: "Get quote" },
  { funnel: "Book-now", layout: "Availability -> service -> times -> proof -> booking", cta: "Book now" },
  { funnel: "Call-first local", layout: "Local promise -> click-to-call -> trust strip -> services -> coverage -> FAQ", cta: "Call now" },
  { funnel: "Diagnostic quiz", layout: "Symptom selector -> likely issue -> next step -> lead capture", cta: "Diagnose my issue" },
];

// Sheet 07 — Hooks Psychology
export const HOOKS = [
  { principle: "Specificity", use: "Use concrete verified specifics, not generic superlatives.", effect: "Trust" },
  { principle: "Loss aversion", use: "Explain credible cost/risk of delay without fearmongering.", effect: "Urgency" },
  { principle: "Uncertainty reduction", use: "Show next step, timing, pricing logic and exclusions.", effect: "Conversion" },
  { principle: "Social proof", use: "Use genuine attributable proof only.", effect: "Trust" },
  { principle: "Authority", use: "Show real licenses, certifications, methods and expertise.", effect: "Trust" },
];

// Sheet 32 — Search Categories
export const SEARCH_CATEGORIES = [
  { rank: 1, category: "Emergency intent", examples: "[service] near me; 24 hour [service]; [service] open now", rule: "Create a page only when real demand and differentiated value exist." },
  { rank: 2, category: "Problem/symptom", examples: "why is [system] leaking; [symptom] repair near me", rule: "Create a page only when real demand and differentiated value exist." },
  { rank: 3, category: "Cost", examples: "[service] cost; [service] estimate", rule: "Create a page only when real demand and differentiated value exist." },
  { rank: 4, category: "Availability", examples: "same day [service]; available today", rule: "Create a page only when real demand and differentiated value exist." },
  { rank: 5, category: "Comparison", examples: "best [service] near me; [service] vs [alternative]", rule: "Create a page only when real demand and differentiated value exist." },
];

// Sheet 16 — Swarm Agents
export const SWARM_AGENTS = [
  { agent: "Apex Commander", responsibility: "Source truth, approvals, dispatch, receipts", role: "Supervisor" },
  { agent: "Digital Dominance Coordinator", responsibility: "SEO/AEO/local/fleet coordination", role: "Coordinator" },
  { agent: "Source Truth Agent", responsibility: "Validate client/service/location/proof", role: "Worker" },
  { agent: "Search Intelligence Agent", responsibility: "Queries, SERPs, trends, competitor evidence", role: "Worker" },
  { agent: "Keyword Economics Agent", responsibility: "Volume/CPC/intent/lead economics", role: "Worker" },
  { agent: "Page Factory Agent", responsibility: "Generate differentiated, compliant pages", role: "Worker" },
  { agent: "Technical SEO Agent", responsibility: "Crawl/index/schema/sitemap validation", role: "Worker" },
  { agent: "Provisioning Agent", responsibility: "Supabase/Vercel/Railway/GoDaddy/Drive", role: "Worker" },
  { agent: "Independent Validator", responsibility: "Receipt, rollback pointer, gate enforcement", role: "Validator" },
];

// Governance — Approval Matrix
export const APPROVAL_MATRIX = [
  { action: "Research / read", default: "AUTO" },
  { action: "Draft content / docs", default: "AUTO" },
  { action: "Branch-safe code", default: "AUTO" },
  { action: "Preview/sandbox deploy", default: "AUTO" },
  { action: "Tests / validation", default: "AUTO" },
  { action: "Production deployment", default: "APPROVAL" },
  { action: "Default/protected branch merge", default: "APPROVAL" },
  { action: "Production DB/RLS/schema", default: "APPROVAL" },
  { action: "DNS/domain changes", default: "APPROVAL" },
  { action: "Secrets/credentials", default: "APPROVAL" },
  { action: "Payments/spend", default: "APPROVAL" },
  { action: "Public social publishing", default: "APPROVAL" },
  { action: "Customer/public communications", default: "APPROVAL" },
  { action: "Destructive/irreversible action", default: "APPROVAL" },
];

// Sheet 25 — Scale Expansion stages
export const SCALE_STAGES = [
  { stage: "1", scope: "1 service/client + 1 metro + 10-30 pages", gate: "Validate technical/indexation/lead quality." },
  { stage: "2", scope: "3-5 adjacent services/metros", gate: "Unique proof and local/service differentiation." },
  { stage: "3", scope: "State cluster", gate: "State hubs, routing, QA sampling, entity governance." },
  { stage: "4", scope: "Multi-state", gate: "Regional infra, data-quality monitoring, stronger operations." },
  { stage: "5", scope: "National vertical", gate: "Brand/entity authority, proof base, service-level routing." },
];

export const slugify = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const patternDomain = (serviceSlug, pattern) => {
  const p = PATTERNS.find((x) => x.key === pattern);
  if (!p || !p.domain_suffix) return null;
  return `${serviceSlug}${p.domain_suffix}`;
};