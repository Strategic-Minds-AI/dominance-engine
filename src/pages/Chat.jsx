import XtremeOSSidebar from '@/components/fl/XtremeOSSidebar';
import XtremeAIChat from '@/components/fl/XtremeAIChat';
import { useState } from 'react';

export default function Chat() {
  const [expanded, setExpanded] = useState(true);
  return (
    <>
      <XtremeOSSidebar />
      <XtremeAIChat expanded={expanded} onToggle={setExpanded} />
      <div style={{ background: '#f7f7f5', minHeight: '100vh', marginLeft: 240, padding: 28, marginRight: expanded ? 420 : 0, transition: 'margin .3s' }}>
        <h1 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 32, margin: '0 0 8px' }}>Chat</h1>
        <p style={{ color: '#666', fontSize: 14, margin: '0 0 24px' }}>AI Commander with full system access</p>
        <div style={{ background: '#fff', borderRadius: 12, padding: 40, border: '1px solid #e5e1da', textAlign: 'center' }}>
          <p style={{ color: '#999', fontSize: 14 }}>The AI Commander panel is open on the right. Use it to command any system operation.</p>
        </div>
      </div>
    </>
  );
}