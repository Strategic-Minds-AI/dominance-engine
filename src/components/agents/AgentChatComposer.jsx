import React from 'react';
import { Send } from 'lucide-react';

export default function AgentChatComposer({ label, input, setInput, send, disabled }) {
  return (
    <div className="border-t border-white/10 bg-black/40 p-4">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
          placeholder={`Message ${label}…`}
          aria-label={`Message ${label}`}
          disabled={disabled}
          maxLength={6000}
          rows={1}
          className="dd-input flex-1 resize-none max-h-32 py-3"
        />
        <button onClick={send} disabled={!input.trim() || disabled} aria-label="Send message" className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-[#00f2ff] text-black transition hover:bg-[#00d4ff] disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}