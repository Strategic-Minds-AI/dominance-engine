/**
 * Chat Edit — AI-powered visual editor backend.
 * Takes a user command + current HTML, returns either an edit (new HTML) or a chat response.
 * All AI calls route through the Vercel AI Gateway (VERCEL_AI_GATEWAY secret).
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { gatewayPost } from "../../shared/vercelGateway.ts";

const SYSTEM_PROMPT = `You are an expert web designer AI assistant that can edit a live HTML visual preview the user sees on the right side of their screen.

When the user asks you to create, build, modify, redesign, or edit the design/website/page:
- Return JSON: {"action":"edit","html":"the complete updated HTML document","message":"a brief friendly description of what you changed"}

When the user is chatting, asking questions, discussing ideas, or NOT requesting design changes:
- Return JSON: {"action":"chat","message":"your natural conversational response"}

Rules for editing:
- Always return the COMPLETE HTML document (full <!DOCTYPE html>...</html>), not just the changed parts.
- Preserve all existing content the user didn't ask to change.
- Make clean, modern, responsive designs with good typography and spacing.
- Use inline CSS or <style> tags within the HTML (no external stylesheets).
- Use high-quality stock images from Unsplash where images are needed (https://images.unsplash.com/...).
- Make designs production-quality: proper meta tags, semantic HTML, accessible forms, mobile-first responsive.

Always return ONLY valid JSON. No markdown, no code fences, no text before or after.`;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { message, current_html, history } = body;
    if (!message) return Response.json({ error: "message is required" }, { status: 400 });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      {
        role: "user",
        content: `CURRENT HTML:\n\`\`\`html\n${current_html || "(empty — create from scratch)"}\n\`\`\`\n\nUSER COMMAND: ${message}`,
      },
    ];

    const data = await gatewayPost("/chat/completions", {
      model: "openai/gpt-6-astra",
      messages,
      temperature: 0.7,
      max_tokens: 8000,
    }, 120000);

    const rawContent = data?.choices?.[0]?.message?.content || "";
    if (!rawContent) return Response.json({ error: "AI returned an empty response" }, { status: 502 });

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {}

    if (parsed?.action === "chat" && parsed.message) {
      return Response.json({ action: "chat", message: parsed.message });
    }
    if (parsed?.html) {
      return Response.json({ action: "edit", html: parsed.html, message: parsed.message || "Updated the design." });
    }

    // Fallback: if response looks like HTML, use it directly
    const trimmed = rawContent.trim().replace(/^```html\n?/, "").replace(/\n?```$/, "").trim();
    if (trimmed.startsWith("<") || trimmed.startsWith("<!DOCTYPE")) {
      return Response.json({ action: "edit", html: trimmed, message: "Updated the design." });
    }

    // Fallback: treat as plain chat
    return Response.json({ action: "chat", message: rawContent.trim() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}