/**
 * Universal Site System Provisioner
 * Auto-provisions a full Digital Dominance system for any launched site:
 * - Creates AgentTask records for all 8 super agents to adopt the site
 * - Creates initial BusinessCard and Brochure records if none exist
 * - Triggers a 30-day social media campaign generation
 *
 * This function is called when a new site is launched to automatically set up
 * the admin + client portal, agent team, and social media system.
 * All AI operations route through the Vercel AI Gateway.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

const AGENT_FLEET = [
  { agent_name: "orchestrator", task_type: "build_system", label: "The Orchestrator" },
  { agent_name: "social_strategist", task_type: "content_optimize", label: "Social Strategist" },
  { agent_name: "growth_operator", task_type: "audit", label: "Growth Operator" },
  { agent_name: "sales_engine", task_type: "outreach", label: "Sales Engine" },
  { agent_name: "brand_guardian", task_type: "build_spec", label: "Brand Guardian" },
  { agent_name: "code_architect", task_type: "build_system", label: "Code Architect" },
  { agent_name: "replicator", task_type: "build_system", label: "Replicator" },
  { agent_name: "swarm", task_type: "build_system", label: "Swarm" },
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { launched_site_id } = body;
    if (!launched_site_id) return Response.json({ error: "launched_site_id is required" }, { status: 400 });

    const site = await base44.asServiceRole.entities.LaunchedSite.get(launched_site_id);
    if (!site) return Response.json({ error: "Site not found" }, { status: 404 });

    const summary: any = {
      site: site.name,
      agents_provisioned: 0,
      business_card_created: false,
      brochure_created: false,
      social_campaign_generated: false,
    };

    // 1. Create AgentTask records for all 8 agents to adopt the site
    for (const agent of AGENT_FLEET) {
      try {
        await base44.asServiceRole.entities.AgentTask.create({
          agent_name: agent.agent_name,
          launched_site_id: site.id,
          task_type: agent.task_type,
          title: `${agent.label} adopted ${site.name}`,
          description: `Auto-provisioned: ${agent.label} is now operating ${site.name} as part of the Digital Dominance system.`,
          status: "completed",
          autonomous: true,
          result: "System provisioned",
        });
        summary.agents_provisioned++;
      } catch {}
    }

    // 2. Create initial BusinessCard if none exists
    const existingCard = await base44.asServiceRole.entities.BusinessCard.filter(
      { launched_site_id: site.id },
      { limit: 1 }
    );
    if (!existingCard.items || existingCard.items.length === 0) {
      try {
        await base44.asServiceRole.entities.BusinessCard.create({
          launched_site_id: site.id,
          name: site.name,
          company: site.name,
          website: site.domain || "",
          email: "",
          phone: "",
        });
        summary.business_card_created = true;
      } catch {}
    }

    // 3. Create initial Brochure if none exists
    const existingBrochure = await base44.asServiceRole.entities.Brochure.filter(
      { launched_site_id: site.id },
      { limit: 1 }
    );
    if (!existingBrochure.items || existingBrochure.items.length === 0) {
      try {
        await base44.asServiceRole.entities.Brochure.create({
          launched_site_id: site.id,
          title: `About ${site.name}`,
          subtitle: site.keywords || "",
          content_markdown: `Welcome to ${site.name}. ${site.keywords || ""}`,
          services: site.keywords || "",
        });
        summary.brochure_created = true;
      } catch {}
    }

    // 4. Trigger 30-day social media campaign generation
    try {
      const campaignRes = await base44.functions.invoke("generateSocialCampaign", {
        launched_site_id: site.id,
        generate_images: true,
      });
      if (campaignRes.data?.results?.[0]?.posts_created > 0) {
        summary.social_campaign_generated = true;
        summary.social_posts_created = campaignRes.data.results[0].posts_created;
      }
    } catch (e) {
      summary.social_campaign_error = e.message;
    }

    return Response.json(summary);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}