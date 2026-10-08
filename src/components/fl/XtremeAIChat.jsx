import { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Bot, Plus, MessageSquare, ChevronRight, X } from 'lucide-react';

const SUGGESTIONS = [
  { label: 'Generate a 30-day social campaign', prompt: 'Generate a 30-day social media campaign for my latest site', icon: Bot },
  { label: 'Show me my recent sites', prompt: 'Show me my recent launched sites', icon: MessageSquare },
  { label: 'Analyze my SEO performance', prompt: 'Analyze my SEO performance across all sites', icon: Bot },
];

export default function XtremeAIChat({ expanded, onToggle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (content) => {
    if (!content?.trim() || loading) return;
    setInput('');
    setLoading(true);
    setError('');
    setMessages(prev => [...prev, { role: 'user', content }]);
    try {
      const res = await base44.functions.invoke('runGatewayChat', { message: content, agent_name: 'orchestrator' });
      const reply = res.data?.content || res.data?.message || res.data || 'Done.';
      setMessages(prev => [...prev, { role: 'assistant', content: typeof reply === 'string' ? reply : JSON.stringify(reply) }]);
    } catch (e) {
      setError(e.message);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  if (!expanded) {
    return (
      <button onClick={() => onToggle(true)} style={{
        position: 'fixed', right: 20, bottom: 80, zIndex: 100,
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #E7C86E, #C89B3C)',
        border: '3px solid #fff', boxShadow: '0 8px 24px rgba(200,155,60,.4)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#111',
      }} title="Open AI Commander">
        <Bot size={24} />
      </button>
    );
  }

  return (
    <>
      <div onClick={() => onToggle(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 99, display: window.innerWidth < 900 ? 'block' : 'none' }} />
      <aside style={{
        position: 'fixed', right: 0, top: 60, bottom: 0, width: 420, zIndex: 100,
        background: '#f7f7f5', borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,.08)',
      }}>
        <div style={{ background: '#0a0a0a', color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #E7C86E, #C89B3C)', display: 'grid', placeItems: 'center', color: '#111' }}>
            <Bot size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 14, fontFamily: "'Libre Caslon Display', serif" }}>Xtreme Commander</b>
            <p style={{ fontSize: 10, color: '#888', margin: 0 }}>Full-access AI · read · write · execute</p>
          </div>
          <button onClick={() => onToggle(false)} style={{ background: 'none', border: '1px solid #333', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 16px', background: 'linear-gradient(135deg, #E7C86E, #C89B3C)', display: 'grid', placeItems: 'center', color: '#111' }}>
                <Bot size={28} />
              </div>
              <h3 style={{ fontFamily: "'Libre Caslon Display', serif", fontSize: 22, margin: '0 0 6px' }}>Xtreme Commander</h3>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.5 }}>
                I have full access to every function in this system — cloning, editing, queue management, discovery, generation, deployment, and more.
              </p>
              <div style={{ display: 'grid', gap: 8, textAlign: 'left' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.prompt)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                    background: '#fff', border: '1px solid #e5e1da', borderRadius: 8,
                    cursor: 'pointer', textAlign: 'left', fontSize: 12, color: '#555',
                  }}>
                    <s.icon size={15} style={{ color: '#C89B3C' }} />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
              <div style={{
                maxWidth: '85%', padding: '12px 14px', borderRadius: 10,
                background: msg.role === 'user' ? '#0a0a0a' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                border: msg.role === 'user' ? 'none' : '1px solid #e5e1da',
                fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 14 }}>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#fff', border: '1px solid #e5e1da', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888' }}>
                <Loader2 size={14} className="animate-spin" style={{ color: '#C89B3C' }} />
                <span>Working on it…</span>
              </div>
            </div>
          )}
          {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f5d8d5', border: '1px solid #C63D34', fontSize: 12, color: '#a52d23', marginBottom: 14 }}>{error}</div>}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: 12, background: '#fff', borderTop: '1px solid #ddd', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Command me to do anything…"
              rows={1}
              style={{
                flex: 1, padding: '12px 14px', border: '1px solid #ddd', borderRadius: 8,
                fontSize: 13, resize: 'none', outline: 'none', maxHeight: 120, minHeight: 42, lineHeight: 1.4,
                background: '#f8f7f4',
              }}
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{
              width: 42, height: 42, borderRadius: 8, border: 0, cursor: loading ? 'wait' : 'pointer',
              background: !input.trim() || loading ? '#ccc' : '#0a0a0a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}