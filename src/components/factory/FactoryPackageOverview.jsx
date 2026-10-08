import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function FactoryPackageOverview({ selected, onSelect }) {
  const packages = useQuery({ queryKey: ['factory-packages'], queryFn: () => base44.entities.FactoryPackage.filter({}, { sort: 'package_key', limit: 6 }) });
  const counts = useQuery({ queryKey: ['factory-package-counts'], queryFn: () => base44.entities.FactoryCatalogItem.aggregate({ groupBy: 'package_key' }) });
  if (packages.isLoading) return <p role="status">Loading package registry…</p>;
  if (packages.isError) return <p role="alert">Cannot load packages: {packages.error.message}</p>;
  if (!packages.data?.items.length) return <p>No packages registered yet.</p>;
  if (counts.isError) return <p role="alert">Cannot load package totals: {counts.error.message}</p>;
  return <section aria-label="Installed source packages" className="space-y-3">
    <Button variant="outline" onClick={() => onSelect('')} aria-pressed={!selected}>All packages</Button>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{packages.data.items.map(pkg => <article key={pkg.id} className={`rounded-xl border p-4 ${selected === pkg.package_key ? 'border-gold bg-gold/10' : 'border-paper/20 bg-paper/5'}`}>
      <button className="w-full text-left focus-visible:outline focus-visible:outline-gold" onClick={() => onSelect(pkg.package_key)} aria-pressed={selected === pkg.package_key}>
        <h2 className="font-heading text-lg">{pkg.name}</h2><p className="text-sm text-paper/75">v{pkg.version} · {counts.data?.rows.find(row => row.package_key === pkg.package_key)?.count ?? '…'} source entries</p>
        <p className="mt-2 text-sm text-paper/85">{pkg.role}</p>
      </button>
      <p className="mt-3 text-xs text-gold">{pkg.catalog_status === 'registered' ? 'Catalog registered' : 'Import incomplete'} · runtime not certified</p>
      <details className="mt-2 text-sm text-paper/75"><summary className="cursor-pointer">Next integration stage</summary><p className="mt-2">{pkg.next_step}</p><p className="mt-2">{pkg.boundary}</p></details>
      <a href={pkg.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-gold underline">Original source archive</a>
    </article>)}</div>
  </section>;
}