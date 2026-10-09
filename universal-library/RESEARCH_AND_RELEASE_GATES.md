# Research-backed release gates (reviewed 2026-10-08)

## Official references
- Google spam policies https://developers.google.com/search/docs/essentials/spam-policies
- Google people-first guidance https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google structured data https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google sitemap guidance https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Indexing API scope https://developers.google.com/search/apis/indexing-api/v3/using-api
- Vercel Gateway authentication https://vercel.com/docs/ai-gateway/authentication-and-byok
- Vercel Gateway OpenAI-compatible API https://vercel.com/docs/ai-gateway/sdks-and-apis
- OpenAI webhooks https://developers.openai.com/api/docs/guides/webhooks
- Twilio A2P 10DLC https://www.twilio.com/docs/messaging/compliance/a2p-10dlc
- FTC telemarketing compliance https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule
- Instagram professional API capabilities https://www.postman.com/meta/instagram/folder/u4g5a2a/instagram-api-with-facebook-login

## Go/no-go conditions
SEO: no doorway networks, clone/spun pages, fictional local business presence or artificial review markup. Unique audience value and truthful first-party content required. Google offers no guaranteed Page 1 result.
Indexing: ordinary sites use sitemap/Search Console. Google Indexing API is limited to supported job posting and livestream event URLs.
AEO/GEO: use consistent named-entity information, answerable factual content, citations, useful tools, crawlable HTML and normal Search Console measurement. No special Google AI ranking switch or guaranteed placement.
Social: get documented client scope and provider OAuth tokens; network-specific permitted publish and reply capabilities, editorial approval policies and moderation escalations. Never manufacture interactions or use unauthorized automation.
Outreach: only permitted channels, identity disclosures, provenance/consent, DNC/suppression, opt-out, sender registration, quiet hours, legal review for automated calls/texts; keep all live sends gated.
Security: per-tenant RLS, server-side secrets, scoped provider grants, webhook signatures, receipts, replay-safe idempotency, independent validator, cost ceilings.
Onboarding: consent to terms is separate from marketing consent. File uploads malware-scanned, private-by-default and deletion/export supported.
Migration: link Base44 app IDs and published domains to authoritative repo and environment before any merge or deploy; diff shared functions and preserve rollback receipts.
Acceptance: 1 synthetic onboarding -> 1 approved draft -> 1 accessible working preview -> tracked evidence in Supabase -> replay identical result in second UI; no public deployment until separately approved.
