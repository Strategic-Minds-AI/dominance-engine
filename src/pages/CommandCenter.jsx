import XtremeOSSidebar from '@/components/fl/XtremeOSSidebar';
import { Activity, Cpu, Globe, Shield, Zap, Server, Database, Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CommandCenter() {
  const { data: sites } = useQuery({
    queryKey: ['cc-sites'],
    queryFn: async () => (await base44.entities.LaunchedSite.filter({}, { limit: 100 })).items,
  });
  const { data: jobs } = useQuery({
    queryKey: ['cc-jobs'],
    queryFn: async () => (await base44.entities.ProvisioningJob.filter({}, { sort: "-created_date", limit: 50 })).items,
  });
  const { data: tasks } = useQuery({
    queryKey: ['cc-tasks'],
    queryFn: async () => (await base44.entities.AgentTask.filter({}, { sort: "-created_date", limit: 50 })).items,
  });

  const systems = [
    { name: 'Vercel AI Gateway', status: 'ONLINE', icon: Cpu, color: '#237A4B' },
    { name: 'Sync Engine', status: 'RUNNING', icon: Zap, color: '#237A4B' },
    { name: 'Guardian Auto-Fix', status: 'ACTIVE', icon: Shield, color: '#237A4B' },
    { name: 'Social Media Engine', status: 'SCHEDULED', icon: Bot, color: '#C89B3C' },
    { name: 'Analytics Sync', status: 'DAILY', icon: Activity, color: '#2563eb' },
    { name: 'Database', status: 'ONLINE', icon: Database, color: '#237A4B' },
  ];

  return (
    <>
      <XtremeOSSidebar />
      <div style={{ background: '#f7f7f5', minHeight: '100vh', marginLeft: 240, padding: 28 }}>
        <h1 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 32, margin: '0 0 8px' }}>Command Center</h1>
        <p style={{ color: '#666', fontSize: 14, margin: '0 0 24px' }}>System status and operational overview</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
          {systems.map(s => (
            <div key={s.name} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${s.color}15`, display: 'grid', placeItems: 'center' }}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da' }}>
            <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 18, margin: '0 0 16px' }}>Recent Agent Tasks</h3>
            {(tasks || []).length === 0 ? <p style={{ color: '#999' }}>No tasks yet.</p> : (
              <div style={{ display: 'grid', gap: 8 }}>
                {(tasks || []).slice(0, 10).map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, border: '1px solid #eee' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: t.status === 'completed' ? '#dcfce7' : '#f3f4f6', color: t.status === 'completed' ? '#16a34a' : '#666' }}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da' }}>
            <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 18, margin: '0 0 16px' }}>Provisioning Jobs</h3>
            {(jobs || []).length === 0 ? <p style={{ color: '#999' }}>No jobs yet.</p> : (
              <div style={{ display: 'grid', gap: 8 }}>
                {(jobs || []).slice(0, 10).map(j => (
                  <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, border: '1px solid #eee' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{j.target}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: j.status === 'success' ? '#dcfce7' : '#f3f4f6', color: j.status === 'success' ? '#16a34a' : '#666' }}>{j.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}