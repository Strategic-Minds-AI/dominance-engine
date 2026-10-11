import React, {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {Activity, ArrowRight, Bot, BrainCircuit, Clipboard, FileCheck2, Globe2, Layers3, LockKeyhole, Radar, RefreshCw, Rocket, ShieldAlert, Sparkles, Workflow} from 'lucide-react';
import {base44} from '@/api/base44Client';
import {useAuth} from '@/lib/AuthContext';
import {createMissionDraft, deriveOperatorSignals, classifyAction} from '@/lib/operator/policy.mjs';

const SUGGESTIONS = [
  'Audit the existing epoxy estimate funnel, prove lead attribution, and prepare repair previews',
  'Analyze X1 queue failures and prepare a bounded staging reliability repair',
  'Find commercially viable industrial flooring offers from verified first-party evidence',
  'Prepare a 10-site differentiated SEO pilot with real providers and independent QA'
];
const LANES = [
  {icon:Radar,title:'Opportunity Intelligence',desc:'Verify demand, buyers and economics',to:'/admin/opportunities'},
  {icon:Rocket,title:'Website Factory',desc:'SiteSpecs, designs and safe previews',to:'/admin/website-factory'},
  {icon:Bot,title:'SEAL Team',desc:'Existing specialists and delegated work',to:'/admin/super-agents'},
  {icon:Workflow,title:'Mission Operations',desc:'APEX missions and receipts',to:'/admin/apex'},
  {icon:Layers3,title:'Hidden System Library',desc:'Advanced tools preserved, not deleted',to:'/admin/universal-factory'},
  {icon:Globe2,title:'Google Quality',desc:'Review index and launch eligibility',to:'/admin/seo-command'}
];
const pickItems = response => Array.isArray(response) ? response : Array.isArray(response?.items) ? response.items : [];

export default function OperatorCommand() {
  const {user} = useAuth();
  const isAdmin = user?.role === 'admin';
  const [goal,setGoal] = useState('');
  const [draft,setDraft] = useState(null);
  const [error,setError] = useState('');
  const [copied,setCopied] = useState(false);
  const qc = useQueryClient();
  const {data,isFetching} = useQuery({
    queryKey:['operator-read-only-donor-queue'],enabled:isAdmin,retry:false,refetchOnWindowFocus:false,
    queryFn:async()=>{
      const result = await Promise.allSettled([
        base44.entities.Mission.filter({}, {sort:'-created_date',limit:25}),
        base44.entities.AgentTask.filter({}, {sort:'-created_date',limit:25}),
        base44.entities.ProvisioningJob.filter({}, {sort:'-created_date',limit:25})
      ]);
      const read = index => result[index].status === 'fulfilled' ? pickItems(result[index].value) : undefined;
      return {missions:read(0),agentTasks:read(1),provisioningJobs:read(2)};
    }
  });
  const signals = useMemo(()=>deriveOperatorSignals({
    missions:data?.missions,agentTasks:data?.agentTasks,provisioningJobs:data?.provisioningJobs,sourceStatus:'UNVERIFIED'
  }),[data]);
  const plan = () => {
    try {setDraft(createMissionDraft(goal));setError('');setCopied(false);}
    catch(e){setError(e.message);setDraft(null);}
  };
  const copy = async () => {
    if(!draft)return;
    try{await navigator.clipboard.writeText(JSON.stringify(draft,null,2));setCopied(true);setError('');}
    catch{setError('Clipboard access failed. Use a supported browser to copy the draft.');}
  };
  if(!isAdmin)return <div className="mx-auto max-w-xl dd-panel rounded-xl p-8 text-center">
    <LockKeyhole className="mx-auto h-8 w-8 text-amber-300"/>
    <h1 className="mt-3 text-xl font-bold">Operator access required</h1>
    <p className="mt-2 text-sm text-white/50">This view does not replace backend tenant and role authorization.</p>
  </div>;
  return <div className="mx-auto max-w-[1600px] space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00d4ff]"><Sparkles className="h-4 w-4"/>Strategic Minds AI</div>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">Operator <span className="text-[#00d4ff]">Command OS</span></h1>
        <p className="mt-2 max-w-3xl text-sm text-white/50">One mission interface. Proactive evidence, agent delegation, website queues, independent validation and governed approvals.</p>
      </div>
      <span className="rounded-full border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-[11px] font-semibold text-amber-200">PHASE 1 · READ-ONLY BRIDGE + LOCAL PLANNER</span>
    </header>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
      <section className="dd-panel rounded-2xl p-5 sm:p-7">
        <div className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-[#00d4ff]"/><h2 className="font-heading text-lg font-semibold">What should our team accomplish?</h2></div>
        <p className="mt-1 text-xs text-white/40">This creates a reviewable draft only. It does not start agents, queue jobs or publish websites.</p>
        <textarea className="mt-5 min-h-32 w-full resize-y rounded-xl border border-white/15 bg-white/[0.03] p-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#00d4ff]" value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Research the next profitable market, generate differentiated sites, prepare validated previews..." maxLength={8000}/>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-white/40">Discover → Draft → Stage → Independent QA → Approval</span>
          <button type="button" onClick={plan} disabled={!goal.trim()} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-40"><Sparkles className="h-4 w-4"/>Prepare mission</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{SUGGESTIONS.map(s=><button key={s} type="button" onClick={()=>{setGoal(s);setDraft(null);setError('')}} className="rounded-full border border-white/10 px-3 py-2 text-left text-xs text-white/55 hover:border-[#00d4ff]/40 hover:text-white">{s}</button>)}</div>
        {error&&<p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
        {draft&&<div className="mt-5 rounded-xl border border-[#00d4ff]/30 bg-[#00d4ff]/[0.04] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="text-xs uppercase tracking-widest text-[#00d4ff]">Local mission draft</div><div className="mt-1 text-sm font-semibold">{draft.kind.replace('_',' ')} · {draft.status}</div></div>
            <button type="button" onClick={copy} className="inline-flex items-center gap-2 text-xs text-[#00d4ff]"><Clipboard className="h-4 w-4"/>{copied?'Copied':'Copy packet'}</button>
          </div>
          <ol className="mt-3 space-y-2">{draft.steps.map((step,i)=><li key={step.name} className="flex gap-3 text-xs text-white/70"><span className="w-5 text-[#00d4ff]">{i+1}</span><span>{step.name} {classifyAction(step.action)==='PROTECTED'&&<span className="text-amber-300">(protected)</span>}</span></li>)}</ol>
          <p className="mt-3 text-[11px] text-white/40">Not saved to a remote queue. Approval is a separate authenticated workflow.</p>
        </div>}
      </section>
      <section className="dd-panel rounded-2xl p-5 sm:p-7">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><Activity className="h-5 w-5 text-[#00d4ff]"/>Evidence-based priorities</h2>
          <button type="button" onClick={()=>qc.invalidateQueries({queryKey:['operator-read-only-donor-queue']})} aria-label="Refresh read-only queues" className="rounded-lg p-2 text-white/50 hover:bg-white/5"><RefreshCw className={'h-4 w-4 '+(isFetching?'animate-spin':'')}/></button>
        </div>
        <p className="mt-2 text-xs text-white/40">Base44 donor record samples, not a verified X1/GPT sync or fleet health report.</p>
        <div className="mt-4 space-y-2">{signals.map((s,i)=><Link to={s.path||'/admin/gpt-sync'} key={i} className="block rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-[#00d4ff]/30">
          <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{s.label}</span><span className="text-[10px] text-amber-300">{s.status}</span></div>
          <p className="mt-1 text-[11px] text-white/40">{s.evidence||'No connected records available in this sample'}</p>
        </Link>)}</div>
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-xs text-amber-200"><ShieldAlert className="mb-1 inline h-4 w-4"/> Persistent X1 work, cloud runtime identity and two-way GPT synchronization are not yet verified by this page.</div>
      </section>
    </div>
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="font-heading text-lg font-bold">Specialist command and retained systems</h2><Link to="/admin/gpt-sync" className="flex items-center gap-1 text-xs text-[#00d4ff]">GPT sync status <ArrowRight className="h-4 w-4"/></Link></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{LANES.map(({icon:Icon,title,desc,to})=><Link to={to} key={title} className="dd-panel group flex items-start gap-3 rounded-xl p-4 hover:border-[#00d4ff]/40">
        <span className="rounded-lg bg-[#00d4ff]/10 p-2"><Icon className="h-5 w-5 text-[#00d4ff]"/></span><div className="flex-1"><h3 className="font-semibold text-sm">{title}</h3><p className="mt-1 text-xs text-white/40">{desc}</p></div><ArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#00d4ff]"/>
      </Link>)}</div>
    </section>
    <div className="dd-panel flex flex-wrap items-center gap-3 rounded-xl p-4 text-xs text-white/50"><FileCheck2 className="h-4 w-4 text-[#00d4ff]"/><span>100-site fleets are staging batches, not 100 automatically indexable pages.</span><Link to="/admin/seo-command" className="ml-auto text-[#00d4ff]">Review Google gates →</Link></div>
  </div>;
}
