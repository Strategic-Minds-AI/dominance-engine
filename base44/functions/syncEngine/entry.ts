/**
 * Universal Sync Engine — the 24/7 persistent sync system.
 * Powered by GPT through the Vercel AI Gateway (VERCEL_AI_GATEWAY secret).
 *
 * Processes SyncJob records from the queue. Each job describes what to
 * install/sync in natural language. GPT analyzes the request, produces an
 * action plan, and the engine executes it — creating pages, social posts,
 * agent tasks, logos, brochures, or any other asset.
 *
 * Triggered by:
 *   1. The scheduled workflow (every hour, 24/7)
 *   2. Manual "Run sync now" from the dashboard
 *   3. An external worker calling with WORKER_SECRET
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { secrets } from "base44:runtime";
import { gatewayPost } from "../../shared/vercelGateway.ts";
import { withRetry } from "../../shared/resilience.ts";

const SITE_URL = "https://scale-dominance.base44.app";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Auth: worker mode (external cron/worker) or admin mode (dashboard)
    const expectedSecret = secrets.get("WORKER_SECRET");
    const isWorker = !!(body?.worker_secret && expectedSecret && body.worker_secret === expectedSecret);
    if (!isWorker) {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Recover stuck jobs from previous runs
    await recoverStuckJobs(base44);

    // Pick up pending jobs (or a specific job if job_id is provided)
    let jobs = [];
    if (body.job_id) {
      const job = await base44.asServiceRole.entities.SyncJob.get(body.job_id);
      if (job) jobs = [job];
    } else {
      const now = new Date().toISOString();
      const res = await base44.asServiceRole.entities.SyncJob.filter(
        {
          status: "pending",
          $or: [
            { next_sync_at: { $exists: false } },
            { next_sync_at: { $lte: now } },
          ],
        },
        { sort: "-priority", limit: 10 }
      );
      jobs = res.items || [];
    }

    if (jobs.length === 0) {
      return Response.json({ processed: 0, message: "No pending sync jobs. Queue is clear." });
    }

    const results = [];

    for (const job of jobs) {
      try {
        await base44.asServiceRole.entities.SyncJob.update(job.id, {
          status: "syncing",
          result: "Sync started — GPT is analyzing the request…",
        });

        const plan = await generateActionPlan(job);

        let executed = 0;
        const actionLog = [];

        for (const action of plan.actions || []) {
          try {
            const count = await executeAction(base44, action, job);
            executed += count;
            actionLog.push(`${action.type}: ${count} created`);
          } catch (e) {
            actionLog.push(`${action.type}: failed — ${String(e.message).slice(0, 200)}`);
          }
        }

        const nextSync = computeNextSync(job.schedule);

        await base44.asServiceRole.entities.SyncJob.update(job.id, {
          status: nextSync ? "pending" : "completed",
          result: `${plan.summary || "Sync complete"} — ${executed} actions executed. ${actionLog.join("; ")}`.slice(0, 2000),
          last_synced_at: new Date().toISOString(),
          next_sync_at: nextSync,
          actions_count: executed,
        });

        results.push({
          job_id: job.id,
          title: job.title,
          status: nextSync ? "recurring" : "completed",
          actions: executed,
        });
      } catch (e) {
        await base44.asServiceRole.entities.SyncJob.update(job.id, {
          status: "failed",
          result: `Sync failed: ${String(e.message).slice(0, 1000)}`,
          last_synced_at: new Date().toISOString(),
        }).catch(() => {});
        results.push({ job_id: job.id, title: job.title, status: "failed", error: e.message });
      }
    }

    return Response.json({
      processed: results.length,
      results,
      engine: "universal-sync-v1",
      powered_by: "GPT via Vercel AI Gateway",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── GPT generates an action plan from the job description ──
async function generateActionPlan(job) {
  const typeInstructions = {
    website: "Generate a VISUAL WEB PACK mockup: {type:'create_pack', data:{name, kind:'web_pack', description, preview_html, brand_tokens}}. The preview_html MUST be a complete, self-contained HTML document with inline CSS that renders a full professional landing page.",
    app: "Generate a VISUAL APP PACK mockup: {type:'create_pack', data:{name, kind:'mockup', description, preview_html}}.",
    system: "Generate a VISUAL SYSTEM PACK mockup: {type:'create_pack', data:{name, kind:'mockup', description, preview_html}}.",
    logo: "Generate a VISUAL LOGO PACK mockup: {type:'create_pack', data:{name, kind:'logo_pack', description, preview_html}}. ALSO generate a real logo image: {type:'generate_logo', data:{prompt:'<detailed prompt>'}}.",
    agents: "Generate agent task definitions: for each task, provide {type:'create_task', data:{agent_name, title, description, task_type, priority, autonomous}}.",
    content: "Generate brochure/business card content: {type:'update_brochure', data:{...}} and/or {type:'update_card', data:{...}}.",
    social: "Generate social media posts: for each post, provide {type:'create_social', data:{platform, content, hashtags, image_url:''}}.",
    seo: "Generate a VISUAL WEB PACK plus SEO pages: first {type:'create_pack', data:{...}}, then for each page {type:'create_page', data:{title, slug, meta_description, h1, practice_area, content_markdown}}.",
    custom: "Analyze the description and produce VISUAL MOCKUPS as create_pack actions, plus any create_page, create_social, create_task, update_brochure, update_card, or generate_logo actions needed.",
  };

  const prompt = `You are the Universal Sync Engine, powered by a GPT business account. Analyze this sync request and produce a JSON action plan.

JOB:
- Title: ${job.title}
- Type: ${job.job_type}
- Description: ${job.description}
- Source URL: ${job.source_url || "none"}
- Target site: ${job.target_site_id || "create new"}

INSTRUCTIONS FOR TYPE "${job.job_type}":
${typeInstructions[job.job_type] || typeInstructions.custom}

CRITICAL RULES FOR preview_html:
- It MUST be a COMPLETE HTML document with inline CSS in <style> tags.
- ALL images must use CSS or data URIs — no external image URLs.
- The mockup must render IDENTICALLY to a real website/app/logo.
- Include real content — not lorem ipsum.
- The HTML must be 2000-8000 characters of production-quality markup.

OTHER RULES:
- Return ONLY a valid JSON object, no markdown code fences.
- Produce 1-5 actions (visual mockups are large — keep it focused).
- All content must be ready to use — not placeholders.
- For pages, content_markdown should be 200-500 words of helpful, unique content.

Return format:
{
  "summary": "One line describing what was generated",
  "actions": [
    { "type": "create_pack|create_page|create_social|create_task|update_brochure|update_card|generate_logo|create_spec", "data": { ... } }
  ]
}`;

  const data = await withRetry(() =>
    gatewayPost("/chat/completions", {
      model: job.gpt_model || "openai/gpt-4o",
      messages: [
        { role: "system", content: "You are the Universal Sync Engine. You return only valid JSON action plans with complete HTML mockups. Never include markdown code fences around the JSON." },
        { role: "user", content: prompt },
      ],
      max_tokens: 8192,
      temperature: 0.7,
      response_format: { type: "json_object" },
    }, 120000)
  , { retries: 2 });

  const content = data?.choices?.[0]?.message?.content || "{}";
  let plan;
  try {
    const clean = content.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
    plan = JSON.parse(clean);
  } catch {
    plan = { summary: "GPT returned a non-JSON response.", actions: [], raw: content.slice(0, 2000) };
  }
  return plan;
}

// ── Execute a single action from the plan ──
async function executeAction(base44, action, job) {
  const siteId = job.target_site_id || "";

  switch (action.type) {
    case "create_page": {
      const data = {
        ...action.data,
        launched_site_id: siteId || undefined,
        route_path: action.data.slug ? `/${action.data.slug}` : `/${slugify(action.data.title || "page")}`,
        slug: action.data.slug || slugify(action.data.title || "page"),
        status: "published",
      };
      await base44.asServiceRole.entities.GeneratedPage.create(data);
      return 1;
    }

    case "create_social": {
      await base44.asServiceRole.entities.SocialPost.create({
        ...action.data,
        launched_site_id: siteId || undefined,
        status: "draft",
        ai_generated: true,
      });
      return 1;
    }

    case "create_task": {
      await base44.asServiceRole.entities.AgentTask.create({
        ...action.data,
        launched_site_id: siteId || undefined,
        status: "pending",
      });
      return 1;
    }

    case "update_brochure": {
      if (!siteId) return 0;
      const existing = await base44.asServiceRole.entities.Brochure.filter({ launched_site_id: siteId }, { limit: 1 });
      const brochures = existing.items || [];
      if (brochures.length > 0) {
        await base44.asServiceRole.entities.Brochure.update(brochures[0].id, action.data);
      } else {
        await base44.asServiceRole.entities.Brochure.create({ ...action.data, launched_site_id: siteId });
      }
      return 1;
    }

    case "update_card": {
      if (!siteId) return 0;
      const existing = await base44.asServiceRole.entities.BusinessCard.filter({ launched_site_id: siteId }, { limit: 1 });
      const cards = existing.items || [];
      if (cards.length > 0) {
        await base44.asServiceRole.entities.BusinessCard.update(cards[0].id, action.data);
      } else {
        await base44.asServiceRole.entities.BusinessCard.create({ ...action.data, launched_site_id: siteId });
      }
      return 1;
    }

    case "generate_logo": {
      const imgData = await withRetry(() =>
        gatewayPost("/images/generations", {
          model: "openai/dall-e-3",
          prompt: action.data.prompt || "Professional minimalist logo, clean modern design",
          n: 1,
          size: "1024x1024",
        }, 60000)
      , { retries: 1 });
      const imageUrl = imgData?.data?.[0]?.url || "";
      if (imageUrl && siteId) {
        const existing = await base44.asServiceRole.entities.BusinessCard.filter({ launched_site_id: siteId }, { limit: 1 });
        const cards = existing.items || [];
        if (cards.length > 0) {
          await base44.asServiceRole.entities.BusinessCard.update(cards[0].id, { photo_url: imageUrl });
        }
      }
      return imageUrl ? 1 : 0;
    }

    case "create_pack": {
      const packData = {
        name: action.data.name || job.title || "Generated Pack",
        kind: action.data.kind || "web_pack",
        description: action.data.description || `Generated by Universal Sync Engine for: ${job.title}`,
        preview_html: action.data.preview_html || "",
        brand_tokens: action.data.brand_tokens || JSON.stringify({
          colors: { primary: "#1a2e4a", paper: "#f7f5f0", crimson: "#c8302e", gold: "#d4a943" },
          fonts: { heading: "Spectral", body: "Inter" },
        }),
        manifest: action.data.manifest || JSON.stringify({ source: "sync_engine", job_id: job.id, generated_at: new Date().toISOString() }),
        status: "pending_review",
        source: "gpt_sync",
        submitted_by_label: "Universal Sync Engine",
        version: "1.0.0",
      };
      await base44.asServiceRole.entities.TemplatePack.create(packData);
      return 1;
    }

    case "create_spec": {
      await base44.asServiceRole.entities.AgentTask.create({
        agent_name: "code_architect",
        launched_site_id: siteId || undefined,
        task_type: "build_spec",
        title: action.data.title || "New system build",
        description: JSON.stringify(action.data).slice(0, 5000),
        status: "pending",
        priority: "high",
        autonomous: false,
      });
      return 1;
    }

    default:
      return 0;
  }
}

// ── Compute next sync time for recurring jobs ──
function computeNextSync(schedule) {
  if (!schedule || schedule === "once") return null;
  const now = Date.now();
  const offsets = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    continuous: 60 * 1000,
  };
  const offset = offsets[schedule] || offsets.hourly;
  return new Date(now + offset).toISOString();
}

// ── Recover jobs stuck in "syncing" ──
async function recoverStuckJobs(base44) {
  try {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const stuck = await base44.asServiceRole.entities.SyncJob.filter(
      { status: "syncing", last_synced_at: { $lt: cutoff } },
      { limit: 10 }
    );
    for (const j of (stuck.items || [])) {
      try {
        await base44.asServiceRole.entities.SyncJob.update(j.id, {
          status: "pending",
          result: "Recovered from stuck state.",
        });
      } catch {}
    }
  } catch {}
}

function slugify(text) {
  return String(text || "page")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}