import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';
import { checkSingleDomain } from '../../shared/domainCheck.ts';

// CheckDomainAvailability — batch checks NearMeCandidate records for availability.
// Uses free Google DNS-over-HTTPS (no API key needed), with optional
// Vercel/GoDaddy price enrichment when tokens are configured.

async function batchProcess(items: any[], fn: any, concurrency = 10) {
  const results: any[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    let user = null;
    try { user = await base44.auth.me(); } catch {}
    if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const vercelToken = secrets.get('VERCEL_API_TOKEN');
    const teamId = secrets.get('VERCEL_TEAM_ID');
    const godaddyKey = secrets.get('GODADDY_API_KEY');
    const godaddySecret = secrets.get('GODADDY_SECRET_KEY');

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 100;
    const singleDomain = body.domain;

    // Single-domain mode: direct lookup
    if (singleDomain) {
      const result = await checkSingleDomain(singleDomain, vercelToken, teamId, godaddyKey, godaddySecret);
      const response: any = {
        domain: singleDomain,
        available: result.available,
        price: result.price,
        source: result.source,
      };
      return Response.json(response);
    }

    // Batch mode: process NearMeCandidate records
    const candidates = await svc.entities.NearMeCandidate.filter({ availability_status: 'unchecked' }, '-created_date', limit);
    if (!candidates.length) return Response.json({ message: 'No unchecked candidates found', checked: 0 });

    const checkOne = async (c: any) => {
      try {
        const result = await checkSingleDomain(c.domain, vercelToken, teamId, godaddyKey, godaddySecret);
        const status = !result.available ? 'unavailable' : result.price > 500 ? 'premium' : 'available';
        return { id: c.id, domain: c.domain, status, source: result.source, price: result.price };
      } catch (e: any) {
        return { id: c.id, domain: c.domain, status: 'error', source: 'none', price: 0, error: e.message };
      }
    };

    const results = await batchProcess(candidates, checkOne, 10);
    const updates = results.map((r) => ({
      id: r.id,
      availability_status: r.status,
      availability_source: r.source,
      registration_price: r.price,
      checked_at: new Date().toISOString(),
    }));
    if (updates.length) await svc.entities.NearMeCandidate.bulkUpdate(updates);

    const available = results.filter((r) => r.status === 'available').length;
    const unavailable = results.filter((r) => r.status === 'unavailable').length;
    const premium = results.filter((r) => r.status === 'premium').length;

    try {
      await svc.entities.Receipt.create({
        summary: `Domain availability check: ${results.length} checked, ${available} available, ${premium} premium, ${unavailable} unavailable`,
        source: 'CheckDomainAvailability',
        occurred_at: new Date().toISOString(),
        proof_level: 1,
      });
    } catch {}

    return Response.json({
      checked: results.length,
      available,
      unavailable,
      premium,
      errors: results.filter((r) => r.status === 'error').length,
      results: results.map((r) => ({ domain: r.domain, status: r.status, price: r.price, source: r.source })),
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}