import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { buildGenerationPrompt, callAIGateway, checkCompliance, rulesToText, makeSlug } from '../../shared/pageGeneration.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { website_id, location, service, model } = body;

    if (!website_id || !location || !service) {
      return Response.json({ error: 'website_id, location, and service are required' }, { status: 400 });
    }

    const website = await base44.entities.Website.get(website_id);
    if (!website) return Response.json({ error: 'Website not found' }, { status: 404 });

    const rulesPage = await base44.entities.ProgrammaticRule.filter({ active: true }, { limit: 100 });
    const rulesText = rulesToText(rulesPage.items || []);

    const apiKey = secrets.get('VERCEL_AI_GATEWAY_API_KEY');
    if (!apiKey) return Response.json({ error: 'VERCEL_AI_GATEWAY_API_KEY not set' }, { status: 500 });

    const prompt = buildGenerationPrompt(website, location, service, rulesText);
    const htmlContent = await callAIGateway(prompt, apiKey, model);

    if (!htmlContent) return Response.json({ error: 'AI Gateway returned empty content' }, { status: 502 });

    const compliance = await checkCompliance(htmlContent, rulesText, apiKey, model);
    const slug = makeSlug(location, service);

    const page = await base44.entities.GeneratedPage.create({
      website_id, location, service, url_slug: slug,
      html_content: htmlContent, compliance_score: compliance.score, compliance_notes: compliance.notes, status: 'ready',
    });

    return Response.json({ page_id: page.id, html_content: htmlContent, compliance_score: compliance.score, compliance_notes: compliance.notes, url_slug: slug });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}