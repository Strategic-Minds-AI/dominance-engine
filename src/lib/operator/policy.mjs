/**
 * Digital Dominance operator policy, pure and safe for preview planning.
 * This is NOT server authorization; trusted server validation is mandatory.
 */
export const PROTECTED_ACTIONS = new Set([
  'production_deploy', 'publish', 'domain_purchase', 'dns_change', 'secret_change',
  'payment', 'customer_message', 'social_post', 'database_migration',
  'permission_change', 'destructive_action', 'merge_protected'
]);

export function classifyAction(action) {
  if (typeof action !== 'string' || !action.trim()) return 'UNKNOWN';
  if (PROTECTED_ACTIONS.has(action)) return 'PROTECTED';
  if (['read_sources', 'research', 'draft', 'branch_build', 'preview', 'test', 'validate'].includes(action)) return 'SAFE_SCOPE';
  return 'UNKNOWN';
}

export function createMissionDraft(goal, context = {}) {
  if (typeof goal !== 'string' || !goal.trim() || goal.length > 8000) throw new Error('A goal of 1-8000 characters is required');
  const text = goal.trim();
  const kind = /websites?|landing pages?|programmatic|seo|nearme|nearyou/i.test(text) ? 'WEBSITE_FLEET' :
    /social|videos?|posts?|campaign/i.test(text) ? 'MEDIA' :
    /bugs?|refactor|code|app|software/i.test(text) ? 'ENGINEERING' : 'RESEARCH';
  return {
    version: 1, goal: text, kind, status: 'DRAFT_ONLY',
    source_sha: context.source_sha ?? null,
    steps: [
      {name:'Verify source truth and existing reusable assets',action:'read_sources'},
      {name:'Gather first-party and market evidence',action:'research'},
      {name:'Prepare SiteSpec or execution packet',action:'draft'},
      {name:'Build isolated branch or staging preview',action:'branch_build'},
      {name:'Run independent safety, functional and SEO checks',action:'validate'},
      {name:'Request narrow approval for any release, messages, secrets or spend',action:'publish',approval_required:true}
    ]
  };
}

function nonempty(value) { return typeof value === 'string' && value.trim().length > 0; }
export function checkIndexEligibility(page, validation = null) {
  const missing = [];
  const fields = ['intent','canonical_url','verified_entity_id','location_evidence_ref',
    'unique_utility_ref','fact_evidence_ref','working_conversion_ref','internal_link_plan_ref'];
  for (const field of fields) if (!nonempty(page?.[field])) missing.push(field);
  if (page?.thin_city_swap === true) missing.push('thin_city_swap');
  if (page?.misleading_schema === true) missing.push('misleading_schema');
  if (page?.duplicate_intent === true) missing.push('duplicate_intent');
  if (page?.fake_local_presence === true) missing.push('fake_local_presence');
  if (!validation || validation.status !== 'PASS' ||
      !nonempty(validation.validator_id) ||
      !nonempty(validation.evidence_hash) ||
      validation.source_sha !== page?.source_sha) missing.push('independent_validation');
  return {
    status: missing.length === 0 ? 'INDEX_ELIGIBLE_FOR_REVIEW' : 'NOINDEX_DRAFT',
    missing, publish_allowed: false,
    explanation: 'Eligibility to request publishing is not authorization to publish or a ranking guarantee.'
  };
}

export function deriveOperatorSignals({ missions, agentTasks, provisioningJobs, sourceStatus } = {}) {
  const signals = [];
  if (sourceStatus !== 'VERIFIED') signals.push({priority:'P0',label:'Reconcile source truth',status:'UNKNOWN',evidence:'No current verified source identity'});
  const groups = [
    {items:agentTasks,label:'Agent task queue',path:'/admin/super-agents'},
    {items:provisioningJobs,label:'Provisioning queue',path:'/admin/provisioning'},
    {items:missions,label:'Mission queue',path:'/admin/apex'}
  ];
  for (const group of groups) {
    if (!Array.isArray(group.items)) {
      signals.push({priority:'P1',label:group.label + ' unavailable',status:'UNKNOWN',path:group.path});
      continue;
    }
    const blocked = group.items.filter(item => ['failed','blocked','dead_letter','DEAD_LETTER','BLOCKED','FAILED'].includes(item?.status));
    if (blocked.length) signals.push({priority:'P0',label:group.label + ': ' + blocked.length + ' blocked/failed records',status:'REPAIR',path:group.path,evidence:'Read-only current connected entity records; returned sample only'});
    else signals.push({priority:'P2',label:group.label + ': no failures in returned sample',status:'SAMPLE_ONLY',path:group.path,evidence:'Read-only returned sample; does not prove fleet health'});
  }
  return signals;
}
