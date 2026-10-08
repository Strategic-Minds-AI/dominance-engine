import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FactoryBlueprintResult({ generator }) {
  if (!generator) return null;
  const spec = generator.definition;
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${spec.project_id}.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section aria-live="polite" className="rounded-xl border border-gold/40 bg-gold/5 p-4 sm:p-5">
    <h2 className="font-heading text-xl">{generator.name}</h2><p className="mt-1 text-sm text-paper/80">Draft saved · not independently validated · public release blocked</p>
    <p className="mt-3 text-sm">{spec.brief}</p><ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-paper/80">{spec.screens.map(screen => <li key={screen.id}>{screen.name}</li>)}</ol>
    <p className="mt-3 break-all text-xs text-paper/70">Blueprint SHA-256: {spec.build_spec_hash}</p>
    <div className="mt-4 flex flex-wrap gap-3"><Button asChild><Link to={`/admin/visual-editor?factory=${generator.id}`}>Open in Visual Editor</Link></Button><Button variant="outline" onClick={download}>Export blueprint</Button></div>
    <details className="mt-4 text-sm"><summary className="cursor-pointer">View source pins and approval holds</summary><p className="mt-2 text-paper/80">{spec.completion_boundary}</p><pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify({ packages: spec.package_versions, sources: spec.source_references, governance: spec.governance, validation: spec.validation }, null, 2)}</pre></details>
  </section>;
}