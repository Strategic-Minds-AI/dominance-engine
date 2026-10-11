import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMarketLines,makeFleetDraft,authorizeIndexReview} from './fleetPlanning.mjs';

test('parses real city candidates and deduplicates',()=>{
 const p=parseMarketLines('Miami, FL, US\nToronto, ON, CA\nMexico City, CDMX, MX\nMiami, FL, US');
 assert.equal(p.markets.length,3);assert.equal(p.deduplicated,1);assert.equal(p.errors.length,0);
});
test('rejects malformed and out-of-scope cities',()=>{
 const p=parseMarketLines('Miami FL USA\nLondon, England, UK');
 assert.equal(p.markets.length,0);assert.equal(p.errors.length,2);
});
test('batch planner is fail-closed and never publishes',()=>{
 const plan=makeFleetDraft({marketText:'Miami, FL, US\nToronto, ON, CA',count:10});
 assert.equal(plan.planned_count,2);assert.equal(plan.unfilled_count,8);
 assert.equal(plan.validation.index_policy,'NOINDEX');assert.equal(plan.locations[0].publish_allowed,false);
 assert.equal(plan.locations[0].market.serviceability,'UNVERIFIED');
});
test('unsanctioned fleet role and count rejected',()=>{
 assert.throws(()=>makeFleetDraft({role:'auto_publish',marketText:'Miami, FL, US'}));
 assert.throws(()=>makeFleetDraft({count:1001,marketText:'Miami, FL, US'}));
});
test('page evidence without independent validation stays noindex',()=>{
 const c=makeFleetDraft({marketText:'Miami, FL, US'}).locations[0];
 const e={real_business_ref:'r',verified_service_area_ref:'s',original_local_utility_ref:'u',live_conversion_route_ref:'c',canonical_target:'https://example.com/x',intent_owner:'site',source_sha:'commit'};
 assert.equal(authorizeIndexReview(c,e,null).status,'NOINDEX_DRAFT');
 const v={status:'PASS',independent_validator_ref:'independent',proof_hash:'hash',source_sha:'commit'};
 const r=authorizeIndexReview(c,e,v);assert.equal(r.status,'REVIEW_READY');assert.equal(r.publish_allowed,false);
});
test('thin city-swapped pages fail even with a validator receipt',()=>{
 const c=makeFleetDraft({marketText:'Miami, FL, US'}).locations[0];
 const e={real_business_ref:'r',verified_service_area_ref:'s',original_local_utility_ref:'u',live_conversion_route_ref:'c',canonical_target:'https://example.com/x',intent_owner:'site',source_sha:'commit',thin_city_swap:true};
 const v={status:'PASS',independent_validator_ref:'independent',proof_hash:'hash',source_sha:'commit'};
 assert.equal(authorizeIndexReview(c,e,v).status,'NOINDEX_DRAFT');
});
