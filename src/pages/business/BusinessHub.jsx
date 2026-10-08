import XtremeOSSidebar from '@/components/fl/XtremeOSSidebar';
import { Link } from 'react-router-dom';
import { Building2, Plus, Globe, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function BusinessHub() {
  const { data: sites } = useQuery({
    queryKey: ['bh-sites'],
    queryFn: async () => (await base44.entities.LaunchedSite.filter({}, { sort: "-created_date", limit: 50 })).items,
  });
  return (
    <>
      <XtremeOSSidebar />
      <div style={{ background: '#f7f7f5', minHeight: '100vh', marginLeft: 240, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 32, margin: '0 0 8px' }}>Business Hub</h1>
            <p style={{ color: '#666', fontSize: 14, margin: 0 }}>Manage your business websites and projects</p>
          </div>
          <Link to="/admin/create" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #E7C86E, #C89B3C)', color: '#111', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
            <Plus size={16} /> New Project
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {(sites || []).length === 0 ? (
            <div style={{ gridColumn: '1 / -1', background: '#fff', borderRadius: 12, padding: 40, border: '1px solid #e5e1da', textAlign: 'center' }}>
              <Building2 size={48} style={{ color: '#C89B3C', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 20, margin: '0 0 8px' }}>No projects yet</h3>
              <p style={{ color: '#999', fontSize: 14, marginBottom: 16 }}>Start by creating a new website project</p>
              <Link to="/admin/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: '#0a0a0a', color: '#E7C86E', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                <Plus size={16} /> Create Project
              </Link>
            </div>
          ) : (sites || []).map(s => (
            <Link key={s.id} to="/admin/launched-sites" style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da', textDecoration: 'none', color: '#333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Globe size={20} style={{ color: '#C89B3C' }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>{s.name}</span>
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>{s.keywords || 'No keywords set'}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, background: s.status === 'live' ? '#dcfce7' : '#f3f4f6', color: s.status === 'live' ? '#16a34a' : '#666' }}>{s.status}</span>
                <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, background: '#f3f4f6', color: '#666' }}>{s.pages_count || 0} pages</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}