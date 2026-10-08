// Portable, dependency-free sync contracts for the Digital Dominance factory.
export const STATES = Object.freeze(['DISCOVERED','QUALIFIED','ONBOARDING','BRIEF_READY','DRAFTING','QA_PENDING','PREVIEW_READY','CLIENT_REVIEW','APPROVED','PUBLISH_QUEUED','PUBLISHED','MONITORING','PAUSED','FAILED','CANCELLED']);
export const PROTECTED_ACTIONS = Object.freeze(['production_deploy','domain_update','paid_provisioning','live_social_publish','social_comment_reply','customer_email_sms_voice','production_db_migration','secret_change','irreversible_delete']);
const NEXT = {
 DISCOVERED:['QUALIFIED','PAUSED','CANCELLED'],QUALIFIED:['ONBOARDING','PAUSED','CANCELLED'],ONBOARDING:['BRIEF_READY','PAUSED','CANCELLED'],BRIEF_READY:['DRAFTING','PAUSED','CANCELLED'],DRAFTING:['QA_PENDING','PAUSED','FAILED'],QA_PENDING:['PREVIEW_READY','DRAFTING','FAILED'],PREVIEW_READY:['CLIENT_REVIEW','DRAFTING'],CLIENT_REVIEW:['APPROVED','DRAFTING','CANCELLED'],APPROVED:['PUBLISH_QUEUED','CANCELLED'],PUBLISH_QUEUED:['PUBLISHED','FAILED','PAUSED'],PUBLISHED:['MONITORING','PAUSED'],MONITORING:['DRAFTING','PAUSED'],PAUSED:['QUALIFIED','ONBOARDING','DRAFTING','QA_PENDING','PUBLISH_QUEUED','MONITORING','CANCELLED'],FAILED:['DRAFTING','QA_PENDING','CANCELLED'],CANCELLED:[]
};
export function assertTenant(ref) {if(!ref || typeof ref!=='string' || !/^[a-zA-Z0-9_-]{8,80}$/.test(ref)) throw new Error('INVALID_TENANT');return ref;}
export function nextState(current,target,{validated=false,approved=false}={}) {
 if(!STATES.includes(current)||!STATES.includes(target)) throw new Error('UNKNOWN_STATE');
 if(!(NEXT[current]||[]).includes(target)) throw new Error('INVALID_TRANSITION');
 if(target==='PREVIEW_READY' && !validated) throw new Error('QA_REQUIRED');
 if(target==='APPROVED' && !approved) throw new Error('CLIENT_APPROVAL_REQUIRED');
 return target;
}
export function authorizeAction(action,{scopes=[],independentReceipt=false,approval=false}={}) {
 if(!PROTECTED_ACTIONS.includes(action)) return {allowed:true};
 return {allowed:Boolean(approval && independentReceipt && scopes.includes(action)),reason:'PROTECTED_ACTION_REQUIRES_APPROVAL_SCOPE_AND_RECEIPT'};
}
export function normalizeEvent({tenant_id,event_id,entity_type,entity_id,event_type,version=1,source,idempotency_key,payload_hash,occurred_at}) {
 assertTenant(tenant_id);
 for(const [key,value] of Object.entries({event_id,entity_type,entity_id,event_type,source,idempotency_key,payload_hash})) if(typeof value!=='string'||!value.trim())throw new Error('INVALID_'+key.toUpperCase());
 if(!Number.isInteger(version)||version<1)throw new Error('INVALID_VERSION');
 const time=occurred_at||new Date().toISOString();
 if(Number.isNaN(Date.parse(time)))throw new Error('INVALID_TIMESTAMP');
 return Object.freeze({tenant_id,event_id,entity_type,entity_id,event_type,version,source,idempotency_key,payload_hash,occurred_at:time});
}
export function idempotentInsert(existing,event) {
 if(existing.has(event.idempotency_key))return {inserted:false,reason:'DUPLICATE'};
 existing.add(event.idempotency_key);return {inserted:true};
}
