import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { gatewayPost } from "../../shared/vercelGateway.ts";

/**
 * AI image generation via Vercel AI Gateway (replaces base44 Core GenerateImage).
 * Bills to VERCEL_AI_GATEWAY (Vercel account), not Base44 credits.
 *
 * Body: { prompt, model?, n?, size?, response_format? }
 * Defaults to bfl/flux-3-image. response_format defaults to "url".
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { prompt, model, n, size, response_format } = await req.json();
    if (!prompt) return Response.json({ error: "prompt is required" }, { status: 400 });

    const body = {
      model: model || "bfl/flux-3-image",
      prompt,
      n: n || 1,
      response_format: response_format || "url",
      ...(size ? { size } : {}),
    };

    const data = await gatewayPost("/images/generations", body, 180000);
    const images = (data?.data || []).map((d) => ({
      url: d.url,
      b64_json: d.b64_json,
    }));

    return Response.json({ images, model: data?.model, usage: data?.usage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}