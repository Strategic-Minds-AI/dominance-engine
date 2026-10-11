# Strategic Minds AI 2.0 | Frontend implementation and QA receipt
Date: 2026-10-11
Scope: PUBLIC VISUAL FRONTEND ONLY. Development branch and Vercel preview, NO production merge.

## Source and preview
- Base source branch: feature/strategic-minds-marketing-20261010 at 11fd62b1daf4bd075ff8b630397b42032872eb53.
- Frontend branch: feature/smai-v2-cinematic-abc-20261011
- Verified frontend code/asset commit: 9549ac5968a192c5a6afa6c2fe2b0d6f26ea3c94
- Vercel deployment READY: https://dominance-engine-j5h7v5jts-strategic-minds-advisory.vercel.app
- Variant A: /v2/a -- minimalist company logo / slogan / Earth mystery splash.
- Variant B: /v2/b -- expanded AI service catalog and business growth experience.
- Variant C: /v2/c -- Eden-led brand page and four-question frontend-only discovery wizard.
- Alias: /v2/eden maps to C.

## Exact implementation
- React component: src/pages/V2Experience.jsx
- Scoped stylesheet: src/pages/V2Experience.css
- Routes and public preview auth bypass: src/App.jsx
- Edge X-Robots-Tag config for /v2/:path*: vercel.json
- Original Eden source AVIF preserved: public/v2-assets/eden-skye-original.avif
- Derivative chrome mark: public/v2-assets/silver-emblem.png
- Derivative chrome title: public/v2-assets/chrome-wordmark.png
- Derivative connected Earth: public/v2-assets/connected-earth.jpg
- Original chrome/title/Earth source from operator-approved corporate poster. Faint pre-embedded poster buttons excluded by crop.
- Correct slogan INTELLIGENCE IN MOTION is rendered as accessible HTML instead of retaining incorrect letters baked into the poster.
- Calls: business tel:+17722090266; Eden proposed tel:+18665711174. Routing NOT independently verified.

## Measured observations
- Vercel build state READY for current deployment SHA.
- Headless Windows Chrome captured 1440x900 A/B/C screens and nominal 390x844 A/C screenshots in local approved frontend workspace; their exact pixel QA needs independent review.
- Real cloud browser at 1440x900 verified A nav positions: CALL EDEN x35-213, CALL NOW x1245-1405, central CTA x532-909; correct brand/route title.
- Real cloud browser at 390x844 verified A control positions: CALL EDEN x15-123; navigation menu x165-230; CALL NOW x271-375; CTA x75-315. All inside 390px viewport.
- Mobile navigation menu activated in browser and revealed appropriate navigation links, with click receipt.
- First visual screenshot revealed black poster crop rectangles; repaired using versioned transparent PNG assets and re-rendered.
- Preview headings appear correctly and live text slogan spelling repaired. No source bytes removed.
- browser screenshot API has separate Vercel Blob token blocker; Windows background Chrome generated desktop images instead.
- Cloud browser sessions sometimes disappear during additional tests; do not claim perfect browser resilience.

## UI / backend separation
- UI only emits window event smai:v2-interaction (not persisted analytics).
- A/B/C selector is manual; NO live traffic splitting, significance calculation, or qualified lead attribution.
- Onboarding questions stay client-side until user explicitly opens email draft, no CRM/network write.
- Eden HeyGen interactive video, Twilio number provisioning/call routing and backend contact delivery are UNVERIFIED.
- Protected production launch, DNS, auth/secrets, X1/Railway workers and payments were not touched.
- CTA links point to /v2/eden or existing public marketing anchors, never into protected backend operator controls.

## Remaining acceptance gates
1. Operator visually reviews the three previews and chooses test variants.
2. Independent accessibility, detailed screenshot diff and cross-device functional QA.
3. Real HeyGen LiveAvatar and telephony handled by separate Website Launch Engine agent.
4. Consent-respecting A/B assignment and conversion attribution bound to verified backend.
5. Production publication/merge only with separate scoped operator approval.
