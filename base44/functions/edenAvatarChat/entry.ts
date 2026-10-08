import { createClientFromRequest } from "npm:@base44/sdk@0.8.53";
import { gatewayPost } from "../../shared/vercelGateway.ts";

const FIELD_ORDER = [
  "first_name",
  "address",
  "phone",
  "email",
  "business_stage",
  "business",
  "vision",
  "colors",
  "special_requests",
];

const QUESTIONS: Record<string,string> = {
  first_name: "Hi, I'm Eden Skye, your AI client concierge. What should I call you?",
  address: "Nice to meet you. What address should we use for your project record?",
  phone: "What's the best phone number for you?",
  email: "And the best email address?",
  business_stage: "You look like someone building something interesting. Do you already have a business, are you starting one, or are we taking an existing business to a much bigger stage?",
  business: "Tell me the business name and what you sell or do.",
  vision: "If you could design the website with no technical limits, what would it look and feel like?",
  colors: "Any favorite colors, or colors I should absolutely avoid?",
  special_requests: "Last one. Any special requests, other than making me look good on the homepage? I'm kidding. Mostly.",
};

function rows(result:any):any[] {
  if (Array.isArray(result)) return result;
  return result?.items || [];
}

function clean(value:any, max=1000) {
  return String(value ?? "").trim().slice(0, max);
}

function safeJson(value:any, fallback:any) {
  try { return typeof value === "string" ? JSON.parse(value) : value ?? fallback; }
  catch { return fallback; }
}

function nextMissing(data:any) {
  return FIELD_ORDER.find((field) => !clean(data?.[field], field === "vision" || field === "special_requests" ? 4000 : 1000)) || null;
}

function allowedOrigin(req:Request) {
  const raw = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!raw) return true;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return host.endsWith(".base44.app") ||
      host === "base44.app" ||
      host.endsWith(".strategicmindsai.com");
  } catch {
    return false;
  }
}

function deterministicReply(data:any, firstTurn=false) {
  const field = nextMissing(data);
  if (!field) {
    return {
      reply: "Perfect. I have your Business Genome. I'm handing this to the design system now so we can prepare your ten website directions.",
      next_field: null,
      completed: true,
      extracted: {},
      mode: "deterministic",
    };
  }
  return {
    reply: firstTurn ? QUESTIONS.first_name : QUESTIONS[field],
    next_field: field,
    completed: false,
    extracted: {},
    mode: "deterministic",
  };
}

export default async function(req:Request):Promise<Response> {
  try {
    if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405 });
    if (!allowedOrigin(req)) return Response.json({ error: "Origin not allowed" }, { status: 403 });

    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const message = clean(body.message, 1200);
    const sourcePackId = clean(body.source_pack_id, 120);
    const sourceVersionSlug = clean(body.source_version_slug, 120);
    let sessionId = clean(body.session_id, 120);
    if (!sessionId) sessionId = "eden_" + crypto.randomUUID();

    const found = rows(await base44.asServiceRole.entities.EdenSession.filter({ session_id: sessionId }, { limit: 1 }));
    let session = found[0];

    const now = new Date().toISOString();
    if (!session) {
      session = await base44.asServiceRole.entities.EdenSession.create({
        session_id: sessionId,
        status: "active",
        step: 0,
        transcript: "[]",
        source_pack_id: sourcePackId,
        source_version_slug: sourceVersionSlug,
        created_at: now,
        updated_at: now,
      });
    }

    const data:any = {};
    for (const field of FIELD_ORDER) data[field] = session[field] || "";
    const transcript:any[] = safeJson(session.transcript, []);

    if (!message) {
      const first = deterministicReply(data, true);
      transcript.push({ role: "assistant", content: first.reply, at: now });
      await base44.asServiceRole.entities.EdenSession.update(session.id, {
        transcript: JSON.stringify(transcript).slice(0, 30000),
        last_reply: first.reply,
        updated_at: now,
      });
      return Response.json({
        ok: true,
        session_id: sessionId,
        ...first,
        collected: data,
      });
    }

    transcript.push({ role: "user", content: message, at: now });

    const currentField = clean(body.current_field || nextMissing(data), 80);
    if (currentField && FIELD_ORDER.includes(currentField)) {
      data[currentField] = clean(message, currentField === "vision" || currentField === "special_requests" ? 4000 : 1000);
    }

    let result:any = null;

    try {
      const llm = await gatewayPost("/chat/completions", {
        model: "openai/gpt-6-astra",
        temperature: 0.55,
        max_tokens: 420,
        messages: [
          {
            role: "system",
            content: `You are Eden Skye, Strategic Minds AI's clearly disclosed AI client concierge.

PERSONALITY:
Smart, warm, confident, witty, lightly playful, concise, professional, never explicit or sexual. You can make an occasional tasteful joke. Never pretend to be human.

GOAL:
Complete a short business onboarding conversation while making the client feel that the process is unusually easy and technologically advanced.

REQUIRED FIELDS IN ORDER:
first_name, address, phone, email, business_stage, business, vision, colors, special_requests.

RULES:
- Ask only ONE main question at a time.
- Keep spoken replies under about 55 words.
- If the current user answer clearly contains data for other fields too, extract it.
- Do not fabricate facts.
- When all fields are complete, say you have enough to prepare ten website directions.
- Do not claim SMS, email, website generation, or any external action has happened unless the system explicitly says it did.
- Always identify yourself as an AI concierge if asked what you are.

Return strict JSON:
{
 "reply":"...",
 "next_field":"field name or null",
 "completed":true|false,
 "extracted":{
   "first_name":"",
   "address":"",
   "phone":"",
   "email":"",
   "business_stage":"",
   "business":"",
   "vision":"",
   "colors":"",
   "special_requests":""
 }
}`
          },
          {
            role: "user",
            content: JSON.stringify({
              existing: data,
              current_field: currentField,
              latest_user_message: message,
              recent_transcript: transcript.slice(-8),
            })
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "eden_onboarding_turn",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                reply: { type: "string" },
                next_field: { anyOf: [{ type: "string" }, { type: "null" }] },
                completed: { type: "boolean" },
                extracted: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    first_name: { type: "string" },
                    address: { type: "string" },
                    phone: { type: "string" },
                    email: { type: "string" },
                    business_stage: { type: "string" },
                    business: { type: "string" },
                    vision: { type: "string" },
                    colors: { type: "string" },
                    special_requests: { type: "string" }
                  },
                  required: FIELD_ORDER
                }
              },
              required: ["reply","next_field","completed","extracted"]
            }
          }
        }
      }, 90000);

      const raw = llm?.choices?.[0]?.message?.content;
      result = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      result = deterministicReply(data, false);
    }

    const extracted = result?.extracted || {};
    for (const field of FIELD_ORDER) {
      const v = clean(extracted[field], field === "vision" || field === "special_requests" ? 4000 : 1000);
      if (v) data[field] = v;
    }

    const missing = nextMissing(data);
    const completed = !missing || result?.completed === true;
    const reply = clean(
      result?.reply ||
        (completed
          ? "Perfect. I have your Business Genome. I'm preparing the next design step now."
          : QUESTIONS[missing as string]),
      1200
    );

    transcript.push({ role: "assistant", content: reply, at: new Date().toISOString() });

    const update:any = {
      ...data,
      status: completed ? "completed" : "active",
      step: FIELD_ORDER.filter((field) => clean(data[field])).length,
      transcript: JSON.stringify(transcript).slice(0, 30000),
      last_reply: reply,
      updated_at: new Date().toISOString(),
    };
    await base44.asServiceRole.entities.EdenSession.update(session.id, update);

    return Response.json({
      ok: true,
      session_id: sessionId,
      reply,
      next_field: completed ? null : (FIELD_ORDER.includes(result?.next_field) ? result.next_field : missing),
      completed,
      collected: data,
      mode: result?.mode || "ai",
    });
  } catch (error:any) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
}