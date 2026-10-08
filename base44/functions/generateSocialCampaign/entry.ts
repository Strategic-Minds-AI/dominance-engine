/**
 * Automated 30-Day Social Media Campaign Generator
 * Generates a full 30-day content calendar (text + images) for any launched site
 * using the Vercel AI Gateway. Creates SocialPost records spread across 30 days.
 *
 * If launched_site_id is omitted, processes ALL live sites that need campaigns.
 * All AI calls route through the Vercel AI Gateway (VERCEL_AI_GATEWAY secret).
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { gatewayPost } from "../../shared/vercelGateway.ts";

const PLATFORMS = ["facebook", "instagram", "twitter", "linkedin", "tiktok", "google_business"];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { launched_site_id, generate_images = true } = body;

    // Determine which sites to process
    let sitesToProcess: any[] = [];
    if (launched_site_id) {
      const site = await base44.asServiceRole.entities.LaunchedSite.get(launched_site_id);
      if (!site) return Response.json({ error: "Site not found" }, { status: 404 });
      sitesToProcess = [site];
    } else {
      const { items } = await base44.asServiceRole.entities.LaunchedSite.filter(
        { status: "live" },
        { sort: "-created_date", limit: 200 }
      );
      sitesToProcess = items || [];
    }

    if (sitesToProcess.length === 0) {
      return Response.json({ message: "No sites to process", results: [] });
    }

    const results: any[] = [];

    for (const site of sitesToProcess) {
      try {
        // Check if site already has scheduled posts in the next 30 days
        const now = new Date().toISOString();
        const existing = await base44.asServiceRole.entities.SocialPost.filter(
          { launched_site_id: site.id, status: "scheduled", scheduled_at: { $gte: now } },
          { limit: 1 }
        );
        if (existing.items && existing.items.length > 0) {
          results.push({ site: site.name, skipped: true, reason: "Already has scheduled posts" });
          continue;
        }

        // Generate 30-day content calendar via Vercel AI Gateway
        const prompt = `You are a social media manager for "${site.name}".
Keywords/focus areas: ${site.keywords || "professional services"}

Generate a 30-day social media content calendar with exactly 1 post per day (30 posts total).
Rotate through platforms: ${PLATFORMS.join(", ")}.

Return ONLY a valid JSON array (no markdown, no code fences) of exactly 30 objects:
[{"day":1,"platform":"facebook","time":"09:00","topic":"...","content":"post text without hashtags","hashtags":"#tag1 #tag2 #tag3","image_prompt":"detailed image generation prompt"}]

Requirements:
- Vary content types: educational, promotional, engagement, behind-the-scenes, testimonials, tips
- Match each platform's style (Instagram=visual, LinkedIn=professional, TikTok=trendy, etc.)
- Include clear calls-to-action
- Generate specific, detailed image prompts for each post
- Vary posting times between 8am and 6pm
- Content should be relevant to: ${site.keywords || site.name}`;

        const calendarData = await gatewayPost("/chat/completions", {
          model: "openai/gpt-6-astra",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.85,
          max_tokens: 8000,
        }, 120000);

        const content = calendarData?.choices?.[0]?.message?.content;
        if (!content) throw new Error("AI returned empty response");
        const match = content.match(/\[[\s\S]*\]/);
        if (!match) throw new Error("AI returned invalid format");
        const calendarPosts = JSON.parse(match[0]);

        if (!Array.isArray(calendarPosts) || calendarPosts.length === 0) {
          throw new Error("AI returned no posts");
        }

        // Create SocialPost records
        const createdPosts: any[] = [];
        for (const post of calendarPosts.slice(0, 30)) {
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + (post.day || 1));
          const [hours, minutes] = (post.time || "09:00").split(":");
          scheduledDate.setHours(parseInt(hours) || 9, parseInt(minutes) || 0, 0, 0);

          const record = await base44.asServiceRole.entities.SocialPost.create({
            launched_site_id: site.id,
            platform: post.platform || "facebook",
            content: post.content || "",
            hashtags: post.hashtags || "",
            image_url: "",
            scheduled_at: scheduledDate.toISOString(),
            status: "scheduled",
            ai_generated: true,
          });
          createdPosts.push({ id: record.id, image_prompt: post.image_prompt || "" });
        }

        // Generate images for a subset of posts (every 5th post = 6 images)
        let imagesGenerated = 0;
        if (generate_images) {
          const postsForImages = createdPosts.filter((_, i) => i % 5 === 0);
          for (const p of postsForImages) {
            if (!p.image_prompt) continue;
            try {
              const imgData = await gatewayPost("/images/generations", {
                model: "bfl/flux-2-pro",
                prompt: p.image_prompt,
                n: 1,
                response_format: "url",
              }, 60000);
              const imageUrl = imgData?.data?.[0]?.url;
              if (imageUrl) {
                await base44.asServiceRole.entities.SocialPost.update(p.id, { image_url: imageUrl });
                imagesGenerated++;
              }
            } catch (e) {
              // Image generation failed for this post, continue
            }
          }
        }

        // Create AgentTask for social_strategist
        await base44.asServiceRole.entities.AgentTask.create({
          agent_name: "social_strategist",
          launched_site_id: site.id,
          task_type: "content_optimize",
          title: `30-day social campaign generated for ${site.name}`,
          description: `${createdPosts.length} posts scheduled across 30 days. ${imagesGenerated} images generated.`,
          status: "completed",
          autonomous: true,
          result: `${createdPosts.length} posts, ${imagesGenerated} images`,
        });

        results.push({
          site: site.name,
          posts_created: createdPosts.length,
          images_generated: imagesGenerated,
        });
      } catch (e: any) {
        results.push({ site: site.name, error: e.message });
      }
    }

    return Response.json({ results, total_sites: results.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}