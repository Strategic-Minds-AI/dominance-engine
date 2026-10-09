/**
 * Dominance System Builder — Phase 3 of the timeline.
 * Builds a full website (LaunchedSite + pages) AND a 30-day automated
 * social media campaign (posts + images + hashtags) in one call.
 *
 * AI calls route through the Vercel AI Gateway (paid, NOT Base44 credits).
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { gatewayPost } from "../../shared/vercelGateway.ts";
import { generateContentMatrix, buildPage, addInternalLinks, slugify } from "../../shared/pageGenerator.ts";

const SITEMAP_BASE = "https://scale-dominance.base44.app";
const PLATFORMS = ["facebook", "instagram", "twitter", "linkedin", "tiktok", "google_business"];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      client_id, template_pack_id, brand_name, industry, city, state,
      contact_email, contact_phone, business_stage,
    } = body;

    if (!client_id) return Response.json({ error: "client_id is required" }, { status: 400 });
    if (!city || !state) return Response.json({ error: "city and state are required" }, { status: 400 });

    const svc = base44.asServiceRole;
    const client = await svc.entities.Client.get(client_id);
    if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

    const bizName = brand_name || client.name || "Your Business";
    const bizIndustry = industry || "professional services";
    const siteSlug = slugify(bizName) || slugify(bizIndustry);
    const siteUrl = `${SITEMAP_BASE}/v/${siteSlug}`;

    // ── 1. Generate keywords for the industry ──
    const kwPrompt = `Generate 5 primary service keywords for a ${bizIndustry} business in ${city}, ${state}.
Return ONLY a JSON array of 5 keyword strings (no markdown). Example: ["Emergency Repair","Installation","Consultation","Inspection","Maintenance"]`;
    const kwData = await gatewayPost("/chat/completions", {
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: kwPrompt }],
      temperature: 0.7,
      max_tokens: 500,
    }, 30000);
    const kwContent = kwData?.choices?.[0]?.message?.content || "";
    const kwMatch = kwContent.match(/\[[\s\S]*\]/);
    const keywords = kwMatch ? JSON.parse(kwMatch[0]) : ["Professional Services", "Consultation", "Repair", "Installation", "Inspection"];

    // ── 2. Create or find Location ──
    let locPage = await svc.entities.Location.filter({ city, state_code: state }, { limit: 1 });
    let location = (locPage.items || [])[0];
    if (!location) {
      location = await svc.entities.Location.create({ city, state, state_code: state });
    }
    const locations = [location];

    // ── 3. Generate AI content matrix ──
    const matrix = await generateContentMatrix(keywords, {
      tone: "professional, authoritative, trustworthy",
      industry: bizIndustry,
      brandName: bizName,
      brandDescription: `${bizName} — ${bizIndustry} services in ${city}, ${state}`,
    });

    // ── 4. Build pages ──
    const pages = [];
    for (const keyword of keywords) {
      for (const loc of locations) {
        pages.push(buildPage(keyword, loc, matrix, {
          brandName: bizName,
          siteUrl,
          launchedSiteId: "",
        }));
      }
    }
    const pagesWithLinks = addInternalLinks(pages);

    // ── 5. Create LaunchedSite ──
    const launched = await svc.entities.LaunchedSite.create({
      client_id,
      name: bizName,
      template_pack_id: template_pack_id || "",
      slug: siteSlug,
      domain: "",
      status: "launching",
      keywords: keywords.join(", "),
      locations_count: 1,
      pages_count: pagesWithLinks.length,
      sitemap_url: "",
      proof_url: siteUrl,
      gsc_connected: false,
      analytics_connected: false,
    });

    // Attach launched_site_id to pages
    const finalPages = pagesWithLinks.map((p) => ({ ...p, launched_site_id: launched.id }));

    // Upsert pages
    let created = 0;
    for (let i = 0; i < finalPages.length; i += 400) {
      const batch = finalPages.slice(i, i + 400);
      try {
        const res = await svc.entities.GeneratedPage.upsert(batch, { key: "slug" });
        created += (res.created || 0) + (res.updated || 0);
      } catch { created += batch.length; }
    }

    // Create SiteVersion
    const version = await svc.entities.SiteVersion.create({
      name: bizName,
      slug: siteSlug,
      template_pack_id: template_pack_id || "",
      status: "live",
      is_primary: false,
      description: `Dominance timeline build: ${keywords.join(", ")} × ${city}, ${state}`,
    });

    const fullSitemapUrl = `${SITEMAP_BASE}/functions/seoSitemap?launched_site_id=${launched.id}`;
    await svc.entities.LaunchedSite.update(launched.id, {
      site_version_id: version.id,
      status: "live",
      proof_url: siteUrl,
      sitemap_url: fullSitemapUrl,
    });

    // Approve the template pack if provided
    if (template_pack_id) {
      await svc.entities.TemplatePack.update(template_pack_id, { status: "approved" }).catch(() => {});
    }

    // ── 6. Generate 30-day social media campaign ──
    const socialPrompt = `You are a social media manager for "${bizName}".
Industry: ${bizIndustry}
Location: ${city}, ${state}
Keywords: ${keywords.join(", ")}

Generate a 30-day social media content calendar with exactly 1 post per day (30 posts total).
Rotate through platforms: ${PLATFORMS.join(", ")}.

Return ONLY a valid JSON array (no markdown, no code fences) of exactly 30 objects:
[{"day":1,"platform":"facebook","time":"09:00","topic":"...","content":"post text without hashtags","hashtags":"#tag1 #tag2 #tag3","image_prompt":"detailed image generation prompt"}]

Requirements:
- Vary content types: educational, promotional, engagement, behind-the-scenes, testimonials, tips
- Match each platform's style
- Include clear calls-to-action
- Generate specific, detailed image prompts for each post
- Vary posting times between 8am and 6pm`;

    const socialData = await gatewayPost("/chat/completions", {
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: socialPrompt }],
      temperature: 0.85,
      max_tokens: 8000,
    }, 120000);

    const socialContent = socialData?.choices?.[0]?.message?.content || "";
    const socialMatch = socialContent.match(/\[[\s\S]*\]/);
    const calendarPosts = socialMatch ? JSON.parse(socialMatch[0]) : [];

    // Create SocialPost records
    const createdPosts = [];
    for (const post of calendarPosts.slice(0, 30)) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (post.day || 1));
      const [hours, minutes] = (post.time || "09:00").split(":");
      scheduledDate.setHours(parseInt(hours) || 9, parseInt(minutes) || 0, 0, 0);

      const record = await svc.entities.SocialPost.create({
        launched_site_id: launched.id,
        platform: post.platform || "facebook",
        content: post.content || "",
        hashtags: post.hashtags || "",
        image_url: "",
        scheduled_at: scheduledDate.toISOString(),
        status: "scheduled",
        ai_generated: true,
      });
      createdPosts.push({ id: record.id, image_prompt: post.image_prompt || "", platform: post.platform, content: post.content, hashtags: post.hashtags, day: post.day });
    }

    // Generate images for every 5th post (6 images)
    let imagesGenerated = 0;
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
          await svc.entities.SocialPost.update(p.id, { image_url: imageUrl });
          p.image_url = imageUrl;
          imagesGenerated++;
        }
      } catch { /* image generation failed for this post */ }
    }

    // Update client with contact info
    if (contact_email || contact_phone) {
      await svc.entities.Client.update(client_id, {
        contact_email: contact_email || client.contact_email || "",
        contact_phone: contact_phone || client.contact_phone || "",
        brand_name: bizName,
      }).catch(() => {});
    }

    return Response.json({
      ok: true,
      launched_site_id: launched.id,
      site_url: siteUrl,
      sitemap_url: fullSitemapUrl,
      pages_created: created,
      keywords,
      social_posts_created: createdPosts.length,
      social_images_generated: imagesGenerated,
      social_posts: createdPosts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}