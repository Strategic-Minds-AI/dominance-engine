import XtremeOSSidebar from '@/components/fl/XtremeOSSidebar';
import { Settings as SettingsIcon, User, Shield, Zap, Globe } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  return (
    <>
      <XtremeOSSidebar />
      <div style={{ background: '#f7f7f5', minHeight: '100vh', marginLeft: 240, padding: 28 }}>
        <h1 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 32, margin: '0 0 8px' }}>Settings</h1>
        <p style={{ color: '#666', fontSize: 14, margin: '0 0 24px' }}>Workspace and account configuration</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <User size={20} style={{ color: '#C89B3C' }} />
              <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 18, margin: 0 }}>Account</h3>
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              <div style={{ marginBottom: 8 }}><strong>Email:</strong> {user?.email || '—'}</div>
              <div style={{ marginBottom: 8 }}><strong>Role:</strong> {user?.role || '—'}</div>
              <div><strong>Name:</strong> {user?.full_name || '—'}</div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Zap size={20} style={{ color: '#C89B3C' }} />
              <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 18, margin: 0 }}>AI Gateway</h3>
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              <div style={{ marginBottom: 8 }}><strong>Provider:</strong> Vercel AI Gateway</div>
              <div style={{ marginBottom: 8 }}><strong>Status:</strong> <span style={{ color: '#16a34a' }}>Connected</span></div>
              <div><strong>Billing:</strong> Vercel account (not Base44 credits)</div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Globe size={20} style={{ color: '#C89B3C' }} />
              <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 18, margin: 0 }}>Connected Services</h3>
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              <div style={{ marginBottom: 8 }}>Gmail, Calendar, Drive, Docs, Sheets, Tasks</div>
              <div style={{ marginBottom: 8 }}>Google Search Console, Google Analytics</div>
              <div>GitHub, Supabase, HubSpot</div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e1da' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Shield size={20} style={{ color: '#C89B3C' }} />
              <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 18, margin: 0 }}>Security</h3>
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              <div style={{ marginBottom: 8 }}><strong>Auth:</strong> Base44 managed</div>
              <div><strong>RLS:</strong> Admin-only on sensitive entities</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}