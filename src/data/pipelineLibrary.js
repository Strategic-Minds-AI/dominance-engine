// ============================================================
// DIGITAL DOMINANCE — Programmatic Pipeline Library
// The canonical "library" a ChatGPT Project syncs with: the
// stages, mutation rules, citation targets, and sitemap rules
// the programmatic SEO pipeline enforces. Mirrors the backend
// orchestrator (base44/functions/runProgrammaticPipeline).
// ============================================================

// The 7-stage programmatic pipeline the operator runs end-to-end.
export const PIPELINE_STAGES = [
  {
    id: 1,
    name: "Library Sync",
    icon: "RefreshCw",
    desc: "GPT Project syncs with this library + source registry so ChatGPT operates the same governed factory.",
    gate: "Source truth restored",
  },
  {
    id: 2,
    name: "Create & Install",
    icon: "Factory",
    desc: "Generate a verified, Google-compliant base website in the Website Factory and install its pages.",
    gate: "Verified inputs + generation gate",
  },
  {
    id: 3,
    name: "Strategic Mutation",
    icon: "Wand2",
    desc: "Pipeline clones the base site across metros, mutating content, NAP, schema, and local context per location.",
    gate: "Page-change matrix + differentiation gate",
  },
  {
    id: 4,
    name: "Google Search Console Sync",
    icon: "Search",
    desc: "Generate a per-site sitemap.xml and submit it to Google Search Console so Google can crawl and index.",
    gate: "Sitemap valid + GSC connector authorized",
  },
  {
    id: 5,
    name: "Scale to Hundreds of Locations",
    icon: "Network",
    desc: "Multiply the site across 100s of target metros in a single governed rollout (max 250 per run).",
    gate: "Unique value per location (no doorway fleets)",
  },
  {
    id: 6,
    name: "Citation Distribution",
    icon: "Share2",
    desc: "Submit NAP (name/address/phone) to directory targets so the business is more digitally known.",
    gate: "Per-directory credentials configured",
  },
  {
    id: 7,
    name: "Monitor & Multiply Winners",
    icon: "TrendingUp",
    desc: "Track indexation, leads, and revenue; multiply proven winners and kill or quarantine losers.",
    gate: "First-party conversion evidence",
  },
];

// How every page must change when cloned to a new location (workbook Sheet 02).
export const MUTATION_MATRIX = [
  { element: "Canonical URL", rule: "Unique per domain — same slug, different domain per metro." },
  { element: "Title", rule: "Service + truthful location + differentiator; unique per metro." },
  { element: "H1", rule: "Natural user-facing promise with the target city." },
  { element: "Meta description", rule: "Unique summary tied to real service/location/proof." },
  { element: "Intro", rule: "Who/what/where/when + next step, localized honestly." },
  { element: "Sections", rule: "Service specifics + real local context per metro." },
  { element: "FAQ", rule: "Intent-matched Q&As with the target city." },
  { element: "Schema", rule: "LocalBusiness areaServed updated to the target city; NAP truthful." },
];

// Directory targets for the citation distribution stage.
export const CITATION_DIRECTORIES = [
  "Google Business Profile",
  "Bing Places for Business",
  "Apple Maps Connect",
  "Yelp for Business",
  "Facebook Business Page",
  "Foursquare for Business",
  "Yellow Pages (YP.com)",
  "BBB Accredited Business",
  "MapQuest",
  "Superpages",
  "Local.com",
  "Manta",
  "Hotfrog",
  "Citysearch",
  "Four11",
  "Trustpilot Business",
];

export const SITEMAP_RULES = {
  format: "xml",
  changefreq: "weekly",
  homePriority: "1.0",
  pagePriority: "0.8",
  path: "/sitemap.xml",
  robots: "Allow: /\nSitemap: https://<domain>/sitemap.xml",
};