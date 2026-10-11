import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyAction, createMissionDraft, checkIndexEligibility, deriveOperatorSignals} from './policy.mjs';

test('unrecognized actions fail closed',()=>assert.equal(classifyAction('do_everything'),'UNKNOWN'));
test('publishing and secrets are protected',()=>{assert.equal(classifyAction('publish'),'PROTECTED');assert.equal(classifyAction('secret_change'),'PROTECTED')});
test('safe research and previews stay nonproduction',()=>assert.equal(classifyAction('preview'),'SAFE_SCOPE'));
test('mission produces a plan, not false completion',()=>{let m=createMissionDraft('Create 10 roofing websites',{source_sha:'abc'});assert.equal(m.status,'DRAFT_ONLY');assert.equal(m.kind,'WEBSITE_FLEET');assert.equal(m.steps.at(-1).approval_required,true)});
test('blank and oversized goals fail',()=>{assert.throws(()=>createMissionDraft(' '));assert.throws(()=>createMissionDraft('x'.repeat(8001)))});
test('unverified city swap blocked',()=>{let r=checkIndexEligibility({intent:'roofing',thin_city_swap:true});assert.equal(r.status,'NOINDEX_DRAFT');assert.ok(r.missing.includes('thin_city_swap'))});
test('independent validation required even if evidence fields are populated',()=>{let page={source_sha:'sha',intent:'service',canonical_url:'https://example.com',verified_entity_id:'real',location_evidence_ref:'loc',unique_utility_ref:'utility',fact_evidence_ref:'fact',working_conversion_ref:'lead',internal_link_plan_ref:'links'};assert.equal(checkIndexEligibility(page).status,'NOINDEX_DRAFT');const result=checkIndexEligibility(page,{status:'PASS',validator_id:'independent',evidence_hash:'hash',source_sha:'sha'});assert.equal(result.status,'INDEX_ELIGIBLE_FOR_REVIEW');assert.equal(result.publish_allowed,false)});
test('failed or unknown queues never report healthy',()=>{let a=deriveOperatorSignals({missions:[],agentTasks:[{status:'failed'}],provisioningJobs:undefined});assert.equal(a[0].status,'UNKNOWN');assert.equal(a[1].status,'REPAIR');assert.equal(a[2].status,'UNKNOWN')});
