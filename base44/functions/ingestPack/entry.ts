import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';
import { secrets } from 'base44:runtime';

const VALID_KINDS = ['web_pack', 'logo_pack', 'brand_pack', 'mockup'];

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({} as any));
    const {
      sync_token, name, kind, description, preview_html,
      manifest, brand_tokens, source, submitted_by_label,
    } = body || {};

    const base44 = createClientFromRequest(req);

    // Authenticate: either a valid GPT sync token, or a signed-in admin.
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = !!(user && user.role === 'admin');
    } catch {
      /* not signed in — fine for token-based sync */
    }

    const token = secrets.get('PACK_SYNC_TOKEN');
    const isSync = !!(sync_token && token && sync_token === token);

    if (!isSync && !isAdmin) {
      return Response.json(
        { error: 'Unauthorized — provide a valid sync_token or sign in as admin.' },
        { status: 401 }
      );
    }

    if (!name || !kind) {
      return Response.json({ error: 'name and kind are required.' }, { status: 400 });
    }
    if (!VALID_KINDS.includes(kind)) {
      return Response.json({ error: `kind must be one of: ${VALID_KINDS.join(', ')}` }, { status: 400 });
    }

    const pack = await base44.asServiceRole.entities.TemplatePack.create({
      name: String(name).slice(0, 200),
      kind,
      description: String(description || '').slice(0, 2000),
      preview_html: String(preview_html || '').slice(0, 500000),
      manifest: typeof manifest === 'string' ? manifest : JSON.stringify(manifest || {}),
      brand_tokens: typeof brand_tokens === 'string' ? brand_tokens : JSON.stringify(brand_tokens || {}),
      status: 'pending_review',
      source: source || (isSync ? 'gpt_sync' : 'manual'),
      submitted_by_label: String(submitted_by_label || (isSync ? 'GPT Sync' : 'Admin')).slice(0, 120),
      version: '1.0.0',
    });

    const approval = await base44.asServiceRole.entities.Approval.create({
      template_pack_id: pack.id,
      status: 'pending',
      requested_by_label: pack.submitted_by_label,
      request: JSON.stringify({ name, kind, description }),
    });

    return Response.json({
      ok: true,
      pack_id: pack.id,
      approval_id: approval.id,
      status: 'pending_review',
      message: 'Pack ingested and queued for approval.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}