/**
 * Returns leads for a specific launched site — used by the client portal CRM.
 * Accessible by any authenticated user. Runs as service role to bypass
 * the admin-only Lead RLS, returning only leads for the requested site.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { site_slug, launched_site_id } = body;

    if (!site_slug && !launched_site_id)
      return Response.json({ error: "site_slug or launched_site_id is required" }, { status: 400 });

    // Filter by launched_site_id if provided, otherwise by variant (site slug)
    const query = {};
    if (launched_site_id) query.launched_site_id = launched_site_id;
    else query.variant = site_slug;

    const page = await base44.asServiceRole.entities.Lead.filter(
      query,
      { sort: "-created_date", limit: 200 }
    );
    return Response.json({ leads: page.items || page || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}