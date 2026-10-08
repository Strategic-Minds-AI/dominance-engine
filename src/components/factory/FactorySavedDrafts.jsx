import React from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function FactorySavedDrafts({ onOpen }) {
  const drafts = useInfiniteQuery({ queryKey: ['factory-drafts'], initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.GeneratorDefinition.filter({ generator_key: { $regex: '^uf-' } }, { sort: '-created_date', limit: 10, fields: ['name', 'status'], ...(pageParam ? { cursor: pageParam } : {}) }),
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined });
  const open = useMutation({ mutationFn: id => base44.entities.GeneratorDefinition.get(id), onSuccess: onOpen });
  return <section className="rounded-xl border border-paper/20 bg-paper/5 p-4 sm:p-5"><h2 className="font-heading text-xl">Saved factory drafts</h2>
    {drafts.isLoading && <p role="status" className="mt-3">Loading drafts…</p>}{(drafts.isError || open.isError) && <p role="alert" className="mt-3">{(drafts.error || open.error).message}</p>}
    {drafts.data?.pages[0].items.length === 0 && <p className="mt-3 text-sm text-paper/75">No factory drafts yet. Compile one above.</p>}
    <ul className="mt-3 space-y-2">{drafts.data?.pages.flatMap(page => page.items).map(row => <li key={row.id} className="flex items-center justify-between gap-3 rounded-lg border border-paper/15 p-3"><span className="text-sm">{row.name} · {row.status}</span><Button variant="outline" size="sm" disabled={open.isPending} onClick={() => open.mutate(row.id)}>View draft</Button></li>)}</ul>
    {drafts.hasNextPage && <Button className="mt-3" variant="outline" disabled={drafts.isFetchingNextPage} onClick={() => drafts.fetchNextPage()}>Load more drafts</Button>}
  </section>;
}