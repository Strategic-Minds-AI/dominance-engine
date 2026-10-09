import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// Generates a complete, self-contained HTML landing page for a niche.
import { gatewayLLM } from "../../shared/vercelGateway.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { niche, url_pattern, strategic_url_id, page_type = 'landing' } = body;

    if (!niche) return Response.json({ error: 'niche is required' }, { status: 400 });

    const result = await gatewayLLM({
      model: 'gemini_3_1_pro', add_context_from_internet: true,
      prompt: `Generate a complete, production-ready HTML landing page for a ${niche} business.

CRITICAL REQUIREMENTS:
- Return ONLY raw HTML — no markdown, no code fences, no explanations
- Start with <!DOCTYPE html> and end with </html>
- ALL CSS must be inline in a single <style> tag in the <head>
- NO external JavaScript dependencies — vanilla JS only if needed
- Mobile-responsive design
- Professional color scheme appropriate for ${niche}

SECTIONS: Sticky header with nav + CTA, Hero with H1 + subheadline + CTA, Services (3-4 cards), Why Choose Us (3-4 benefits), Testimonials (3 reviews), FAQ (5 Q&As with <details>), Contact form, Footer.

SEO: Proper <title>, meta description, LocalBusiness JSON-LD, FAQPage JSON-LD, BreadcrumbList JSON-LD, Open Graph tags.

Return ONLY the HTML. No markdown code fences. No commentary.`
    });

    let html = typeof result === 'string' ? result : (result.html || result.content || result.response || '');
    if (typeof html === 'object') html = JSON.stringify(html);
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    if (!html.toLowerCase().startsWith('<!doctype')) {
      const docStart = html.toLowerCase().indexOf('<html');
      if (docStart > 0) html = '<!DOCTYPE html>\n' + html.substring(docStart);
    }

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : `${niche} - Professional Services`;
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    const metaDescription = descMatch ? descMatch[1] : '';

    const slug = niche.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

    const page = await base44.asServiceRole.entities.GeneratedPage.create({
      slug,
      title: pageTitle,
      page_type: page_type === 'landing' ? 'home' : page_type,
      content_markdown: html,
      meta_description: metaDescription,
      status: 'generated'
    });

    await base44.asServiceRole.entities.Receipt.create({
      summary: `Generated ${page_type} landing page for ${niche}`,
      source: 'GenerateLandingPage', occurred_at: new Date().toISOString(), proof_level: 1
    });

    return Response.json({ status: 'success', page_id: page.id, page_title: pageTitle, html_length: html.length });
  } catch (error) {
    console.error('GenerateLandingPage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}