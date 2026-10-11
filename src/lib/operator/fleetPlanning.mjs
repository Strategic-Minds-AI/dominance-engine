/**
 * North America fleet plan, v1. This is a source-neutral, no-side-effects planner.
 * It NEVER provisions or publishes. Durable jobs must be submitted only by an
 * authenticated server adapter with tenant-scoped X1 leases and approval receipts.
 */
const COUNTRY_CODES = new Set(['US','CA','MX']);
const SITE_ROLES = new Set(['ai_systems','ai_consulting','ai_services','business_automation','custom_apps']);
export function safeSlug(value) {
  return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
}
export function parseMarketLines(input,max=500) {
  if (typeof input!=='string') throw new Error('Market input must be text');
  if (input.length>30000) throw new Error('Market input too long');
  const seen=new Set(),valid=[],errors=[];
  const lines=input.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if(lines.length>max)throw new Error('Market candidate limit exceeded');
  lines.forEach((line,i)=>{
    const parts=line.split(',').map(s=>s.trim());
    if(parts.length!==3 || !parts.every(Boolean)){errors.push({line:i+1,value:line,reason:'Expected City, Region, CountryCode'});return;}
    const [city,region,rawCountry]=parts;
    const country=rawCountry.toUpperCase();
    if(!COUNTRY_CODES.has(country)){errors.push({line:i+1,value:line,reason:'Only US, CA and MX are in current North America scope'});return;}
    const slug=safeSlug(city+'-'+region+'-'+country);
    if(!slug){errors.push({line:i+1,value:line,reason:'Invalid city label'});return;}
    if(seen.has(slug))return;
    seen.add(slug);valid.push({city,region,country,slug,serviceability:'UNVERIFIED',originalLocalEvidence:[],source:'OPERATOR_CANDIDATE'});
  });
  return {markets:valid,errors,requested:lines.length,deduplicated:lines.length-valid.length-errors.length};
}
export function makeFleetDraft(input={}) {
  const {brand='Strategic Minds AI',role='ai_systems',marketText='',count=10,sourceSha='UNBOUND',serviceOffer='AI business systems'}=input;
  if(!SITE_ROLES.has(role))throw new Error('Unsupported fleet role');
  if(!Number.isInteger(count)||count<1||count>1000)throw new Error('Count must be between 1 and 1000');
  const parsed=parseMarketLines(marketText);
  const selected=parsed.markets.slice(0,count);
  return {
    schema:'digital-dominance.fleet-draft.v1',state:'DRAFT_ONLY',tenant_id:null,
    brand,role,serviceOffer,source_sha:sourceSha,created_at:new Date().toISOString(),
    requested_count:count,planned_count:selected.length,unfilled_count:Math.max(0,count-selected.length),
    validation:{status:'PENDING',index_policy:'NOINDEX',independent_validator_required:true,approval_required:true},
    blockers:['Verified business identity','Verified market serviceability','Original market-specific utility','Real conversion/lead destination','Duplicate and intent collision review','Direct route and technical SEO verification','Independent QA receipt','Production operator approval'],
    locations:selected.map((m,i)=>({
      site_candidate_id:'draft-'+safeSlug(role)+'-'+m.slug,
      sequence:i+1,market:m,
      template_family:role,
      status:'RESEARCH_REQUIRED',
      index_policy:'NOINDEX',
      deployment_allowed:false,
      publish_allowed:false,
      evidence_refs:[],
      intended_action:'BUILD_STAGING_ONLY_AFTER_EVIDENCE_REVIEW'
    })),
    invalid_locations:parsed.errors
  };
}
export function authorizeIndexReview(candidate,evidence,validation) {
  const missing=[];
  const fields=['real_business_ref','verified_service_area_ref','original_local_utility_ref','live_conversion_route_ref','canonical_target','intent_owner','source_sha'];
  for(const f of fields) if(typeof evidence?.[f]!=='string'||!evidence[f].trim())missing.push(f);
  if(!candidate?.site_candidate_id||candidate?.index_policy!=='NOINDEX')missing.push('valid_candidate');
  if(evidence?.thin_city_swap||evidence?.fake_location||evidence?.duplicate_content)missing.push('content_integrity');
  if(!validation||validation.status!=='PASS'||!validation.independent_validator_ref||!validation.proof_hash||validation.source_sha!==evidence?.source_sha)missing.push('independent_validation');
  return {status:missing.length===0?'REVIEW_READY':'NOINDEX_DRAFT',missing,publish_allowed:false};
}
