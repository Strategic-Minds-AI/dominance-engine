import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { gatewayPost } from "../../shared/vercelGateway.ts";

/**
 * AI LLM via Vercel AI Gateway (replaces base44 Core InvokeLLM).
 * Bills to VERCEL_AI_GATEWAY (Vercel account), not Base44 credits.
 *
 * Body: { prompt, system?, model?, temperature?, max_tokens?, response_json_schema?, messages? }
 * Defaults to openai/gpt-6-astra. Pass `messages` to override prompt/system.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const {
      prompt, system, model, temperature, max_tokens,
      response_json_schema, messages,
    } = await req.json();

    if (!prompt && !messages) {
      return Response.json({ error: "prompt or messages is required" }, { status: 400 });
    }

    const msgs = messages || [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ];

    const body = {
      model: model || "openai/gpt-6-astra",
      messages: msgs,
      ...(temperature != null ? { temperature } : {}),
      ...(max_tokens != null ? { max_tokens } : {}),
      ...(response_json_schema
        ? { response_format: { type: "json_schema", json_schema: { name: "result", schema: response_json_schema } } }
        : {}),
    };

    const data = await gatewayPost("/chat/completions", body, 180000);
    const content = data?.choices?.[0]?.message?.content;

    let parsed = content;
    if (response_json_schema && typeof content === "string") {
      try { parsed = JSON.parse(content); } catch {}
    }

    return Response.json({
      content: parsed,
      raw: content,
      model: data?.model,
      usage: data?.usage,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}