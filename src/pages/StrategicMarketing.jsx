import React, {useEffect,useMemo,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, CircleHelp,
  Code2, Database, Globe2, Menu, MessageCircle, Phone, Search, ShieldCheck,
  Sparkles, Workflow, X, Zap, BrainCircuit, Network, Bot, Layers3,
  Cpu, Command, Building2, Activity, Rocket, BadgeCheck, SearchCheck,
  Users, Image, Mic, Headphones, ShoppingBag, BarChart3, BookOpen,
  WalletCards, HardHat, Palette, Megaphone, BriefcaseBusiness, Send,
  CalendarDays, MapPinned, LockKeyhole
} from 'lucide-react';
import {SERVICE_CATEGORIES,TOTAL_SERVICE_COUNT,FEATURED_INDUSTRIES} from '@/data/strategicMindsCatalog';
import './StrategicMarketing.css';

const CONTACT_EMAIL='jeremy@strategicmindsai.com';
const CONTACT_PHONE='+17722090266';
const PHONE_LABEL='(772) 209-0266';
const ICONS={
  'sparkles':Sparkles,'brain-circuit':BrainCircuit,'code-2':Code2,'globe-2':Globe2,
  search:SearchCheck,handshake:BriefcaseBusiness,megaphone:Megaphone,
  'messages-square':MessageCircle,palette:Palette,mic:Mic,headphones:Headphones,
  'shopping-bag':ShoppingBag,'bar-chart-3':BarChart3,workflow:Workflow,
  'shield-check':ShieldCheck,'book-open':BookOpen,users:Users,'wallet-cards':WalletCards,
  'hard-hat':HardHat,'building-2':Building2
};
const FAQ=[
  {q:'What kinds of AI technology can Strategic Minds AI help with?',a:'Our solution discovery catalog covers AI strategy, autonomous agents, custom software, business process automation, websites, search visibility, CRM, voice, social media, creative production, analytics and industry-specific workflows. Each project starts with requirements, existing-system reuse, feasibility and a scoped proposal. The catalog describes possible services, not a claim that every integration is immediately production-ready.'},
  {q:'Can you build an AI system that works with the software we already use?',a:'Often, yes. We begin with an integration and permissions audit, then evaluate available APIs and authorized connectors. We favor reusing your CRM, calendar, billing, data and communication systems over forcing a replacement. Protected actions remain approval-gated.'},
  {q:'Can a business use AI agents around the clock?',a:'Persistent operations require a correctly configured, monitored backend with durable queues, retry controls, scoped permissions and audit receipts. A chat session by itself is not a 24/7 worker. We scope and validate an appropriate runtime for the work.'},
  {q:'Can you generate many websites for different services and cities?',a:'A shared website factory can create differentiated previews in batches. But city pages are published and offered for indexing only when verified local coverage, unique useful information, accurate claims, working conversions and independent quality checks support them. A large number of URLs does not guarantee search visibility.'},
  {q:'Do SEO, AEO and GEO services guarantee Google rankings or AI mentions?',a:'No. We focus on technically accessible pages, clear organization, original expertise, answerable customer questions, transparent data and performance measurement. Search engines and AI platforms determine whether and how to feature content; no agency can guarantee a ranking or citation.'},
  {q:'How does a project get started?',a:'We begin with an AI opportunity conversation, map your current workflow and commercial outcome, prepare a prioritized solution plan, then produce a scoped build and testing proposal. For complex or regulated workflows we add domain-specific security and expert review.'},
  {q:'Will the AI system replace our employees?',a:'Our preference is to remove repetitive administrative work and help people deliver better service. Human review is retained for consequential decisions, sensitive personal information, customer communication where appropriate and protected business changes.'}
];
const PRODUCTS=[
  {n:'01',tag:'INTELLIGENCE',title:'AI Strategy & Systems Architecture',copy:'Decide what to automate, what to measure and how to connect the technology you already have.',icon:BrainCircuit},
  {n:'02',tag:'OPERATIONS',title:'Autonomous Agent Operations',copy:'Move from individual prompts to permissioned workflows with durable missions and clear human approvals.',icon:Network},
  {n:'03',tag:'GROWTH',title:'Digital Dominance Website Factory',copy:'Design, preview, validate and provision differentiated conversion experiences from reusable components.',icon:Globe2},
  {n:'04',tag:'REVENUE',title:'AI CRM & Client Experience',copy:'Coordinate inquiries, qualification, estimates, follow-up drafting and attributable sales outcomes.',icon:Activity},
  {n:'05',tag:'VISIBILITY',title:'Search & Answer Intelligence',copy:'Build useful information architectures for Google Search and AI-assisted discovery without shortcut promises.',icon:SearchCheck},
  {n:'06',tag:'CREATIVE',title:'Content & Media Operations',copy:'Bring brand, social, video, avatars and editorial workflows into a structured review process.',icon:Image}
];
const STAGES=[
  {number:'01',title:'Discover',description:'Audit your current tools, customers, goals and bottlenecks.'},
  {number:'02',title:'Architect',description:'Choose a high-value system design, integration plan and measurable milestones.'},
  {number:'03',title:'Build & Verify',description:'Create real working previews, validate security, interfaces and conversion flows.'},
  {number:'04',title:'Operate & Improve',description:'Deploy when approved, monitor evidence and improve the outcomes.'}
];
const MAIL_SUBJECT='Strategic Minds AI | Solution planning request';
function useMarketingHead(title,description) {
  useEffect(()=>{
    const prev=document.title;
    document.title=title;
    const read=(name)=>document.querySelector('meta[name="'+name+'"]');
    const configure=(name,value)=>{
      let tag=read(name);
      const old=tag?.getAttribute('content');
      if(!tag){tag=document.createElement('meta');tag.setAttribute('name',name);document.head.appendChild(tag);}
      tag.setAttribute('content',value);
      return ()=>{if(old===null||old===undefined)tag.remove();else tag.setAttribute('content',old);};
    };
    const unMeta=configure('description',description);
    // Preview only. These routes are intentionally not eligible for public indexing until server rendering, evidence and QA pass.
    const unRobots=configure('robots','noindex, nofollow');
    return ()=>{document.title=prev;unMeta();unRobots();};
  },[title,description]);
}
function Wordmark(){return <span className="sm-brand"><span className="sm-brand-mark" aria-hidden="true"><span>S</span></span><span className="sm-brand-text"><strong>STRATEGIC MINDS</strong><small>AI · INTELLIGENCE IN MOTION</small></span></span>;}
function Nav({minimal=false}){
  const [open,setOpen]=useState(false);
  return <header className="sm-nav">
    <div className="sm-container sm-nav-inner">
      <Link to="/strategic-minds" aria-label="Strategic Minds AI home" onClick={()=>setOpen(false)}><Wordmark/></Link>
      <nav className={'sm-nav-links '+(open?'sm-nav-open':'')} aria-label="Primary navigation">
        <a href="/strategic-minds#solutions" onClick={()=>setOpen(false)}>Solutions</a>
        <a href="/strategic-minds#services" onClick={()=>setOpen(false)}>AI Services</a>
        <a href="/strategic-minds#industries" onClick={()=>setOpen(false)}>Industries</a>
        <a href="/strategic-minds#process" onClick={()=>setOpen(false)}>Our Process</a>
        <a href="/strategic-minds#questions" onClick={()=>setOpen(false)}>FAQs</a>
        <Link className="sm-mobile-only" to="/admin/operator">Operator login</Link>
      </nav>
      <div className="sm-nav-actions">
        <Link className="sm-operator-link" to="/admin/operator"><LockKeyhole size={14}/> Operator OS</Link>
        <a className="sm-button sm-button-small sm-button-primary" href="/strategic-minds#contact">Plan your AI system <ArrowUpRight size={15}/></a>
      </div>
      <button className="sm-menu" type="button" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={21}/>:<Menu size={21}/>}</button>
    </div>
  </header>;
}
function Footer(){return <footer className="sm-footer"><div className="sm-container">
  <div className="sm-footer-top"><Wordmark/><p>Intelligence in motion. Human-led strategy. Technology built for real business outcomes.</p></div>
  <div className="sm-footer-bottom"><span>© {new Date().getFullYear()} Strategic Minds AI. All rights reserved.</span>
    <span>AI implementation is scoped and verified. No rankings, results or service coverage are guaranteed.</span>
    <a href={'mailto:'+CONTACT_EMAIL}>Contact <ArrowUpRight size={13}/></a>
  </div>
</div></footer>;}
function HeroVisual(){
  return <div className="sm-hero-visual" role="img" aria-label="Conceptual AI command center illustrating research, engineering, validation and operations">
    <div className="sm-orbit sm-orbit-one"/><div className="sm-orbit sm-orbit-two"/><div className="sm-orbit sm-orbit-three"/>
    <div className="sm-orb-core"><BrainCircuit size={42} strokeWidth={1.15}/><span>STRATEGIC<br/>INTELLIGENCE</span></div>
    <div className="sm-concept-panel">
      <div className="sm-panel-header"><span><span className="sm-pulse"/> MISSION ARCHITECTURE</span><span>CONCEPT DEMO</span></div>
      <div className="sm-panel-title"><span>One connected operating system</span><Command size={18}/></div>
      <div className="sm-flow">
        {['DISCOVER','DESIGN','BUILD','VALIDATE','OPERATE'].map((t,i)=><div className="sm-flow-node" key={t}><span className="sm-flow-index">{String(i+1).padStart(2,'0')}</span><span>{t}</span><span className="sm-flow-check">{i<2?<Check size={12}/>:<span className="sm-flow-dot"/>}</span></div>)}
      </div>
      <div className="sm-panel-foot"><span><ShieldCheck size={13}/> Human approval where it matters</span><span>PREVIEW WORKFLOW</span></div>
    </div>
    <div className="sm-floating sm-floating-a"><span><Bot size={15}/> AI OPERATORS</span><strong>Coordinated</strong></div>
    <div className="sm-floating sm-floating-b"><span><Layers3 size={15}/> WEBSITE SYSTEMS</span><strong>Repeatable</strong></div>
  </div>;
}
function Contact({selected}) {
  const [fields,setFields]=useState({name:'',email:'',company:'',challenge:'',interest:selected||'AI Strategy & Consulting'});
  const update=(k,v)=>setFields(prev=>({...prev,[k]:v}));
  const send=e=>{
    e.preventDefault();
    const subject=encodeURIComponent(MAIL_SUBJECT+' — '+fields.interest);
    const body=encodeURIComponent('Name: '+fields.name+'\nEmail: '+fields.email+'\nCompany: '+(fields.company||'Not supplied')+'\nInterested in: '+fields.interest+'\n\nBusiness challenge:\n'+fields.challenge+'\n');
    window.location.href='mailto:'+CONTACT_EMAIL+'?subject='+subject+'&body='+body;
  };
  return <section id="contact" className="sm-section sm-contact-section"><div className="sm-container sm-contact-layout">
    <div><div className="sm-eyebrow">YOUR NEXT ADVANTAGE</div><h2 className="sm-section-heading">Tell us what needs <em>to work better.</em></h2>
      <p className="sm-body">Whether you need one intelligent workflow or a complete business operating system, we can map the opportunity and define a practical next step.</p>
      <div className="sm-contact-details">
        <a href={'tel:'+CONTACT_PHONE}><Phone size={18}/>{PHONE_LABEL}<ArrowUpRight size={14}/></a>
        <a href={'mailto:'+CONTACT_EMAIL}><MessageCircle size={18}/>{CONTACT_EMAIL}<ArrowUpRight size={14}/></a>
      </div>
      <p className="sm-form-disclaimer">This preview opens your email application with the request. It does not claim to save lead data into a CRM.</p>
    </div>
    <form className="sm-contact-form" onSubmit={send}>
      <div className="sm-form-header"><span>PROJECT INQUIRY</span><span><ShieldCheck size={14}/> Human-reviewed</span></div>
      <div className="sm-two-col">
        <label>Your name<input value={fields.name} onChange={e=>update('name',e.target.value)} required maxLength={110} placeholder="Full name" autoComplete="name"/></label>
        <label>Work email<input value={fields.email} onChange={e=>update('email',e.target.value)} required type="email" maxLength={200} placeholder="you@company.com" autoComplete="email"/></label>
      </div>
      <label>Company or organization<input value={fields.company} onChange={e=>update('company',e.target.value)} maxLength={140} placeholder="Company name"/></label>
      <label>What would you like to explore?<select value={fields.interest} onChange={e=>update('interest',e.target.value)}>
        {SERVICE_CATEGORIES.map(c=><option value={c.title} key={c.slug}>{c.title}</option>)}
        <option value="Complete AI Operating System">Complete AI Operating System</option>
      </select></label>
      <label>What is the problem you're trying to solve?<textarea value={fields.challenge} onChange={e=>update('challenge',e.target.value)} required maxLength={2500} rows={4} placeholder="Tell us about the people, process, tools or business outcome you want to improve."/></label>
      <button type="submit" className="sm-button sm-button-primary sm-submit">Prepare consultation email <Send size={16}/></button>
      <p className="sm-form-disclaimer">Your message opens in your email client for your review before sending. Do not include passwords or sensitive personal information.</p>
    </form>
  </div></section>;
}
function CapabilityExplorer(){
 const [text,setText]=useState('');
 const [active,setActive]=useState('all');
 const [showAll,setShowAll]=useState(false);
 const [expanded,setExpanded]=useState(null);
 const normalized=text.trim().toLowerCase();
 const filtered=useMemo(()=>SERVICE_CATEGORIES.filter(c=>(active==='all'||active===c.slug)&&(!normalized||[c.title,c.description,c.buyerNeed,c.outcome,...c.services.map(s=>s.title)].join(' ').toLowerCase().includes(normalized))),[text,active]);
 const shown=showAll||normalized||active!=='all'?filtered:filtered.slice(0,8);
 return <section id="services" className="sm-section sm-catalog">
  <div className="sm-container">
    <div className="sm-section-head sm-head-split">
      <div><div className="sm-eyebrow">THE AI CAPABILITY UNIVERSE</div><h2 className="sm-section-heading">One partner. <em>A world of AI.</em></h2><p className="sm-body">Explore {TOTAL_SERVICE_COUNT} potential service offerings organized into {SERVICE_CATEGORIES.length} practical disciplines. We scope each solution against your systems, priorities and budget.</p></div>
      <div className="sm-catalog-counter"><strong>{TOTAL_SERVICE_COUNT}</strong><span>CAPABILITIES TO EXPLORE<br/>NOT PRE-BUILT CLAIMS</span></div>
    </div>
    <div className="sm-filter">
      <div className="sm-search"><Search size={18}/><input value={text} onChange={e=>{setText(e.target.value);setExpanded(null)}} aria-label="Search AI capabilities" placeholder="Search voice, agents, apps, websites, automation, AI consulting..."/>{text&&<button onClick={()=>setText('')} aria-label="Clear search" type="button"><X size={15}/></button>}</div>
      <select aria-label="Filter by AI category" value={active} onChange={e=>{setActive(e.target.value);setExpanded(null)}}>
        <option value="all">All 20 disciplines</option>{SERVICE_CATEGORIES.map(c=><option key={c.slug} value={c.slug}>{c.title}</option>)}
      </select>
    </div>
    <p className="sm-result-label">{filtered.length} disciplines match your selection</p>
    <div className="sm-category-grid">
      {shown.map(c=>{const Icon=ICONS[c.icon]||Cpu;return <article key={c.slug} className={'sm-category '+(expanded===c.slug?'sm-category-selected':'')}>
        <div className="sm-category-top"><span className="sm-category-icon"><Icon size={22} strokeWidth={1.5}/></span><span className="sm-category-count">{c.services.length} SOLUTIONS</span></div>
        <h3>{c.title}</h3><p>{c.description}</p>
        <div className="sm-category-tags">{c.services.slice(0,3).map(s=><span key={s.id}>{s.title}</span>)}</div>
        <button type="button" className="sm-category-expand" onClick={()=>setExpanded(expanded===c.slug?null:c.slug)} aria-expanded={expanded===c.slug}>
          {expanded===c.slug?'Close capabilities':'Explore capabilities'}<ChevronRight size={16}/>
        </button>
        {expanded===c.slug&&<div className="sm-category-details"><p>{c.buyerNeed}</p><ul>{c.services.map(s=><li key={s.id}><Check size={13}/>{s.title}</li>)}</ul><p className="sm-outcome"><strong>Potential outcome:</strong> {c.outcome}</p>
          <Link to={'/strategic-minds/solutions/'+c.slug} className="sm-text-action">Explore this discipline <ArrowUpRight size={14}/></Link>
        </div>}
      </article>})}
    </div>
    {!shown.length&&<div className="sm-empty">No matching disciplines. Try another service, technology or outcome.</div>}
    {active==='all'&&!normalized&&filtered.length>8&&<div className="sm-center"><button className="sm-button sm-button-secondary" type="button" onClick={()=>setShowAll(!showAll)}>{showAll?'Show featured disciplines':'Explore all 20 disciplines'}<ArrowRight size={16}/></button></div>}
    <p className="sm-disclaimer">Catalog entries describe services that can be scoped or designed. Specific product availability, integrations and delivery terms are established in the project proposal.</p>
  </div>
 </section>;
}
export default function StrategicMarketing(){
 useMarketingHead('Strategic Minds AI | Business AI Systems, Automation, Agents & Consulting','Explore AI consulting, custom agents, intelligent websites, CRM, automation, AI search and 120 potential solution capabilities. Strategic Minds AI helps businesses design useful, governed AI systems.');
 return <div className="sm-page"><Nav/>
  <main>
    <section className="sm-hero">
      <div className="sm-mesh" aria-hidden="true"/>
      <div className="sm-container sm-hero-grid">
        <div className="sm-hero-copy">
          <div className="sm-hero-kicker"><span className="sm-kicker-dot"/><span>AI ARCHITECTURE · AUTOMATION · DIGITAL GROWTH</span></div>
          <h1>THE FUTURE OF<br/>YOUR BUSINESS<br/><span>IS INTELLIGENT.</span></h1>
          <p className="sm-hero-subtitle">We design AI-powered business systems that connect your people, technology, marketing and operations. From one high-value workflow to a fully orchestrated digital business.</p>
          <div className="sm-hero-buttons">
            <a className="sm-button sm-button-primary" href="#contact">Build your AI roadmap <ArrowUpRight size={17}/></a>
            <a className="sm-button sm-button-secondary" href="#solutions">Explore what is possible <ArrowRight size={17}/></a>
          </div>
          <div className="sm-hero-note"><span><ShieldCheck size={16}/> Human-governed</span><span><Workflow size={16}/> Systems-first</span><span><SearchCheck size={16}/> Outcome-focused</span></div>
        </div>
        <HeroVisual/>
      </div>
      <div className="sm-container sm-hero-bottom"><span>STRATEGIC MINDS AI</span><span>INTELLIGENCE IN MOTION</span><span>SCROLL TO EXPLORE <ChevronDown size={14}/></span></div>
    </section>
    <section className="sm-pillar-strip"><div className="sm-container sm-pillar-grid">
      {[['STRATEGY','Know what to build'],['ENGINEERING','Make systems connect'],['OPERATIONS','Give AI real work'],['GROWTH','Measure what matters']].map(([label,copy],i)=><div key={label}><span>0{i+1} / {label}</span><strong>{copy}</strong></div>)}
    </div></section>
    <section id="solutions" className="sm-section sm-solutions"><div className="sm-container">
      <div className="sm-section-head"><div className="sm-eyebrow">BUILT AROUND BUSINESS OUTCOMES</div><h2 className="sm-section-heading">Not another AI tool.<br/><em>An intelligent advantage.</em></h2><p className="sm-body">Bring strategy, customer acquisition, custom software and autonomous operations into a single accountable plan. The goal is not more dashboards. It is work that gets done.</p></div>
      <div className="sm-product-grid">{PRODUCTS.map(p=>{const Icon=p.icon;return <div key={p.n} className="sm-product">
        <div className="sm-product-overline"><span>{p.tag}</span><span>{p.n}</span></div>
        <div className="sm-product-icon"><Icon size={29} strokeWidth={1.35}/></div><h3>{p.title}</h3><p>{p.copy}</p><a href="#contact" className="sm-product-arrow" aria-label={'Discuss '+p.title}><ArrowUpRight size={19}/></a>
      </div>})}</div>
    </div></section>
    <section className="sm-statement"><div className="sm-container"><span>WHAT CHANGES</span><h2>From scattered tools and manual handoffs to <em>connected intelligence.</em></h2><p>Research. Architect. Build. Validate. Operate. Improve.</p></div></section>
    <CapabilityExplorer/>
    <section id="industries" className="sm-section sm-industries"><div className="sm-container">
      <div className="sm-section-head sm-head-split"><div><div className="sm-eyebrow">BUILT FOR YOUR WORLD</div><h2 className="sm-section-heading">Intelligence for <em>every industry.</em></h2><p className="sm-body">The best AI system respects how your business actually works. We adapt the architecture, rules and user experience to the people who operate it.</p></div><a className="sm-text-action" href="#contact">Discuss your industry <ArrowUpRight size={16}/></a></div>
      <div className="sm-industries-grid">{FEATURED_INDUSTRIES.map((x,i)=><a key={x.name} href="#contact" className="sm-industry"><span>{String(i+1).padStart(2,'0')}</span><div><h3>{x.name}</h3><p>{x.need}</p></div><ArrowUpRight size={18}/></a>)}</div>
    </div></section>
    <section id="process" className="sm-section sm-process"><div className="sm-container">
      <div className="sm-section-head"><div className="sm-eyebrow">FROM IDEA TO INTELLIGENT OPERATIONS</div><h2 className="sm-section-heading">A smarter way <em>to build.</em></h2><p className="sm-body">A structured engagement that starts with business value and ends with a system your team can actually use.</p></div>
      <div className="sm-stage-grid">{STAGES.map(x=><div className="sm-stage" key={x.number}><span>{x.number}</span><h3>{x.title}</h3><p>{x.description}</p></div>)}</div>
      <div className="sm-process-note"><ShieldCheck size={19}/><p>Consequential actions, customer communications, protected deployments and sensitive changes remain subject to appropriate review and authorization.</p></div>
    </div></section>
    <section className="sm-section sm-location"><div className="sm-container sm-location-layout">
      <div><div className="sm-eyebrow">NORTH AMERICAN REACH</div><h2 className="sm-section-heading">Built to adapt.<br/><em>Not simply duplicate.</em></h2><p className="sm-body">Our reusable platform can prepare market-specific website and service experiences across the United States, Canada and Mexico. Public local claims require verified service coverage, useful original information and working fulfillment.</p><a href="#contact" className="sm-button sm-button-secondary">Discuss multi-market systems <ArrowRight size={16}/></a></div>
      <div className="sm-location-graphic"><div className="sm-loc-orbit"><span>ONE GOVERNED FACTORY</span><strong>LOCAL<br/>RELEVANCE</strong><MapPinned size={36}/></div><div className="sm-loc-tile t1"><Check size={13}/> Verified location</div><div className="sm-loc-tile t2"><ShieldCheck size={13}/> Useful standalone content</div><div className="sm-loc-tile t3"><Activity size={13}/> Measured outcomes</div></div>
    </div></section>
    <section id="questions" className="sm-section sm-faq"><div className="sm-container sm-faq-layout"><div><div className="sm-eyebrow">STRAIGHT ANSWERS</div><h2 className="sm-section-heading">Frequently<br/><em>asked questions.</em></h2><p className="sm-body">Clear expectations are part of a well-engineered system.</p></div><div className="sm-questions">{FAQ.map((f,i)=><details key={f.q}><summary><span className="sm-faq-num">{String(i+1).padStart(2,'0')}</span><span>{f.q}</span><ChevronDown size={18}/></summary><p>{f.a}</p></details>)}</div></div></section>
    <Contact/>
  </main>
  <Footer/>
 </div>;
}
export function StrategicCategory(){
 const {slug}=useParams();const c=SERVICE_CATEGORIES.find(x=>x.slug===slug);
 useMarketingHead((c?c.title:'AI Service')+' | Strategic Minds AI',c?c.description:'Discover Strategic Minds AI service capabilities.');
 if(!c)return <div className="sm-page"><Nav/><main className="sm-container sm-notfound"><h1>Service category not found</h1><Link className="sm-button sm-button-primary" to="/strategic-minds">Return to services <ArrowRight size={16}/></Link></main><Footer/></div>;
 const Icon=ICONS[c.icon]||Cpu;
 return <div className="sm-page"><Nav/><main>
   <section className="sm-category-hero"><div className="sm-container"><Link className="sm-back" to="/strategic-minds#services">← All AI services</Link><div className="sm-eyebrow">AI SOLUTIONS / DISCIPLINE {String(c.id).padStart(2,'0')}</div><span className="sm-category-icon sm-category-hero-icon"><Icon size={30}/></span><h1>{c.title}</h1><p>{c.description}</p><a className="sm-button sm-button-primary" href="/strategic-minds#contact">Plan a solution <ArrowUpRight size={17}/></a></div></section>
   <section className="sm-section sm-category-landing"><div className="sm-container sm-category-landing-grid">
     <div><div className="sm-eyebrow">THE BUSINESS NEED</div><h2 className="sm-section-heading">Technology that has <em>a purpose.</em></h2><p className="sm-body">{c.buyerNeed}</p><div className="sm-process-note"><ShieldCheck size={20}/><p>Every engagement begins with discovery, evidence and an implementation scope. Services listed here are prospective offerings, not automatically available off-the-shelf products.</p></div></div>
     <div className="sm-service-list"><h3>Solutions to explore</h3>{c.services.map((s,i)=><a key={s.id} href="/strategic-minds#contact"><span>{String(i+1).padStart(2,'0')}</span><strong>{s.title}</strong><ArrowUpRight size={17}/></a>)}<p className="sm-outcome"><strong>Target outcome:</strong> {c.outcome}</p></div>
   </div></section>
   <section className="sm-category-close"><div className="sm-container"><h2>Make this capability <em>work for your business.</em></h2><p>We can evaluate the requirements, integration options, people and operational impact in a focused AI planning conversation.</p><a className="sm-button sm-button-primary" href={'mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent('AI solution inquiry: '+c.title)}>Discuss {c.title}<ArrowUpRight size={16}/></a></div></section>
 </main><Footer/></div>;
}
