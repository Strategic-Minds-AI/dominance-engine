/**
 * Static HTML snapshot generator for new Strategic Minds marketing routes.
 * Vite client bundle remains interactive; this ensures useful initial HTML for crawlers
 * and readers without JS. All new marketing routes remain NOINDEX in preview.
 */
import {createServer} from 'vite';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom/server.js';
import {Routes,Route} from 'react-router-dom';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const template=await readFile(path.join(root,'dist/index.html'),'utf8');
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
try {
  const {default:Marketing,StrategicCategory}=await server.ssrLoadModule('/src/pages/StrategicMarketing.jsx');
  const {SERVICE_CATEGORIES}=await server.ssrLoadModule('/src/data/strategicMindsCatalog.js');
  const entity={
    '@context':'https://schema.org','@type':'Organization',
    name:'Strategic Minds AI',legalName:'Strategic Minds AI LLC',
    description:'AI consulting, business automation, agents, custom software and digital growth strategy.',
    url:'https://strategicmindsai.com',telephone:'+1-772-209-0266',
    email:'jeremy@strategicmindsai.com'
  };
  const escapeHtml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const render=(url)=>{
    const tree=React.createElement(StaticRouter,{location:url},
      React.createElement(Routes,null,
        React.createElement(Route,{path:'/strategic-minds',element:React.createElement(Marketing)}),
        React.createElement(Route,{path:'/strategic-minds/solutions/:slug',element:React.createElement(StrategicCategory)})
      ));
    return renderToString(tree);
  };
  async function emit(url,title,description,output){
    const html=render(url);
    if(!html||html.length<1500)throw new Error('Static HTML too short for '+url);
    const meta=[
      '<title>'+escapeHtml(title)+'</title>',
      '<meta name="description" content="'+escapeHtml(description)+'"/>',
      '<meta name="robots" content="noindex, nofollow"/>',
      '<meta property="og:type" content="website"/>',
      '<meta property="og:title" content="'+escapeHtml(title)+'"/>',
      '<meta property="og:description" content="'+escapeHtml(description)+'"/>',
      '<meta name="twitter:card" content="summary_large_image"/>',
      '<script type="application/ld+json">'+JSON.stringify(entity).replace(/</g,'\\u003c')+'</script>'
    ].join('\n    ');
    const full=template
      .replace('<title>Digital Dominance</title>',meta)
      .replace('<div id="root"></div>','<div id="root">'+html+'</div>');
    if(!full.includes('name="robots"')||!full.includes('STRATEGIC MINDS'))throw new Error('SEO source validation failed '+url);
    const dir=path.join(root,'dist',output);
    await mkdir(dir,{recursive:true});
    await writeFile(path.join(dir,'index.html'),full);
    return {url,bytes:full.length};
  }
  const results=[];
  results.push(await emit('/strategic-minds',
    'Strategic Minds AI | AI Consulting, Agents, Websites and Business Automation',
    'Explore 120 potential AI service offerings across 20 disciplines, including strategy, autonomous agents, websites, CRM, voice and AI search solutions.',
    'strategic-minds'));
  for(const category of SERVICE_CATEGORIES){
    results.push(await emit('/strategic-minds/solutions/'+category.slug,
      category.title+' | Strategic Minds AI',
      category.description,
      'strategic-minds/solutions/'+category.slug
    ));
  }
  console.log('PRE-RENDERED MARKETING ROUTES',results.length,'all preview NOINDEX; page bytes',results.map(r=>r.bytes).slice(0,3));
} finally {
  await server.close();
}
