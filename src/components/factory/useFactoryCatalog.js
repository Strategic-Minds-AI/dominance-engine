import { useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useFactoryCatalog(packageKey, category, search) {
  const [term, setTerm] = useState(search);
  useEffect(() => { const timer = setTimeout(() => setTerm(search.trim()), 300); return () => clearTimeout(timer); }, [search]);
  const base = packageKey ? { package_key: packageKey } : {};
  const query = { ...base, ...(category ? { category } : {}), ...(term ? { name: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {}) };
  const categories = useQuery({ queryKey: ['factory-categories', packageKey], queryFn: () => base44.entities.FactoryCatalogItem.filter(base, { distinct: 'category', limit: 100 }) });
  const total = useQuery({ queryKey: ['factory-count', packageKey, category, term], queryFn: () => base44.entities.FactoryCatalogItem.count(query) });
  const items = useInfiniteQuery({ queryKey: ['factory-catalog', packageKey, category, term], initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.FactoryCatalogItem.filter(query, { sort: 'name', limit: 25, fields: ['name', 'summary', 'package_key', 'category', 'entry_key', 'catalog_key'], ...(pageParam ? { cursor: pageParam } : {}) }),
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined });
  return { categories, total, items, records: items.data?.pages.flatMap(page => page.items) || [] };
}