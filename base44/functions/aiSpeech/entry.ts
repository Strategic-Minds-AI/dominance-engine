import { createClientFromRequest } from "npm:@base44/sdk@0.8.53";
import { gatewayConfig } from "../../shared/vercelGateway.ts";

const EDEN_MODEL = "openai/tts-1-hd";
const EDEN_VOICE = "nova";
const EDEN_VOICE_INSTRUCTIONS =
  "Speak as Eden Skye, Strategic Minds AI's clearly disclosed AI client concierge. " +
  "Sound like a warm, confident, polished American woman in her early 30s. " +
  "Be conversational and emotionally present, with a subtle smile and lightly playful intelligence. " +
  "Use natural pauses and varied intonation at a calm medium pace. " +
  "Never sound like an announcer, IVR, GPS, computer narrator, or sales script. " +
  "Avoid exaggerated cheerfulness, clipped phrasing, or robotic cadence.";

function allowedEdenOrigin(req) {
  const raw = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!raw) return false;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return host.endsWith(".base44.app") ||
      host === "base44.app" ||
      host.endsWith(".strategicmindsai.com");
  } catch {
    return false;
  }
}

/**
 * AI text-to-speech via Vercel AI Gateway.
 * Authenticated admin callers may choose model/voice/instructions.
 * Public Eden onboarding callers accepted only from approved origins with an existing session.
 */
export default async function(req) {
  try {
    if (req.method !== "POST") {
      return Response.json({ error: "POST required" }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const {
      text, model, voice, instructions, response_format, speed, eden_session_id,
    } = body || {};

    let user = null;
    try {
      user = await base44.auth.me();
    } catch {}

    const isAuthenticated = !!user;
    let isEdenSession = false;

    if (!isAuthenticated && eden_session_id && allowedEdenOrigin(req)) {
      const result = await base44.asServiceRole.entities.EdenSession.filter(
        { session_id: String(eden_session_id).slice(0, 120) },
        { limit: 1 }
      );
      const items = result?.items || result || [];
      isEdenSession = !!items[0];
    }

    if (!isAuthenticated && !isEdenSession) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!text) return Response.json({ error: "text is required" }, { status: 400 });
    if (String(text).length > 4096) {
      return Response.json({ error: "text must be <= 4096 chars" }, { status: 400 });
    }

    const fmt = response_format || "mp3";
    const edenMode = !isAuthenticated && isEdenSession;
    const selectedModel = edenMode ? EDEN_MODEL : (model || EDEN_MODEL);
    const selectedVoice = edenMode ? EDEN_VOICE : (voice || EDEN_VOICE);
    const selectedInstructions = edenMode
      ? EDEN_VOICE_INSTRUCTIONS
      : (instructions || EDEN_VOICE_INSTRUCTIONS);

    const requestBody = {
      text: String(text),
      voice: selectedVoice,
      outputFormat: fmt,
      instructions: selectedInstructions,
      ...(speed != null ? { speed } : { speed: 0.98 }),
    };

    const { headers } = gatewayConfig();
    const speechRes = await fetch("https://ai-gateway.vercel.sh/v4/ai/speech-model", {
      method: "POST",
      headers: {
        ...headers,
        "ai-model-id": selectedModel,
        "ai-gateway-protocol-version": "0.0.1",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(120000),
    });

    const speechText = await speechRes.text();
    let speechData = {};
    try { speechData = speechText ? JSON.parse(speechText) : {}; } catch { speechData = { raw: speechText }; }

    if (!speechRes.ok) {
      const detail = speechData?.error?.message || speechData?.error || speechData?.raw || `HTTP ${speechRes.status}`;
      throw new Error(`Vercel AI Gateway speech error (${speechRes.status}): ${detail}`);
    }

    const audio_base64 = speechData?.audio;
    if (!audio_base64) {
      throw new Error("Vercel AI Gateway speech response did not include audio.");
    }

    const content_type = fmt === "wav" ? "audio/wav"
      : fmt === "opus" ? "audio/ogg"
      : fmt === "aac" ? "audio/aac"
      : fmt === "flac" ? "audio/flac"
      : "audio/mpeg";

    return Response.json({
      audio_base64,
      content_type,
      model: selectedModel,
      voice: selectedVoice,
      profile: "eden-natural-v3",
      warnings: speechData?.warnings || [],
    });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
}