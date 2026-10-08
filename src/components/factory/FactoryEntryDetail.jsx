import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function FactoryEntryDetail({ id, onClose }) {
  const entry = useQuery({ queryKey: ['factory-entry', id], queryFn: () => base44.entities.FactoryCatalogItem.get(id), enabled: Boolean(id) });
  return <Dialog open={Boolean(id)} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="max-h-[85vh] overflow-y-auto border-paper/20 bg-ink text-paper sm:max-w-3xl">
    <DialogHeader><DialogTitle>{entry.data?.name || 'Source reference'}</DialogTitle><DialogDescription className="text-paper/75">Uploaded reference only. Its historical execution claims do not establish this app’s permissions or readiness.</DialogDescription></DialogHeader>
    {entry.isLoading && <p role="status">Loading source…</p>}{entry.isError && <p role="alert">{entry.error.message}</p>}
    {entry.data && <><p className="break-all text-xs text-paper/70">{entry.data.source_path}</p><p className="break-all text-xs text-paper/70">Source SHA-256: {entry.data.source_sha256}</p>
      {entry.data.content_text ? <div className="space-y-3 whitespace-pre-wrap text-sm"><ReactMarkdown>{entry.data.content_text}</ReactMarkdown></div> : <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-paper/5 p-3 text-xs">{JSON.stringify(entry.data.definition, null, 2)}</pre>}</>}
  </DialogContent></Dialog>;
}