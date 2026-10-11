// Strategic Minds AI capability taxonomy, version 1.
// This is a catalog of services available for discovery and scoping, not a claim of deployed products or certifications.
// Every category may become an indexable service page only after editorial evidence and independent SEO eligibility validation.
export const CATALOG_VERSION = "2026-10-10-v1";
const RAW = [
  [
    "AI Strategy & Consulting",
    "sparkles",
    "Turn AI ambition into a prioritized, financially accountable transformation roadmap.",
    "Build confidence in what to automate, what to keep human, and what to measure.",
    "AI readiness assessment|Executive AI roadmap|Fractional AI architecture|AI opportunity valuation|Workforce enablement strategy|Responsible AI governance",
    "Leadership clarity, phased delivery milestones and measurable business objectives."
  ],
  [
    "Autonomous Agents & Swarms",
    "brain-circuit",
    "Design specialized AI operators that research, coordinate and complete governed tasks.",
    "Move repeatable workflows from ad hoc prompts into durable, auditable execution.",
    "Task and research agents|Multi-agent orchestration|Browser operation agents|Computer workflow agents|Approval-aware agent swarms|Persistent mission control",
    "Long-running workflows with permissions, receipts, escalation and human review."
  ],
  [
    "Custom Software & Applications",
    "code-2",
    "Purpose-built digital tools that fit the business instead of forcing it into generic software.",
    "Make unique workflows easier to use across desktop, mobile and field teams.",
    "Custom SaaS platforms|Business operating portals|Progressive web apps|Internal productivity tools|AI-enabled dashboards|Multi-tenant client portals",
    "Secure interfaces, role-based workflows and integration-ready applications."
  ],
  [
    "Websites & Conversion Systems",
    "globe-2",
    "Premium websites built around buyer questions, original utility and high-intent conversion paths.",
    "Turn digital visibility into useful visitor experiences and attributable qualified leads.",
    "High-conversion websites|Automated website factories|Instant quote funnels|Location-aware service hubs|Programmatic content workflows|Conversion-rate optimization",
    "Distinct, accessible and verifiable pages with working lead flows and deployment checks."
  ],
  [
    "SEO, AEO & AI Search Discovery",
    "search",
    "Make content comprehensible, crawlable and genuinely useful across traditional and AI-assisted search.",
    "Strengthen search fundamentals and capture relevant customer questions with evidence.",
    "Technical SEO audits|Answer-first content architecture|Structured data engineering|AI search visibility research|Content decay and refresh|Local discovery optimization",
    "Crawlable content, validated schema and measurable organic discovery without ranking guarantees."
  ],
  [
    "Sales & Intelligent CRM",
    "handshake",
    "Keep valuable opportunities organized from first inquiry through qualified pipeline and revenue.",
    "Give teams timely next steps and transparent lead attribution.",
    "AI-enabled CRM workflows|Lead qualification and scoring|Sales proposal assistance|Lead routing and assignment|Sales follow-up drafting|Pipeline and revenue attribution",
    "Practical sales workflows with ownership, consent and complete activity history."
  ],
  [
    "Marketing & Advertising Intelligence",
    "megaphone",
    "Use better information to plan, produce and evaluate omnichannel campaigns.",
    "Reduce repetitive marketing operations while improving campaign learning.",
    "Campaign strategy assistance|Creative testing programs|Paid search operations support|Audience research and segmentation|Marketing attribution models|Landing page experimentation",
    "Clear campaign objectives, draft assets and inspectable performance signals."
  ],
  [
    "Social Media & Community",
    "messages-square",
    "Create consistent, channel-aware publishing operations without losing brand voice.",
    "Make social publishing intentional, reviewable and measurable.",
    "Cross-platform content calendars|AI post and caption drafting|Community response assistance|Short-form video storyboards|Hashtag and topic research|Social performance analysis",
    "Approval-led calendars and platform-specific content with authentic engagement."
  ],
  [
    "Brand, Design & Creative AI",
    "palette",
    "Create coherent brand systems and reusable assets across every customer touchpoint.",
    "Unify strategy, aesthetics and conversion quality across web, media and product.",
    "Brand positioning systems|Logo and identity directions|AI-assisted product photography|Video creative production|3D and motion concepts|Design systems and templates",
    "Distinctive visual language with accessible interfaces and reusable brand tokens."
  ],
  [
    "Voice, Chat & AI Reception",
    "mic",
    "Create helpful conversational experiences that connect customers to real services.",
    "Respond to common inquiries, capture intent and escalate when human judgment is needed.",
    "AI voice receptionists|Website AI assistants|Appointment request assistants|Multilingual support flows|Phone and conversation summaries|Interactive onboarding avatars",
    "Permissioned conversations, handoff paths and clear disclosure where required."
  ],
  [
    "Customer Experience & Support",
    "headphones",
    "Simplify customer service with knowledge-grounded and escalation-aware workflows.",
    "Resolve routine questions faster without trapping people behind a bot.",
    "Helpdesk triage assistants|Knowledge-grounded support chat|Customer onboarding journeys|Ticket summarization|Service quality analysis|Self-service knowledge portals",
    "Answers grounded in business documentation with human escalation and traceable support history."
  ],
  [
    "Commerce & Retail AI",
    "shopping-bag",
    "Improve online buying experiences while retaining accurate inventory and commerce records.",
    "Support product discovery, content workflows and measurable store performance.",
    "AI-assisted ecommerce storefronts|Product discovery systems|Catalog enrichment pipelines|Retail customer segmentation|Order service automations|Conversion and merchandising analysis",
    "Merchant-controlled storefront operations, accurate product data and governed customer messaging."
  ],
  [
    "Data, Analytics & Forecasting",
    "bar-chart-3",
    "Connect fragmented business information to decisions people can act on.",
    "Turn raw operational data into useful reporting and bounded predictions.",
    "Business intelligence dashboards|Data ingestion and ETL|Revenue forecasting models|Anomaly and failure detection|Customer lifecycle analytics|Executive reporting copilots",
    "Source-linked analytics, data-quality checks and transparent assumptions."
  ],
  [
    "Automation & Connected Workflows",
    "workflow",
    "Connect existing software into consistent, observable business processes.",
    "Reduce manual switching, duplicated entry and stalled handoffs.",
    "Workflow automation|API and MCP integrations|Document-to-system workflows|Calendar and scheduling automation|Cross-app synchronization|Job queues and retries",
    "Durable events, permissions, error handling, idempotency and rollback paths."
  ],
  [
    "Security, Privacy & AI Governance",
    "shield-check",
    "Make automation trustworthy through least privilege, monitoring and verified controls.",
    "Support a resilient system where speed does not bypass safety.",
    "AI system security assessments|Access and tenant isolation|Model and agent evaluations|Sensitive-data handling design|Operational incident monitoring|Audit and compliance evidence",
    "Reviewable controls, protected approvals and independent validation."
  ],
  [
    "Knowledge, Documents & Research",
    "book-open",
    "Make organizational knowledge easier to find, use and maintain.",
    "Ground AI responses in accessible source material and maintain data provenance.",
    "Private knowledge assistants|Retrieval-augmented generation|Document extraction workflows|Meeting and action summaries|Contract intake assistance|Research synthesis systems",
    "Searchable information with citation, versioning and human review of consequential outputs."
  ],
  [
    "People, Training & Workforce",
    "users",
    "Help employees learn, coordinate and work with AI-enabled processes.",
    "Improve onboarding and performance support while preserving human employment decisions.",
    "AI staff onboarding|Internal training copilots|Workforce knowledge hubs|Scheduling assistants|Recruiting workflow assistance|Learning content generation",
    "Practical internal tools with role-aware access, fairness checks and human decisions."
  ],
  [
    "Finance, Admin & Back Office",
    "wallet-cards",
    "Simplify administrative work while keeping approvals and financial control clear.",
    "Reduce paperwork and connect operational actions to trustworthy records.",
    "Invoice and receipt workflows|Budget scenario modeling|Procurement assistance|Expense categorization support|Quote and proposal systems|Operations process optimization",
    "Traceable administrative workflows with appropriate financial and professional review."
  ],
  [
    "Construction & Field Service AI",
    "hard-hat",
    "Help service and construction operators estimate, schedule and deliver real work.",
    "Connect field evidence, quoting, customer communication and operations.",
    "Contractor instant-estimate engines|Field service dispatch workflows|Project evidence portals|Material selection assistants|Jobsite documentation tools|Equipment and training systems",
    "Verified scope inputs, practical field interfaces and accountable lead-to-job processes."
  ],
  [
    "Industry-Specific AI Solutions",
    "building-2",
    "Adapt reusable technology to the needs of different industries and operating models.",
    "Deliver business-specific tools rather than generic automation sold under a new name.",
    "Healthcare administration workflow design|Legal intake and case-routing tools|Real estate operations intelligence|Education and training platforms|Logistics and fleet intelligence|Hospitality and professional services",
    "Industry-shaped experiences with appropriate privacy, compliance and domain-expert review."
  ]
];
export const SERVICE_CATEGORIES = RAW.map(([title,icon,description,buyerNeed,items,outcome],index)=>({
  id: index+1, title, icon, slug: title.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),
  description, buyerNeed, outcome,
  services: items.split("|").map((title,idx)=>({id:(index+1)+"-"+(idx+1),title,slug:title.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}))
}));
export const TOTAL_SERVICE_COUNT=SERVICE_CATEGORIES.reduce((sum,c)=>sum+c.services.length,0);
export const FEATURED_INDUSTRIES=[
  {name:"Home & Field Services",icon:"home",need:"Leads, call handling, dispatch and estimates"},
  {name:"Construction & Flooring",icon:"hammer",need:"Project qualification, quoting and training"},
  {name:"Law & Professional Services",icon:"scale",need:"Intake, case routing and knowledge"},
  {name:"Healthcare Administration",icon:"heart-pulse",need:"Scheduling and compliant administrative workflows"},
  {name:"Real Estate",icon:"building-2",need:"Market intelligence and workflow coordination"},
  {name:"Retail & Ecommerce",icon:"shopping-cart",need:"Product discovery, service and attribution"},
  {name:"Manufacturing & Distribution",icon:"factory",need:"Inventory workflows and process intelligence"},
  {name:"Education & Training",icon:"graduation-cap",need:"Enrollment, learning and student support"},
  {name:"Marketing & Agencies",icon:"megaphone",need:"Creative operations and campaign analytics"},
  {name:"Financial Services",icon:"landmark",need:"Governed operations and document workflows"},
  {name:"Hospitality & Travel",icon:"hotel",need:"Guest journeys and service workflows"},
  {name:"Logistics & Transportation",icon:"truck",need:"Scheduling, fleet data and customer operations"}
];
