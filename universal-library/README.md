# Strategic Minds AI | Universal Digital Dominance Library v1
Status: DRAFT / staging-only architecture. No live integrations or production deployment authorized by this document.
Owner: Strategic Minds AI. Canonical implementation proposal: dominance-engine. Other Base44 interfaces consume versioned APIs, not duplicate stores.

## Goal
One reusable multi-tenant digital business operating system: discover -> onboard -> plan -> create -> QA -> preview -> approve -> publish -> measure -> optimize -> follow up.
Keep source facts, generated drafts, approvals, live actions and evidence distinct.

## Components
- Fault Line: candidate discovery, website audit findings, evidence and opportunity scores.
- Interactive onboarding: mobile-first progress steps (identity, business operations, services, locations, proof, goals, integrations, consent, approvals), autosave + resume, upload verification, AI interview/voice optional, accessible form fallback.
- Industry packs: schema + interview + template + page types + local intent queries + domain-specific compliance gates.
- Vercel AI Gateway: server-side single model router with quotas, traces, structured output validation and cost budget; never expose secrets to browser.
- Supabase: authoritative per-tenant records, RLS, jobs, leases, idempotency, events, execution receipts, consent ledger and analytics.
- Vercel + queue worker: previews, builds, scheduled workers, event callbacks; one authoritative heartbeat per mission, no duplicate cron.
- GPT: connected interactive operator plus server-driven agent API; ChatGPT conversations are NOT themselves guaranteed durable autonomous executors.
- Social: provider OAuth, per-network capability flags, editorial plan, asset creation, explicit scoped publish grants, moderation + human escalation. No unauthorized automated engagement.
- Communications: contact provenance, allowed channel, consent, opt-out, quiet hours, legal review, human approval and sender registration before any live campaign.
- SEO/AEO/GEO: site architecture, useful original local pages, sitemap partitioning, real entity facts, internal linking, server-rendered HTML, canonical and status policy, valid feature-appropriate JSON-LD, Search Console measurement. No automatic promises of ranking.

## Canonical records (contract identifiers in schema/registry.json)
tenant, user, client, business_profile, brand_kit, service_catalog, location, proof_asset, onboarding_session, integration_connection, industry_pack, page_template, content_brief, content_asset, domain, site, page, seo_audit, faultline_finding, prospect, campaign, social_account, social_post, contact, channel_consent, agent_mission, work_item, approval, validation_receipt, provider_event, performance_snapshot.

## Primary pipeline states
DISCOVERED -> QUALIFIED -> ONBOARDING -> BRIEF_READY -> DRAFTING -> QA_PENDING -> PREVIEW_READY -> CLIENT_REVIEW -> APPROVED -> PUBLISH_QUEUED -> PUBLISHED -> MONITORING.
FAIL, PAUSED and CANCELLED are separate durable states, not silent retries.
Transition checks: tenant authorization, required facts, dedup key, validation, approval capability, budget and rate limit.

## Ownership / anti-duplication
- One Supabase canonical data store, per-tenant RLS and audit log; Base44 apps are replaceable UIs.
- One approved queue / leased worker set and single scheduler authority per mission.
- Assign each capability ONE canonical implementation after comparing existing repos, not by names alone.
- All apps sync via signed backend events and idempotent APIs; never cross-tenant database access.
- Provider webhook verification, retry safety and dead-letter queue.
- Production publish, paid provisioning, domain changes, data migrations, bulk communications and social replies remain gated.

## Proof-of-value launch
1. Identify one existing app-to-repository relationship and freeze baseline.
2. Run Fault Line 20-business discovery canary with source attribution.
3. Invite one synthetic demo client; complete interactive onboarding.
4. Generate one niche funnel and one genuinely distinct local landing page.
5. Validate link/navigation, form, mobile, accessibility, canonical, sitemap, structured data and factual accuracy.
6. Build preview and approval receipt without production publication.
7. Verify Supabase job, event, receipts and UI replay across app boundaries.
8. Expand to 5 pilots, then controlled batches only after per-site acceptance gates.

## Operating scorecards
Time from onboarding to preview, % QA pass, cost/site, content originality score with human review, lead conversion, crawl/index coverage, query impressions, booked qualified appointments, consent complaints and account health. Rank on independently observed Search Console data; never claim Page 1 from predictions.
