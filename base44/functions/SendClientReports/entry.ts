import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { writeReceipt } from '../../shared/orchestration.js';

// SendClientReports — Generates per-client weekly performance summaries and emails them.
export default async function (req: Request): Promise<Response> {
  const startTime = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const profiles = await svc.entities.OnboardingProfile.filter({ status: 'completed' }, '-completed_at', 200).catch(() => []);

    let sent = 0, failed = 0;
    const results = [];

    for (const profile of profiles) {
      try {
        const clientId = profile.client_id || profile.user_id;
        if (!clientId) continue;

        const [urlTargets, sheetRows, suggestions] = await Promise.all([
          svc.entities.UrlTarget.filter({ client_id: clientId }, '-created_date', 200).catch(() => []),
          svc.entities.AreSheetRow.filter({ client_id: clientId }, '-updated_date', 200).catch(() => []),
          svc.entities.Suggestion.filter({ client_id: clientId }, '-created_at', 50).catch(() => []),
        ]);

        const totalUrls = urlTargets.length;
        const top5 = sheetRows.filter(r => (r.avg_position || 999) <= 5).length;
        const top10 = sheetRows.filter(r => (r.avg_position || 999) <= 10).length;
        const goalMet = sheetRows.filter(r => r.status === 'goal_met').length;
        const blocked = sheetRows.filter(r => r.status === 'blocked').length;
        const weekSuggestions = suggestions.filter(s => s.created_at && s.created_at >= weekAgo);
        const implementedSuggestions = suggestions.filter(s => s.status === 'implemented');
        const convergencePct = totalUrls > 0 ? Math.round((top5 / totalUrls) * 100) : 0;

        const urlStatusList = urlTargets.slice(0, 10).map(u => {
          const row = sheetRows.find(r => r.url === u.url);
          const pos = row?.avg_position || '—';
          const state = u.url_state?.replace(/_/g, ' ') || 'new';
          return `  - ${u.url} — Position: ${pos} | Status: ${state}`;
        }).join('\n');

        const emailBody = `Hello ${profile.contact_name || profile.company_name || 'Valued Client'},

Here is your weekly SEO performance report for ${profile.company_name || 'your business'}.

WEEKLY PERFORMANCE SUMMARY
Week ending ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

RANKING PROGRESS
  - URLs Tracked: ${totalUrls}
  - URLs in Top 5: ${top5}
  - URLs on Page 1 (Top 10): ${top10}
  - Goals Met: ${goalMet}
  - Convergence Rate: ${convergencePct}%

THIS WEEK'S ACTIVITY
  - New Suggestions Generated: ${weekSuggestions.length}
  - Suggestions Implemented: ${implementedSuggestions.length}

URL STATUS (Top 10)
${urlStatusList || '  No URLs tracked yet.'}

SYSTEM HEALTH
  - Blocked URLs: ${blocked}
  - System Status: ${blocked > 0 ? 'Needs Attention' : 'All Systems Operational'}

Your autonomous SEO system is running 24/7.
— Xtreme SEO Optimizer Team`.trim();

        const toEmail = profile.contact_email;
        if (!toEmail) { failed++; continue; }

        try {
          await base44.integrations.Core.SendEmail({ to: toEmail, subject: `Weekly SEO Report — ${profile.company_name || 'Your Business'} — ${convergencePct}% to Top 5`, body: emailBody, from_name: 'Xtreme SEO Optimizer' });
          sent++;
          results.push({ client: profile.company_name, email: toEmail, status: 'sent', convergence: convergencePct });
        } catch (emailErr) {
          failed++;
          results.push({ client: profile.company_name, email: toEmail, status: 'failed', error: emailErr.message });
        }
      } catch (err) {
        failed++;
      }
    }

    await writeReceipt(svc, {
      kind: 'validation', summary: `Weekly client reports: ${sent} sent, ${failed} failed`,
      detail: JSON.stringify({ sent, failed, results }, null, 2).slice(0, 8000),
      source: 'SendClientReports', provenance: 'MEASURED',
    });

    return Response.json({ ok: true, sent, failed, total: profiles.length, results });
  } catch (error) {
    return Response.json({ error: error.message, ok: false }, { status: 500 });
  }
}