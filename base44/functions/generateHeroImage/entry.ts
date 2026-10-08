import { secrets } from 'base44:runtime';

// Memory note: This app uses the VERCEL AI GATEWAY (secret: VERCEL_AI_GATEWAY)
// for all AI image/text generation, bypassing Base44 integration credits.
// Base URL: https://ai-gateway.vercel.sh/v1  (OpenAI-compatible)

const GATEWAY_BASE = "https://ai-gateway.vercel.sh/v1";

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body?.prompt || "A cinematic futuristic brand hero image, dark deep-space background in navy and black, a luminous glowing Earth globe centered at the bottom, radiant cyan and electric-blue neural network lines and data streams arcing across the upper sky, subtle particle stardust, high-tech digital intelligence theme, sleek modern aesthetic, dramatic cinematic lighting, 16:9 widescreen composition, no text";

    const apiKey = secrets.get("VERCEL_AI_GATEWAY");
    if (!apiKey) return Response.json({ error: "VERCEL_AI_GATEWAY secret not set" }, { status: 500 });

    const response = await fetch(`${GATEWAY_BASE}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "bfl/flux-2-pro",
        prompt,
        n: 1,
        response_format: "b64_json",
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: `Gateway ${response.status}: ${errText}` }, { status: 502 });
    }

    const json = await response.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) return Response.json({ error: "No image data returned by gateway", raw: JSON.stringify(json).slice(0, 500) }, { status: 502 });

    const dataUri = `data:image/jpeg;base64,${b64}`;
    return Response.json({ url: dataUri, model: "bfl/flux-2-pro" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}