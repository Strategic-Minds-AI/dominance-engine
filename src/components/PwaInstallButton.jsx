import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';

export default function PwaInstallButton() {
  return (
    <Link to="/app" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,.1)',
      border: '1px solid rgba(200,155,60,.3)', color: '#E7C86E',
      fontSize: 12, fontWeight: 600, textDecoration: 'none',
    }}>
      <Download size={14} /> Install App
    </Link>
  );
}