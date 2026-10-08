import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import XtremeOSSidebar from '@/components/fl/XtremeOSSidebar';
import XtremeOSRightPanel from '@/components/fl/XtremeOSRightPanel';
import { useQuery } from '@tanstack/react-query';
import { Activity, Globe, Shield, Zap, Cpu, Copy, ListChecks, Images, Building2, PenTool, Search, Layers, TrendingUp, Bot, Loader2 } from 'lucide-react';

export default function XtremeOS() {
  const { data: sites } = useQuery({
    queryKey: ['fl-dashboard-sites'],
    queryFn: async () => (await base44.entities.LaunchedSite.filter({}, { limit: 100 })).items,
  });
  const { data: websites } = useQuery({
    queryKey: ['fl-dashboard-websites'],
    queryFn: async () => (await base44.entities.Website.filter({}, { limit: 100 })).items,
  });
  const { data: posts } = useQuery({
    queryKey: ['fl-dashboard-posts'],
    queryFn: async () => (await base44.entities.SocialPost.filter({}, { limit: 100 })).items,
  });

  const liveSites = (sites || []).filter(s => s.status === 'live').length;
  const totalSites = (sites || []).length;
  const totalPosts = (posts || []).length;
  const scheduledPosts = (posts || []).filter(p => p.status === "scheduled").length;

  const metricCards = [
    { label: 'Launched Sites', value: totalSites, icon: Globe, color: '#2563eb', sub: `${liveSites} live` },
    { label: 'Website Drafts', value: (websites || []).length, icon: Copy, color: '#C89B3C', sub: 'In factory' },
    { label: 'Social Posts', value: totalPosts, icon: Zap, color: '#7c3aed', sub: `${scheduledPosts} scheduled` },
    { label: 'System Status', value: 'ONLINE', icon: Activity, color: '#237A4B', sub: 'All systems running' },
  ];

  return (
    <>
      <XtremeOSSidebar />
      <XtremeOSRightPanel />
      <div style={{ background: '#f7f7f5', minHeight: '100vh', marginLeft: 240, padding: '28px' }}>
        {/* Header */}
        <div style={{
          background: 'radial-gradient(circle at 82% 40%, #C89B3C45, transparent 25%), #0a0a0a',
          color: '#fff', padding: '36px 28px', margin: '-28px -28px 24px', borderRadius: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <p style={{ color: '#E7C86E', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.16em', margin: 0 }}>Digital Dominance</p>
            <h1 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 42, margin: '8px 0 4px', letterSpacing: '-.03em' }}>
              Xtreme<span style={{ color: '#E7C86E' }}>Clone</span> System
            </h1>
            <p style={{ color: '#aaa', fontSize: 14, margin: 0 }}>Autonomous site cloning, generation, and business formation</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', border: '8px solid #C89B3C', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
              <span style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 36 }}>{totalSites}</span>
            </div>
            <small style={{ color: '#E7C86E', textTransform: 'uppercase', letterSpacing: '.12em', fontSize: 10 }}>Total Sites</small>
          </div>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {metricCards.map((card) => (
            <div key={card.label} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${card.color}15`, display: 'grid', placeItems: 'center' }}>
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#111' }}>{card.value}</div>
                  <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '.08em' }}>{card.label}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { to: '/admin/create', icon: Building2, label: 'Creation Hub', desc: 'AI-assisted or self-build' },
            { to: '/admin/visual-editor', icon: PenTool, label: 'Visual Editor', desc: 'Chat-driven website builder' },
            { to: '/admin/programmatic', icon: Layers, label: 'Programmatic Launch', desc: 'Scale to millions of pages' },
            { to: '/admin/social-media', icon: Zap, label: 'Social Media Engine', desc: '30-day AI campaigns' },
            { to: '/admin/super-agents', icon: Bot, label: 'Super Agents', desc: '8-agent fleet' },
            { to: '/admin/studio', icon: Images, label: 'Studio', desc: 'Pack review & versions' },
          ].map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 10, background: '#fff', border: '1px solid #e5e1da', textDecoration: 'none', color: '#333' }}>
              <Icon size={20} style={{ color: '#C89B3C' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Sites */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da' }}>
          <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 18, margin: '0 0 16px' }}>Recent Sites</h3>
          {(sites || []).length === 0 ? (
            <p style={{ color: '#999', fontSize: 14 }}>No sites yet. Use the Creation Hub to build your first site.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {(sites || []).slice(0, 10).map(s => (
                <Link key={s.id} to="/admin/launched-sites" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, border: '1px solid #eee', textDecoration: 'none', color: '#333' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Globe size={16} style={{ color: '#C89B3C' }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, background: s.status === 'live' ? '#dcfce7' : '#f3f4f6', color: s.status === 'live' ? '#16a34a' : '#666' }}>{s.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}