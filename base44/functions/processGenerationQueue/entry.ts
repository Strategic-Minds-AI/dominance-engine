import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { buildGenerationPrompt, callAIGateway, checkCompliance, rulesToText } from '../../shared/pageGeneration.ts';

const BATCH_SIZE = 5;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(body.batch_size || BATCH_SIZE, 10);

    const apiKey = secrets.get('VERCEL_AI_GATEWAY_API_KEY');
    if (!apiKey) return Response.json({ error: 'VERCEL_AI_GATEWAY_API_KEY not set' }, { status: 500 });

    const entities = base44.asServiceRole.entities;

    // 1. Load active rules once
    const rulesPage = await entities.ProgrammaticRule.filter({ active: true }, { limit: 100 });
    const rules = rulesPage.items || [];
    const rulesText = rulesToText(rules);

    // 2. Find running campaigns and expand their queues if needed
    const campaignsPage = await entities.LaunchCampaign.filter({ status: 'running' }, { limit: 50 });
    const runningCampaigns = campaignsPage.items || [];

    for (const campaign of runningCampaigns) {
      try {
        const config = JSON.parse(campaign.config || '{}');
        if (config.creation_cursor < campaign.total_pages) {
          const { locations, services, website_ids, creation_cursor } = config;
          const remaining = campaign.total_pages - creation_cursor;
          const toCreate = Math.min(remaining, 500);
          const batch: any[] = [];

          for (let i = 0; i < toCreate; i++) {
            const flatIdx = creation_cursor + i;
            const wIdx = Math.floor(flatIdx / (locations.length * services.length));
            const restAfterW = flatIdx % (locations.length * services.length);
            const lIdx = Math.floor(restAfterW / services.length);
            const sIdx = restAfterW % services.length;
            if (wIdx >= website_ids.length) break;

            batch.push({
              campaign_id: campaign.id, website_id: website_ids[wIdx],
              location: locations[lIdx], service: services[sIdx],
              url_slug: `${locations[lIdx].toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${services[sIdx].toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              composite_key: `${website_ids[wIdx]}::${locations[lIdx]}::${services[sIdx]}`,
              status: 'generating', compliance_score: 0,
            });
          }

          if (batch.length > 0) {
            try { await entities.GeneratedPage.bulkCreate(batch); }
            catch { await entities.GeneratedPage.upsert(batch, { key: 'composite_key' }); }
            const newCursor = creation_cursor + batch.length;
            const newConfig = JSON.stringify({ ...config, creation_cursor: newCursor });
            await entities.LaunchCampaign.update(campaign.id, { config: newConfig });
          }
        }
      } catch (e) { console.error(`Campaign expansion failed for ${campaign.id}:`, e.message); }
    }

    // 3. Find generating pages and process them
    const generatingPage = await entities.GeneratedPage.filter({ status: 'generating' }, { limit: batchSize, fields: ['id', 'campaign_id', 'website_id', 'location', 'service'] });
    const pages = generatingPage.items || [];

    if (pages.length === 0) {
      for (const campaign of runningCampaigns) {
        const readyCount = await entities.GeneratedPage.count({ campaign_id: campaign.id, status: { $in: ['ready', 'published'] } });
        const failedCount = await entities.GeneratedPage.count({ campaign_id: campaign.id, status: 'failed' });
        if (readyCount + failedCount >= campaign.total_pages) {
          await entities.LaunchCampaign.update(campaign.id, { status: 'completed', completed_at: new Date().toISOString(), pages_generated: readyCount });
        }
      }
      return Response.json({ pages_processed: 0, remaining: 0, message: 'Queue empty' });
    }

    // 4. Load website templates
    const websiteIds = [...new Set(pages.map((p: any) => p.website_id))];
    const websites: Record<string, any> = {};
    for (const wid of websiteIds) {
      try { websites[wid] = await entities.Website.get(wid); } catch { websites[wid] = null; }
    }

    // 5. Generate content for each page in parallel (up to 6 at a time)
    const chunks: any[][] = [];
    for (let i = 0; i < pages.length; i += 6) { chunks.push(pages.slice(i, i + 6)); }

    let processed = 0;
    let failed = 0;

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map(async (page: any) => {
          const website = websites[page.website_id];
          if (!website) throw new Error('Website template not found');
          const prompt = buildGenerationPrompt(website, page.location, page.service, rulesText);
          const htmlContent = await callAIGateway(prompt, apiKey);
          if (!htmlContent) throw new Error('Empty AI response');
          const compliance = await checkCompliance(htmlContent, rulesText, apiKey);
          await entities.GeneratedPage.update(page.id, {
            html_content: htmlContent, compliance_score: compliance.score, compliance_notes: compliance.notes, status: 'ready',
          });
          return page.id;
        })
      );

      for (let idx = 0; idx < results.length; idx++) {
        if (results[idx].status === 'fulfilled') processed++;
        else {
          failed++;
          if (chunk[idx]) { try { await entities.GeneratedPage.update(chunk[idx].id, { status: 'failed' }); } catch {} }
        }
      }
    }

    // 6. Update campaign progress counts
    for (const campaign of runningCampaigns) {
      const readyCount = await entities.GeneratedPage.count({ campaign_id: campaign.id, status: { $in: ['ready', 'published'] } });
      const generatingCount = await entities.GeneratedPage.count({ campaign_id: campaign.id, status: 'generating' });
      const failedCount = await entities.GeneratedPage.count({ campaign_id: campaign.id, status: 'failed' });
      await entities.LaunchCampaign.update(campaign.id, {
        pages_generated: readyCount,
        status: generatingCount > 0 ? 'running' : (readyCount + failedCount >= campaign.total_pages ? 'completed' : 'running'),
        completed_at: generatingCount === 0 && readyCount + failedCount >= campaign.total_pages ? new Date().toISOString() : undefined,
      });
    }

    const remaining = await entities.GeneratedPage.count({ status: 'generating' });
    return Response.json({ pages_processed: processed, pages_failed: failed, remaining, campaigns_active: runningCampaigns.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}