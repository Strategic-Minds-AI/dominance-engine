import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function FactoryComposer({ selected, onRemove, onCompiled }) {
  const [form, setForm] = useState({ title: '', brief: '', seed: 'strategic-minds-v1', recipe: 'Service Business Site', quality_profile: 'Enterprise Precision' });
  const cache = useQueryClient();
  const options = useQuery({ queryKey: ['factory-composer-options'], queryFn: async () => {
    const [recipes, profiles] = await Promise.all(['experience_recipes', 'quality_profiles'].map(category => base44.entities.FactoryCatalogItem.filter({ package_key: 'frontend', category }, { distinct: 'name', limit: 50 })));
    return { recipes: recipes.items, profiles: profiles.items };
  } });
  const compile = useMutation({ mutationFn: async () => (await base44.functions.invoke('compileFactoryBlueprint', { ...form, reference_ids: selected.map(row => row.id) })).data,
    onSuccess: data => { onCompiled(data.generator); cache.invalidateQueries({ queryKey: ['factory-drafts'] }); } });
  const field = key => ({ value: form[key], onChange: event => setForm({ ...form, [key]: event.target.value }) });
  return <section className="rounded-xl border border-paper/20 bg-paper/5 p-4 sm:p-5">
    <h2 className="font-heading text-xl">Compile a factory draft</h2><p className="mt-1 text-sm text-paper/75">Pins sources and approvals, then hands a design brief to the existing Visual Editor. No deployment or external execution.</p>
    <form className="mt-4 space-y-3" onSubmit={event => { event.preventDefault(); compile.mutate(); }}>
      <label className="block text-sm">Project name<input {...field('title')} required maxLength={120} className="mt-1 w-full rounded-md border border-paper/30 bg-ink p-2 text-paper" /></label>
      <label className="block text-sm">Business brief<textarea {...field('brief')} required minLength={10} maxLength={2500} rows={4} className="mt-1 w-full rounded-md border border-paper/30 bg-ink p-2 text-paper" /></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Experience recipe<select {...field('recipe')} className="mt-1 w-full rounded-md border border-paper/30 bg-ink p-2 text-paper" disabled={options.isLoading}>{options.data?.recipes.map(name => <option key={name}>{name}</option>)}</select></label>
        <label className="text-sm">Quality profile<select {...field('quality_profile')} className="mt-1 w-full rounded-md border border-paper/30 bg-ink p-2 text-paper" disabled={options.isLoading}>{options.data?.profiles.map(name => <option key={name}>{name}</option>)}</select></label></div>
      <label className="block text-sm">Repeatable seed<input {...field('seed')} required maxLength={80} className="mt-1 w-full rounded-md border border-paper/30 bg-ink p-2 text-paper" /></label>
      <ul className="space-y-2">{selected.map(item => <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-paper/15 p-2 text-sm"><span>{item.name}</span><Button type="button" size="sm" variant="outline" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item)}>Remove</Button></li>)}</ul>
      {options.isError && <p role="alert">{options.error.message}</p>}{compile.isError && <p role="alert" className="text-gold">{compile.error.response?.data?.error || compile.error.message}</p>}
      <Button type="submit" disabled={compile.isPending || !options.data || !form.title.trim() || form.brief.trim().length < 10}>{compile.isPending ? 'Compiling draft…' : 'Compile and save draft'}</Button>
    </form>
  </section>;
}