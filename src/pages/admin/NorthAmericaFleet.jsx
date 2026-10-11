import React,{useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,Clipboard,Globe2,Layers3,ShieldCheck,AlertTriangle,CheckCircle2,MapPinned,Plus,FileCheck2,RefreshCw} from 'lucide-react';
import {makeFleetDraft,parseMarketLines} from '@/lib/operator/fleetPlanning.mjs';
import {SERVICE_CATEGORIES} from '@/data/strategicMindsCatalog';
const EXAMPLES=[
 'Fort Lauderdale, FL, US','Pompano Beach, FL, US','Boca Raton, FL, US','Deerfield Beach, FL, US','Hollywood, FL, US',
 'Davie, FL, US','Plantation, FL, US','Coral Springs, FL, US','Delray Beach, FL, US','West Palm Beach, FL, US',
 'Toronto, ON, CA','Vancouver, BC, CA','Montreal, QC, CA','Mexico City, CDMX, MX','Guadalajara, JAL, MX'
].join('\n');
const ROLES=[
 ['ai_systems','AI business systems'],['ai_consulting','AI consulting'],['ai_services','AI services'],
 ['business_automation','Business automation'],['custom_apps','Custom AI applications']
];
export default function NorthAmericaFleet(){
 const [markets,setMarkets]=useState(EXAMPLES);
 const [role,setRole]=useState('ai_systems');
 const [count,setCount]=useState(10);
 const [offer,setOffer]=useState('AI business systems');
 const [plan,setPlan]=useState(null);
 const [error,setError]=useState('');
 const [copied,setCopied]=useState(false);
 const parsed=useMemo(()=>{try{return parseMarketLines(markets)}catch(e){return {markets:[],errors:[{line:0,reason:e.message}]}}},[markets]);
 function draft(){
  try{const next=makeFleetDraft({brand:'Strategic Minds AI',role,count:Number(count),marketText:markets,serviceOffer:offer});setPlan(next);setError('');setCopied(false)}
  catch(e){setError(e.message);setPlan(null)}
 }
 async function copy(){
  if(!plan)return;
  try{await navigator.clipboard.writeText(JSON.stringify(plan,null,2));setCopied(true);setError('')}
  catch{setError('Unable to copy. Check browser clipboard permissions.')}
 }
 return <div className="space-y-6 mx-auto max-w-[1450px]">
  <div className="flex flex-wrap items-start justify-between gap-4">
   <div><div className="text-xs font-bold uppercase tracking-widest text-[#00d4ff]">Digital Dominance · Website Factory</div>
    <h1 className="mt-2 text-3xl font-bold tracking-tight">North America <span className="text-[#00d4ff]">Fleet Planner</span></h1>
    <p className="mt-2 max-w-4xl text-sm text-white/50">Create a research-backed queue proposal for 1 to 1,000 website candidates. This planner never writes live queues, purchases domains or publishes URLs.</p>
   </div>
   <Link to="/admin/operator" className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:text-[#00d4ff]">Operator Command <ArrowRight size={15}/></Link>
  </div>
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
   <section className="dd-panel rounded-2xl p-5 sm:p-7 space-y-5">
    <div className="flex items-center gap-2 text-base font-semibold"><MapPinned className="text-[#00d4ff]" size={21}/> Candidate geography & offer</div>
    <div className="grid sm:grid-cols-2 gap-4">
     <label className="space-y-2"><span className="text-xs text-white/60">Website family</span><select className="dd-input" value={role} onChange={e=>{setRole(e.target.value);setPlan(null)}}>{ROLES.map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label>
     <label className="space-y-2"><span className="text-xs text-white/60">Requested candidates</span><select className="dd-input" value={count} onChange={e=>{setCount(Number(e.target.value));setPlan(null)}}>{[1,10,50,100,250,500,1000].map(n=><option value={n} key={n}>{n} candidates</option>)}</select></label>
    </div>
    <label className="block space-y-2"><span className="text-xs text-white/60">Primary service and buyer intent</span><input value={offer} onChange={e=>{setOffer(e.target.value);setPlan(null)}} maxLength={200} className="dd-input" placeholder="AI business systems for verified local service markets"/></label>
    <label className="block space-y-2"><span className="text-xs text-white/60">Candidate cities (one per line: City, Region, US/CA/MX)</span><textarea value={markets} onChange={e=>{setMarkets(e.target.value);setPlan(null)}} rows={13} className="dd-input font-mono text-xs leading-relaxed" aria-label="Candidate market locations"/></label>
    <div className="grid sm:grid-cols-3 gap-3">
     <div className="rounded-xl border border-white/10 p-3 bg-white/[0.02]"><div className="text-[10px] uppercase text-white/40">Parsed markets</div><div className="mt-2 text-2xl font-bold">{parsed.markets?.length||0}</div></div>
     <div className="rounded-xl border border-white/10 p-3 bg-white/[0.02]"><div className="text-[10px] uppercase text-white/40">Invalid lines</div><div className="mt-2 text-2xl font-bold text-amber-300">{parsed.errors?.length||0}</div></div>
     <div className="rounded-xl border border-white/10 p-3 bg-white/[0.02]"><div className="text-[10px] uppercase text-white/40">Service catalog</div><div className="mt-2 text-2xl font-bold">{SERVICE_CATEGORIES.length}</div></div>
    </div>
    <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 text-xs text-amber-100/80 flex items-start gap-3"><ShieldCheck size={18} className="shrink-0"/><p>All locations are candidates only. A city name is not evidence of an office, personnel, service coverage or local experience. Every page remains NOINDEX until independent checks and approval pass.</p></div>
    {parsed.errors?.length>0&&<div className="text-xs text-red-300">{parsed.errors.slice(0,4).map(x=><p key={x.line}>Line {x.line}: {x.reason}</p>)}</div>}
    <button onClick={draft} type="button" className="rounded-xl bg-[#00d4ff] px-5 py-3 text-black font-bold flex items-center gap-2 hover:bg-[#84ebff]"><Plus size={18}/> Prepare fleet draft</button>
    {error&&<p role="alert" className="text-sm text-red-300">{error}</p>}
   </section>
   <section className="space-y-4">
    <div className="dd-panel rounded-2xl p-5">
     <div className="flex items-center gap-2 font-semibold"><Layers3 className="text-[#00d4ff]" size={20}/> Batch readiness</div>
     {plan?<div className="mt-4">
      <div className="grid grid-cols-2 gap-2">
       <div className="p-4 rounded-lg bg-white/[0.035] border border-white/10"><span className="block text-xs text-white/40">Prepared drafts</span><strong className="text-3xl">{plan.planned_count}</strong></div>
       <div className="p-4 rounded-lg bg-white/[0.035] border border-white/10"><span className="block text-xs text-white/40">Unfilled requests</span><strong className="text-3xl">{plan.unfilled_count}</strong></div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
       <span className="rounded-full border border-amber-300/25 bg-amber-300/5 px-3 py-1.5 text-xs text-amber-300">DRAFT ONLY / NOINDEX</span>
       <button type="button" onClick={copy} className="text-sm text-[#00d4ff] inline-flex items-center gap-2"><Clipboard size={15}/>{copied?'Copied JSON':'Copy SitePack draft'}</button>
      </div>
     </div>:<p className="mt-4 text-sm leading-relaxed text-white/45">Select a website family, identify markets and generate a reviewable candidate packet. This is not a live worker dispatch button.</p>}
    </div>
    <div className="dd-panel rounded-2xl p-5"><h2 className="font-semibold flex items-center gap-2"><FileCheck2 size={19} className="text-[#00d4ff]"/> Mandatory release checks</h2>
     <ul className="mt-4 space-y-3">{['Real business and service coverage','Useful local evidence and differentiated purpose','Original content and verifiable claims','Working lead routing and attribution','Direct-route, schema and canonical QA','Independent validator receipt','Your explicit launch approval'].map(x=><li key={x} className="flex items-start gap-2 text-sm text-white/60"><ShieldCheck size={15} className="text-[#00d4ff] shrink-0 mt-0.5"/>{x}</li>)}</ul>
    </div>
    <div className="dd-panel rounded-2xl p-5"><h2 className="font-semibold flex items-center gap-2"><Globe2 size={19} className="text-[#00d4ff]"/> Domain strategy</h2><p className="mt-3 text-sm text-white/50 leading-relaxed">Use Strategic Minds AI as the parent brand. Any AI Systems Near Me, AI Consultation Near Me and other specialty domains must have a distinct user purpose. Do not auto-create overlapping, city-swapped funnels.</p><Link to="/strategic-minds" className="mt-4 inline-flex items-center gap-2 text-sm text-[#00d4ff]">View marketing site <ArrowRight size={14}/></Link></div>
   </section>
  </div>
  {plan&&<section className="dd-panel rounded-2xl p-5 sm:p-7"><div className="flex flex-wrap justify-between items-center gap-3">
   <div><h2 className="text-lg font-semibold">Prepared website candidates</h2><p className="text-xs mt-1 text-white/40">No DNS changes, index submissions or database writes.</p></div>
   <span className="text-xs text-amber-300">0 approved for indexing</span>
  </div>
  <div className="mt-5 overflow-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-white/40 text-xs border-b border-white/10"><th className="pb-3">#</th><th className="pb-3">Market</th><th className="pb-3">Role</th><th className="pb-3">Research state</th><th className="pb-3">Indexing</th></tr></thead><tbody>{plan.locations.map(x=><tr className="border-b border-white/5" key={x.site_candidate_id}><td className="py-3 text-white/50">{x.sequence}</td><td>{x.market.city}, {x.market.region}, {x.market.country}</td><td className="text-white/50">{role.replaceAll('_',' ')}</td><td className="text-amber-300">Evidence required</td><td className="text-white/40">NOINDEX</td></tr>)}</tbody></table></div>
  </section>}
 </div>;
}
