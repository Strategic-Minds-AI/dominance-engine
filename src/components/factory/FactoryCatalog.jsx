import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import useFactoryCatalog from '@/components/factory/useFactoryCatalog';

export default function FactoryCatalog({ packageKey, selected, onToggle, onInspect }) {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const data = useFactoryCatalog(packageKey, category, search);
  return <section className="rounded-xl border border-paper/20 bg-paper/5 p-4 sm:p-5">
    <h2 className="font-heading text-xl">Source catalog</h2><p className="mt-1 text-sm text-paper/75">References, not installed external tools. Select up to eight to include in a draft.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm">Search<input className="mt-1 w-full rounded-md border border-paper/30 bg-ink p-2 text-paper" value={search} maxLength={100} onChange={event => setSearch(event.target.value)} placeholder="Find a pattern or technique" /></label>
      <label className="text-sm">Category<select className="mt-1 w-full rounded-md border border-paper/30 bg-ink p-2 text-paper" value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{data.categories.data?.items.map(value => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}</select></label></div>
    <p className="my-3 text-sm text-paper/75" role="status">{data.total.data ?? '…'} matching references</p>
    {data.items.isLoading && <p role="status">Loading references…</p>}
    {(data.items.isError || data.categories.isError) && <p role="alert">Cannot load references: {(data.items.error || data.categories.error).message}</p>}
    {!data.items.isLoading && !data.records.length && <p>No matching source entries.</p>}
    <div className="space-y-2">{data.records.map(item => {
      const included = selected.some(row => row.id === item.id);
      return <article key={item.id} className="rounded-lg border border-paper/15 p-3">
        <button onClick={() => onInspect(item.id)} className="text-left font-semibold text-paper underline decoration-paper/30 underline-offset-4">{item.name}</button><p className="mt-1 text-xs text-gold">{item.package_key} · {item.category.replace(/_/g, ' ')}</p><p className="mt-2 text-sm text-paper/80">{item.summary}</p>
        <Button className="mt-3" size="sm" variant="outline" aria-pressed={included} disabled={!included && selected.length >= 8} onClick={() => onToggle(item)}>{included ? 'Remove from draft' : 'Include in draft'}</Button>
      </article>;
    })}</div>
    {data.items.hasNextPage && <Button className="mt-4" variant="outline" disabled={data.items.isFetchingNextPage} onClick={() => data.items.fetchNextPage()}>{data.items.isFetchingNextPage ? 'Loading…' : 'Load more references'}</Button>}
  </section>;
}