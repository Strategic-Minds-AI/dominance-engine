import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { makeSlug, makeCompositeKey } from '../../shared/pageGeneration.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { name, locations_text, services_text, website_ids } = body;

    if (!name || !locations_text || !services_text || !website_ids || !website_ids.length) {
      return Response.json({ error: 'name, locations_text, services_text, and website_ids are required' }, { status: 400 });
    }

    const locations = String(locations_text).split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    const services = String(services_text).split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

    if (!locations.length || !services.length) {
      return Response.json({ error: 'At least one location and one service are required' }, { status: 400 });
    }

    const total_pages = locations.length * services.length * website_ids.length;
    const config = JSON.stringify({ locations, services, website_ids, creation_cursor: 0 });

    const campaign = await base44.entities.LaunchCampaign.create({
      name, status: 'running', total_pages, pages_generated: 0, started_at: new Date().toISOString(), config,
    });

    const allRecords: any[] = [];
    for (const wid of website_ids) {
      for (const loc of locations) {
        for (const svc of services) {
          allRecords.push({
            campaign_id: campaign.id, website_id: wid, location: loc, service: svc,
            url_slug: makeSlug(loc, svc), composite_key: makeCompositeKey(wid, loc, svc),
            status: 'generating', compliance_score: 0,
          });
        }
      }
    }

    let created = 0;
    for (let i = 0; i < allRecords.length; i += 500) {
      const batch = allRecords.slice(i, i + 500);
      try { await base44.entities.GeneratedPage.bulkCreate(batch); created += batch.length; }
      catch (e) { try { await base44.entities.GeneratedPage.upsert(batch, { key: 'composite_key' }); created += batch.length; } catch (e2) { console.error(`Batch insert failed at offset ${i}:`, e2.message); } }
    }

    const updatedConfig = JSON.stringify({ locations, services, website_ids, creation_cursor: allRecords.length });
    await base44.entities.LaunchCampaign.update(campaign.id, { config: updatedConfig });

    return Response.json({ campaign_id: campaign.id, name, total_pages, pages_queued: created, status: 'running' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}