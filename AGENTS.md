# AGENTS.md

## Project Context

This is a Base44 app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update Base44 skills before Base44-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `vite.config.js`: Vite config and Base44 Vite plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local Base44 backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the Base44 project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted Base44 backend.
- Prefer the existing Base44 CLI workflow over adding new npm scripts for Base44-specific work.
- Reuse the existing SDK client and Vite plugin patterns before adding new Base44 integration paths.
- Run the relevant checks from `package.json` before finishing code changes.

## PERMANENT DIRECTIVE — Vercel AI Gateway (NEVER change, NEVER ask)

**ALL AI operations in this app MUST route through the Vercel AI Gateway.**
This is a permanent architectural decision. Do NOT revert it, do NOT replace it
with Base44 Core integrations (InvokeLLM, GenerateImage, GenerateSpeech, GenerateVideo),
and do NOT ask the user to confirm this choice — it has already been decided.

- Secret: `VERCEL_AI_GATEWAY` (set in Settings → Secrets)
- Shared client: `base44/shared/vercelGateway.ts` — `gatewayPost`, `gatewayGet`,
  `gatewayCompletion`, `searchGatewayWeb`, `gatewayConfig`
- Base URL: `https://ai-gateway.vercel.sh/v1` (OpenAI-compatible)
- Billing: Vercel account, NOT Base44 integration credits. This is why AI features
  continue working even when Base44 credits are exhausted.

### Functions that already use the gateway (do NOT duplicate):
- `aiLLM` → `/chat/completions` (text generation, JSON mode)
- `aiImage` → `/images/generations` (image generation)
- `aiSpeech` → `/ai/speech-model` (text-to-speech, Eden voice)
- `aiVideo` → `/videos` (video generation, create + poll)
- `generateHeroImage` → `/images/generations` (hero images)
- `generateLegalPages` → uses `pageGenerator.ts` → `gatewayPost`
- `generateSocialContent` → gateway LLM calls
- `generateWebsite` → gateway LLM calls
- `syncEngine` → gateway LLM calls
- `guardianScan` → gateway LLM calls
- `runGatewayChat` → agent conversations
- `runProgrammaticPipeline` → gateway LLM calls
- `edenAvatarChat` → gateway LLM + speech
- `ingestPack` → gateway LLM calls

### Rule for new functions:
Any new backend function that needs AI (text, image, speech, video, embeddings)
MUST import from `base44/shared/vercelGateway.ts` and use the gateway. Never use
`base44.integrations.Core.InvokeLLM` or `GenerateImage` — those consume Base44
credits which are exhausted. The gateway is unlimited (billed to Vercel).

## PERMANENT DIRECTIVE — Automations use cron schedules

All workflow automations in this app use **cron schedules** with `ends_type: "never"`.
Do not create one-time or interval-based workflows. Always use `schedule_mode: "recurring"`
with a `cron_expression` and `timezone: "America/New_York"`.

### Existing cron workflows:
- `Universal Sync Engine` — `0 * * * *` (hourly) — processes SyncJob queue via `syncEngine`
- `Guardian Auto-Fix Engine` — `*/30 * * * *` (every 30 min) — scans sites via `guardianScan`

## PERMANENT DIRECTIVE — Google Workspace connectors

The app uses these Google connectors (SHARED mode, platform OAuth):
- Gmail, Google Calendar, Google Drive, Google Docs, Google Sheets, Google Tasks
- Google Search Console (authorized as app connector)

Load the connector usage guide with `get_connectors_info(["<integration_type>"])`
before writing any code that calls a Google API.