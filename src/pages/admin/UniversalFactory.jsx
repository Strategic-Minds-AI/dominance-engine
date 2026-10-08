import React, { useState } from 'react';
import FactoryPackageOverview from '@/components/factory/FactoryPackageOverview';
import FactoryCatalog from '@/components/factory/FactoryCatalog';
import FactoryEntryDetail from '@/components/factory/FactoryEntryDetail';
import FactoryComposer from '@/components/factory/FactoryComposer';
import FactoryBlueprintResult from '@/components/factory/FactoryBlueprintResult';
import FactorySavedDrafts from '@/components/factory/FactorySavedDrafts';

export default function UniversalFactory() {
  const [packageKey, setPackageKey] = useState('');
  const [selected, setSelected] = useState([]);
  const [entryId, setEntryId] = useState(null);
  const [generator, setGenerator] = useState(null);
  const toggle = item => setSelected(rows => rows.some(row => row.id === item.id) ? rows.filter(row => row.id !== item.id) : rows.length < 8 ? [...rows, item] : rows);
  return <div className="space-y-6 text-paper">
    <header><h1 className="font-heading text-3xl">Universal Factory</h1><p className="mt-2 text-sm text-paper/80">One source catalog for the six Strategic Minds packages. Compile version-pinned drafts without replacing existing builders or duplicating the operations control plane.</p></header>
    <FactoryPackageOverview selected={packageKey} onSelect={setPackageKey} />
    <FactoryComposer selected={selected} onRemove={toggle} onCompiled={setGenerator} />
    <FactoryBlueprintResult generator={generator} />
    <FactorySavedDrafts onOpen={setGenerator} />
    <FactoryCatalog key={packageKey} packageKey={packageKey} selected={selected} onToggle={toggle} onInspect={setEntryId} />
    <FactoryEntryDetail id={entryId} onClose={() => setEntryId(null)} />
  </div>;
}