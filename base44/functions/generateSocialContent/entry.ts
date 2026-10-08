/**
 * AI Social Content Generator — universal, works for any industry.
 * Generates platform-optimized post content + hashtags + image prompt.
 *
 * Accessible by any authenticated user (clients use this from the portal).
 * AI calls route through the Vercel AI Gateway (VERCEL_AI_GATEWAY secret),
 * which bills to the user's Vercel account — NOT Base44 integration credits.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { gatewayPost } from "../../shared/vercelGateway.ts";

const PLATFORM_GUIDE = {
  twitter: "280 characters max, punchy and concise, 2-3 hashtags",
  instagram: "200-500 characters, visual and engaging, 10-15 hashtags",
  facebook: "200-500 characters, conversational and informative, 3-5 hashtags",
  linkedin: "200-500 characters, professional and thought-leadership focused, 3-5 hashtags",
  tiktok: "100-200 characters, trendy and casual, 3-5 hashtags",
  google_business: "150-300 characters, local and promotional, 2-3 hashtags",
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { topic, platform, tone, brand_name, industry, city } = body;
    if (!topic) return Response.json({ error: "topic is required" }, { status: 400 });

    const guide = PLATFORM_GUIDE[platform] || PLATFORM_GUIDE.facebook;

    const prompt = `You are a social media manager for ${brand_name || "a professional services firm"}${industry ? ` in the ${industry} industry` : ""}${city ? ` serving ${city}` : ""}.

Create a ${platform || "facebook"} post about: ${topic}

Tone: ${tone || "professional, engaging, informative"}
Length: ${guide}

Requirements:
- Write a compelling, shareable post
- Include a clear call-to-action
- Generate relevant, trending hashtags optimized for discoverability
- Create a detailed image generation prompt for the accompanying visual

Return ONLY valid JSON (no markdown, no code fences):
{
  "content": "the post text without hashtags",
  "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5",
  "image_prompt": "a detailed prompt for generating an accompanying image"
}`;

    const data = await gatewayPost("/chat/completions", {
      model: "openai/gpt-6-astra",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 1000,
    }, 60000);

    const content = data?.choices?.[0]?.message?.content;
    if (!content) return Response.json({ error: "AI generation failed" }, { status: 500 });
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return Response.json({ error: "AI returned invalid format" }, { status: 500 });

    return Response.json(JSON.parse(match[0]));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}