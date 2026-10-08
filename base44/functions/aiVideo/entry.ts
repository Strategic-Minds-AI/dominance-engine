import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { gatewayPost, gatewayGet } from "../../shared/vercelGateway.ts";

/**
 * AI video generation via Vercel AI Gateway (replaces base44 Core GenerateVideo).
 * Bills to VERCEL_AI_GATEWAY (Vercel account), not Base44 credits.
 * Long-running: create returns a job id; poll with action="retrieve".
 *
 * Body: { action: "create" | "retrieve", request?, videoId? }
 *   create  -> request: { model, prompt, seconds?, aspect_ratio?, ... }
 *   retrieve-> videoId from the create response
 * Defaults to google/veo-3.1-fast, 4s, 16:9.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { action, request, videoId } = await req.json();

    if (action === "create") {
      if (!request?.prompt) return Response.json({ error: "request.prompt is required" }, { status: 400 });
      const body = {
        model: request.model || "google/veo-3.1-fast",
        prompt: request.prompt,
        seconds: request.seconds || 4,
        aspect_ratio: request.aspect_ratio || "16:9",
        ...(request.generate_audio != null ? { generate_audio: request.generate_audio } : {}),
      };
      const data = await gatewayPost("/videos", body, 120000);
      return Response.json({ video: data });
    }

    if (action === "retrieve") {
      if (!videoId) return Response.json({ error: "videoId is required" }, { status: 400 });
      const data = await gatewayGet(`/videos/${videoId}`, 30000);
      return Response.json({ video: data });
    }

    return Response.json({ error: "action must be 'create' or 'retrieve'" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}