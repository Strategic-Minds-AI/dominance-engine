import React from 'react';
import { Link } from 'react-router-dom';

export default function FactoryEditorContext({ generator, error, loading }) {
  return <div className="border-b border-gold/30 bg-gold/5 px-4 py-3 text-sm text-paper">
    {loading ? <p role="status">Loading factory draft…</p> : error ? <p role="alert">Factory draft unavailable: {error}</p> : <><p className="font-semibold">Factory brief: {generator?.name}</p><p className="mt-1 text-xs text-paper/80">Sources are pinned. This is a design preview, not a validated application or authorized release.</p></>}
    <Link to="/admin/universal-factory" className="mt-1 inline-block text-xs text-gold underline">Return to Universal Factory</Link>
  </div>;
}