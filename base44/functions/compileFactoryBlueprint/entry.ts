import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';
import { buildFactoryBlueprint } from '../../shared/factoryBlueprint.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const input = { title: typeof body.title === 'string' ? body.title.trim() : '', brief: typeof body.brief === 'string' ? body.brief.trim() : '', seed: typeof body.seed === 'string' ? body.seed.trim() : 'strategic-minds-v1', recipe: typeof body.recipe === 'string' ? body.recipe.trim() : 'Service Business Site', quality_profile: typeof body.quality_profile === 'string' ? body.quality_profile.trim() : 'Enterprise Precision' };
    const ids = body.reference_ids === undefined ? [] : body.reference_ids;
    if (!input.title || input.title.length > 120 || input.brief.length < 10 || input.brief.length > 2500 || !input.seed || input.seed.length > 80 || input.recipe.length > 120 || input.quality_profile.length > 120 || !Array.isArray(ids) || ids.length > 8 || ids.some(id => typeof id !== 'string' || !id || id.length > 100) || new Set(ids).size !== ids.length) return Response.json({ error: 'Provide a project name, a 10–2500 character brief, a bounded seed and up to eight distinct source references.' }, { status: 400 });
    const catalog = base44.entities.FactoryCatalogItem;
    const packageKeys = ['frontend', 'generator', 'master', 'operations', 'workbook', 'zero'];
    const [packages, recipePage, profilePage, generatorPage, policyPage, referencePage] = await Promise.all([
      base44.entities.FactoryPackage.filter({ package_key: { $in: packageKeys }, catalog_status: 'registered' }, { sort: 'package_key', limit: 6 }),
      catalog.filter({ package_key: 'frontend', category: 'experience_recipes', name: input.recipe }, { limit: 1 }),
      catalog.filter({ package_key: 'frontend', category: 'quality_profiles', name: input.quality_profile }, { limit: 1 }),
      catalog.filter({ package_key: 'generator', category: 'generator_types', entry_key: 'code.web-app' }, { limit: 1 }),
      catalog.filter({ package_key: 'operations', category: 'executor_policy', entry_key: 'executor-policy' }, { limit: 1 }),
      ids.length ? catalog.filter({ id: { $in: ids } }, { limit: 8 }) : Promise.resolve({ items: [] }),
    ]);
    if (new Set(packages.items.map(row => row.package_key)).size !== 6) return Response.json({ error: 'All six source packages must be registered before compilation.' }, { status: 409 });
    const recipe = recipePage.items[0], profile = profilePage.items[0], generatorType = generatorPage.items[0], policy = policyPage.items[0];
    if (!recipe || !profile || !generatorType || !policy || referencePage.items.length !== ids.length) return Response.json({ error: 'An exact source binding is missing. Choose only registered references.' }, { status: 400 });
    if (typeof recipe.definition?.canonical_flow !== 'string' || !recipe.definition.canonical_flow.trim() || !Array.isArray(policy.definition?.protected) || policy.definition.default_on_unknown !== 'BLOCK') return Response.json({ error: 'Source contracts are incomplete or the governance policy is not fail-closed.' }, { status: 409 });
    const spec = await buildFactoryBlueprint(input, packages.items, recipe, profile, generatorType, policy, referencePage.items);
    const existing = await base44.entities.GeneratorDefinition.filter({ generator_key: spec.project_id }, { limit: 1 });
    const generator = existing.items[0] || await base44.entities.GeneratorDefinition.create({ generator_key: spec.project_id, name: input.title, version: '1.0.0', generator_type: generatorType.entry_key, category: 'code', definition: spec, status: 'draft', description: 'Universal Factory draft specification. Runtime adapters and independent validation remain pending.', capabilities: spec.source_references.map(ref => ref.catalog_key) });
    return Response.json({ ok: true, generator, reused: Boolean(existing.items[0]), execution_scope: 'DRAFT_ONLY', release_ready: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}