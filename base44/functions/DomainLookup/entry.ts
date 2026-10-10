import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';
import { checkSingleDomain, generateAlternatives } from '../../shared/domainCheck.ts';

// DomainLookup — single-domain availability check for the Website Factory.
// Uses free Google DNS-over-HTTPS (no API key needed), with optional
// Vercel/GoDaddy price enrichment when tokens are configured.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch {}
    if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const domain = body.domain;
    if (!domain) return Response.json({ error: 'Domain is required' }, { status: 400 });

    const vercelToken = secrets.get('VERCEL_API_TOKEN');
    const teamId = secrets.get('VERCEL_TEAM_ID');
    const godaddyKey = secrets.get('GODADDY_API_KEY');
    const godaddySecret = secrets.get('GODADDY_SECRET_KEY');

    const result = await checkSingleDomain(domain, vercelToken, teamId, godaddyKey, godaddySecret);

    const response: any = {
      domain,
      available: result.available,
      price: result.price,
      source: result.source,
    };
    if (!result.available) {
      response.alternatives = generateAlternatives(domain);
    }
    return Response.json(response);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}