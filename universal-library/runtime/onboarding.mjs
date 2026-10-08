// Universal onboarding schema builder. Must be enforced server-side too.
export const STEP_DEFINITIONS=Object.freeze([
 {id:'business-identity',fields:['legal_name','display_name','website','primary_email']},
 {id:'services-and-geography',fields:['industry','services','service_locations']},
 {id:'credentials-and-proof',fields:['licenses','projects','testimonials']},
 {id:'goals-and-sales-process',fields:['lead_goal','conversion_action','response_owner']},
 {id:'brand-and-assets',fields:['brand_colors','logo_asset_id','tone']},
 {id:'domain-and-integrations',fields:['domain','integrations_requested']},
 {id:'contact-permissions',fields:['privacy_policy_accepted','marketing_consent_opt_in']},
 {id:'approval-and-signature',fields:['authorized_representative','brief_approved']}
]);
export const INDUSTRY_PACKS=Object.freeze({
 'legal-personal-injury':{review:['bar_advertising_rules','attorney_credentials','legal_claims'],questions:['practice_areas','licensed_states','attorney_bios']},
 'home-services':{review:['licenses','service_area_accuracy'],questions:['emergency_availability','project_types','service_radius']},
 healthcare:{review:['clinical_review','privacy'],questions:['provider_credentials','appointment_types']},
 'real-estate':{review:['broker_license','housing_compliance'],questions:['market_area','property_types']},
 'professional-services':{review:['professional_credentials'],questions:['specialties','engagement_types']},
 'retail-ecommerce':{review:['pricing','returns'],questions:['product_catalog','fulfillment_regions']}
});
export function createOnboardingDraft({tenant_id,client_id,industry,answers={}}) {
 if(!tenant_id||!client_id||!INDUSTRY_PACKS[industry])throw new Error('INVALID_ONBOARDING_IDENTITY_OR_INDUSTRY');
 return {tenant_id,client_id,industry,status:'ONBOARDING',answers:{...answers},step:STEP_DEFINITIONS[0].id,updated_at:new Date().toISOString()};
}
export function validateBrief(draft) {
 const missing=[];
 for(const k of ['legal_name','display_name','primary_email','industry','services','service_locations','conversion_action','authorized_representative']) {
 const value=draft?.answers?.[k];if(!value||(Array.isArray(value)&&!value.length))missing.push(k);
 }
 if(draft?.answers?.brief_approved!==true) missing.push('brief_approved');
 return {valid:missing.length===0,missing};
}
