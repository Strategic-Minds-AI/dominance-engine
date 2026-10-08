import { Link } from 'react-router-dom';
import { Activity, Globe, Shield, Zap, Cpu, Copy, ListChecks, Images, Building2, PenTool, Search, Layers, TrendingUp, Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function XtremeOSRightPanel() {
  const { data: sites } = useQuery({
    queryKey: ['fl-sites'],
    queryFn: async () => (await base44.entities.LaunchedSite.filter({}, { sort: "-created_date", limit: 5 })).items,
  });
  const { data: posts } = useQuery({
    queryKey: ['fl-posts'],
    queryFn: async () => (await base44.entities.SocialPost.filter({}, { sort: "-created_date", limit: 5 })).items,
  });

  return (
    <aside style={{
      position: 'fixed', right: 0, top: 60, bottom: 0, width: 300, zIndex: 40,
      background: '#fff', borderLeft: '1px solid #e5e1da', overflowY: 'auto',
      display: 'none', '@media (min-width: 1200px)': { display: 'block' },
    }} className="hidden xl:block">
      <div style={{ padding: 20 }}>
        <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 18, margin: '0 0 16px' }}>Recent Activity</h3>
        <div style={{ spaceY: 12 }}>
          {(sites || []).map(s => (
            <Link key={s.id} to="/app/clone-gallery" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid #eee', marginBottom: 8, textDecoration: 'none', color: '#333' }}>
              <Globe size={16} style={{ color: '#C89B3C' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{s.status}</div>
              </div>
            </Link>
          ))}
          {(posts || []).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid #eee', marginBottom: 8 }}>
              <Zap size={16} style={{ color: '#C89B3C' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.platform} post</div>
                <div style={{ fontSize: 11, color: '#999' }}>{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}