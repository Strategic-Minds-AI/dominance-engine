import { NavLink } from 'react-router-dom';
import { BRAND } from '@/lib/brandIdentity';
import { portalNavCategories } from './data';
import { useState } from 'react';
import {
  LayoutDashboard, Terminal, MessageSquare, Building2, Globe, Shield, ShieldCheck,
  Search, TrendingUp, Package, DollarSign, Users, FileText, PenTool,
  Database, Video, Share2, Settings, Layers, Cpu, Zap, ChevronDown,
  Copy, Images, ListChecks, Archive, BarChart3, Gauge, Bot, AlertTriangle
} from 'lucide-react';

const MODULES = [
  {
    id: 'clone-system', label: 'Xtreme Clone System', icon: Copy, accent: '#C89B3C', items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/app/clone-queue', label: 'Clone Queue', icon: ListChecks },
      { to: '/app/clone-gallery', label: 'Clone Gallery', icon: Images },
      { to: '/app/business', label: 'Business Hub', icon: Building2 },
      { to: '/app/template-library', label: 'Template Library', icon: Layers },
      { to: '/app/build-studio', label: 'Build Studio', icon: Layers },
    ]
  },
  {
    id: 'xtreme-os', label: 'Xtreme OS', icon: Terminal, accent: '#2563eb', items: [
      { to: '/app/command-center', label: 'Command Center', icon: Terminal },
      { to: '/app/chat', label: 'Chat', icon: MessageSquare },
      { to: '/app/visual-studio', label: 'Visual Studio', icon: PenTool },
      { to: '/app/social-media', label: 'Social Media', icon: Share2 },
      { to: '/app/seo-console', label: 'SEO Console', icon: Gauge },
      { to: '/app/agents', label: 'Agent Console', icon: Bot },
      { to: '/app/settings', label: 'Settings', icon: Settings },
    ]
  },
  {
    id: 'faultline-ai', label: 'FaultLine AI', icon: ShieldCheck, accent: '#dc2626', items: [
      { to: '/app/discovery-engine', label: 'Discovery Engine', icon: Search },
      { to: '/app/website-generator', label: 'Website Generator', icon: Globe },
      { to: '/app/competitive-intel', label: 'Competitive Intel', icon: TrendingUp },
      { to: '/app/roi', label: 'ROI Dashboard', icon: BarChart3 },
      { to: '/app/repair-board', label: 'Repair Board', icon: AlertTriangle },
    ]
  },
];

export default function XtremeOSSidebar() {
  const [collapsed, setCollapsed] = useState({});
  return (
    <aside style={{
      position: 'fixed', left: 0, top: 60, bottom: 0, width: 240, zIndex: 50,
      background: '#0a0a0a', color: '#fff', overflowY: 'auto', borderRight: '1px solid #222',
    }}>
      <div style={{ padding: '16px 12px' }}>
        {MODULES.map(mod => (
          <div key={mod.id} style={{ marginBottom: 16 }}>
            <button
              onClick={() => setCollapsed(c => ({ ...c, [mod.id]: !c[mod.id] }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 12px', background: 'none', border: 0, cursor: 'pointer',
                color: mod.accent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em',
              }}
            >
              <mod.icon size={16} />
              <span style={{ flex: 1, textAlign: 'left' }}>{mod.label}</span>
              <ChevronDown size={12} style={{ transform: collapsed[mod.id] ? 'rotate(-90deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {!collapsed[mod.id] && (
              <nav style={{ marginTop: 4 }}>
                {mod.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px 9px 28px',
                      borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: 'none',
                      color: isActive ? '#E7C86E' : '#999',
                      background: isActive ? 'rgba(200,155,60,.1)' : 'none',
                      transition: 'color .15s, background .15s',
                    })}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}