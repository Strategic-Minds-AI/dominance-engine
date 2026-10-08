import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Send, Crown, Share2, TrendingUp, DollarSign, Shield, Code, Copy, Network,
  Sparkles, ChevronRight, Wrench, Check, X, Clock,
} from "lucide-react";
import { AGENT_LIST } from "@/lib/agentMetadata";

const ICONS = { Crown, Share2, TrendingUp, DollarSign, Shield, Code, Copy, Network };

export default function PortalAgents({ site }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const requestKeyRef = useRef("");

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const res = await base44.entities.AgentTask.filter(
        { launched_site_id: site.id },
        { sort: "-created_date", limit: 30 }
      );
      setTasks(res.items || []);
    } catch { setTasks([]); }
    finally { setTasksLoading(false); }
  }, [site.id]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async (agentId) => {
    setSelectedAgent(agentId);
    setConversation(null);
    setMessages([]);
    setError("");
    try {
      const res = await base44.functions.invoke("runGatewayChat", {
        action: "start",
        agent_name: agentId,
        launched_site_id: site.id,
      });
      setConversation(res.data?.conversation);
    } catch (e) { setError(e.message); }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    setError("");

    const userMsg = { id: "temp-" + Date.now(), role: "user", content };
    setMessages((m) => [...m, userMsg]);

    requestKeyRef.current = crypto.randomUUID?.() || String(Date.now());

    try {
      const res = await base44.functions.invoke("runGatewayChat", {
        action: "send",
        conversation_id: conversation.id,
        request_key: requestKeyRef.current,
        content,
      });
      const data = res.data;
      if (data?.assistant_message) {
        const assistantMsg = {
          id: data.assistant_message.id,
          role: "assistant",
          content: data.assistant_message.content,
          tool_calls: (() => { try { return JSON.parse(data.assistant_message.tool_calls || "[]"); } catch { return []; } })(),
        };
        setMessages((m) => [...m, assistantMsg]);
      }
      if (data?.error) setError(data.error);
      loadTasks();
    } catch (e) {
      setError(e.message);
      setMessages((m) => [...m, { id: "err", role: "assistant", content: `Error: ${e.message}` }]);
    } finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-xl font-bold uppercase">Super Agents</h3>
        <p className="text-xs text-muted-foreground mt-1">A fleet of 8 specialized AI agents — each with real tools to read, write, and act on your data. Chat with any agent to get work done.</p>
      </div>

      {!selectedAgent && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AGENT_LIST.map((agent) => {
            const Icon = ICONS[agent.icon] || Sparkles;
            return (
              <button
                key={agent.id}
                onClick={() => startConversation(agent.id)}
                className="border border-border p-5 text-left hover:border-foreground transition-colors group"
              >
                <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-3" style={{ backgroundColor: agent.color }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-heading text-sm font-bold leading-tight">{agent.label}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{agent.tagline}</p>
                <div className="flex items-center gap-1 mt-3 text-[10px] tracking-[0.15em] uppercase text-crimson opacity-0 group-hover:opacity-100 transition-opacity">
                  Start chat <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedAgent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => { setSelectedAgent(null); setConversation(null); setMessages([]); }} className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground">
              ← All agents
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Connected to</span>
              <span className="text-xs font-medium">{site.name}</span>
            </div>
          </div>

          <div className="border border-border min-h-[300px] max-h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">Send a message to start working with this agent.</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                <div className={m.role === "user" ? "max-w-[80%] bg-foreground text-background p-3 text-sm" : "max-w-[80%] border border-border p-3 text-sm"}>
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] tracking-[0.15em] uppercase text-crimson">
                      <Sparkles className="w-3 h-3" /> {AGENT_LIST.find(a => a.id === selectedAgent)?.label}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  {m.tool_calls && m.tool_calls.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground flex items-center gap-1"><Wrench className="w-3 h-3" /> Tool calls ({m.tool_calls.length})</p>
                      {m.tool_calls.map((tc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {tc.status === "completed" ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-destructive" />}
                          <code className="text-muted-foreground">{tc.name}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Agent is thinking…
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask the agent to do anything — create social posts, audit SEO, write copy, manage leads…"
              rows={2}
              className="flex-1 border border-border p-3 text-sm outline-none focus:border-primary resize-none"
            />
            <button onClick={sendMessage} disabled={sending || !input.trim()} className="inline-flex items-center gap-2 px-4 py-3 bg-foreground text-background text-xs tracking-[0.15em] uppercase hover:opacity-90 disabled:opacity-40">
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-border">
        <h4 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">Agent Task Queue</h4>
        {tasksLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> :
         tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks dispatched yet. Chat with an agent to create tasks.</p> :
         <div className="space-y-2">
           {tasks.map((t) => (
             <div key={t.id} className="border border-border p-3 flex items-center gap-3">
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium truncate">{t.title}</p>
                 {t.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{t.description}</p>}
               </div>
               <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground shrink-0">{t.agent_name}</span>
               <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 shrink-0 ${
                 t.status === "completed" ? "bg-foreground text-background" :
                 t.status === "in_progress" ? "bg-primary text-paper" :
                 t.status === "needs_approval" ? "bg-crimson text-paper" :
                 t.status === "failed" ? "bg-destructive text-destructive-foreground" :
                 "border border-border"
               }`}>{t.status}</span>
               {t.autonomous && <span className="text-[10px] tracking-[0.15em] uppercase text-emerald-600 shrink-0 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> auto</span>}
             </div>
           ))}
         </div>
        }
      </div>
    </div>
  );
}