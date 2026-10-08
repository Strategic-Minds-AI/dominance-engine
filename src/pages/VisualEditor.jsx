import React, { useState, useCallback, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Send, Loader2, Monitor, Tablet, Smartphone, Code, Eye, Save, Sparkles, ArrowLeft } from "lucide-react";
import FactoryEditorContext from "@/components/factory/FactoryEditorContext";

const INITIAL_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #737373; }
.placeholder { text-align: center; padding: 2rem; }
.placeholder h1 { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
.placeholder p { font-size: 0.875rem; }
</style>
</head>
<body>
<div class="placeholder">
  <h1>Visual Editor</h1>
  <p>Describe what you want to build in the chat panel.</p>
</div>
</body>
</html>`;

const DEVICE_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "375px" };

export default function VisualEditor() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Describe what you want to build and I'll create it live in the preview." },
  ]);
  const [html, setHtml] = useState(INITIAL_HTML);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState("desktop");
  const [view, setView] = useState("visual");
  const scrollRef = useRef(null);
  const factoryId = new URLSearchParams(window.location.search).get("factory");
  const [factoryDefinition, setFactoryDefinition] = useState(null);
  const [factoryLoading, setFactoryLoading] = useState(Boolean(factoryId));
  const [factoryError, setFactoryError] = useState("");

  useEffect(() => {
    if (!factoryId) return;
    let active = true;
    setFactoryLoading(true);
    base44.entities.GeneratorDefinition.get(factoryId).then((definition) => {
      if (definition?.definition?.factory_origin !== "universal_factory") throw new Error("This is not a Universal Factory draft.");
      if (!active) return;
      setFactoryDefinition(definition);
      setInput("Create a responsive design preview from the linked factory blueprint.");
      setMessages([{ role: "assistant", content: `Factory draft loaded: ${definition.name}. Send the prepared request to generate a preview; no external services or public release will be activated.` }]);
    }).catch((error) => { if (active) setFactoryError(error.message); }).finally(() => { if (active) setFactoryLoading(false); });
    return () => { active = false; };
  }, [factoryId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = useCallback(async (text) => {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    setInput("");
    try {
      const response = await base44.functions.invoke("chatEdit", {
        message: text,
        current_html: html,
        history: messages,
        ...(factoryDefinition ? { factory_definition_id: factoryDefinition.id } : {}),
      });
      const res = response.data;
      if (res.error) throw new Error(res.error);
      if (res.action === "edit" && res.html) {
        setHtml(res.html);
      }
      setMessages([...newMessages, { role: "assistant", content: res.message || "Done." }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }, [messages, html, factoryDefinition]);

  const handleSave = async () => {
    const name = window.prompt("Name this design:", "Untitled Design");
    if (!name) return;
    setSaving(true);
    try {
      await base44.entities.TemplatePack.create({
        name,
        kind: "mockup",
        preview_html: html,
        status: "pending_review",
        source: "manual",
        ...(factoryDefinition ? { manifest: JSON.stringify({ factory_definition_id: factoryDefinition.id, build_spec_hash: factoryDefinition.definition.build_spec_hash, scope: "design_preview", validation: "NOT_TESTED" }) } : {}),
      });
      setMessages((m) => [...m, { role: "assistant", content: `Saved "${name}" to Studio for review.` }]);
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || loading || factoryLoading || (factoryId && !factoryDefinition)) return;
    handleSend(input.trim());
  };

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col lg:flex-row">
      {/* Chat Panel */}
      <div className="flex w-full flex-col border-b border-white/10 lg:w-[400px] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#00f2ff]" />
            <span className="text-sm font-semibold uppercase tracking-widest text-white/80">AI Builder</span>
          </div>
          <Link to="/admin" className="flex items-center gap-1 text-xs text-white/40 hover:text-white">
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
        </div>
        {factoryId && <FactoryEditorContext generator={factoryDefinition} error={factoryError} loading={factoryLoading} />}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-[#00f2ff]/15 text-[#00d4ff]" : "bg-white/5 text-white/80"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/50">
                <Loader2 className="h-4 w-4 animate-spin" /> Building...
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              placeholder="Describe a change or ask to build something..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#00f2ff]/50 placeholder:text-white/30"
              disabled={loading || factoryLoading || (Boolean(factoryId) && !factoryDefinition)}
            />
            <button type="submit" disabled={loading || !input.trim() || factoryLoading || (Boolean(factoryId) && !factoryDefinition)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00f2ff] text-black disabled:opacity-40">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#05070a]">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <div className="flex items-center gap-1">
            <button onClick={() => setView("visual")} className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${view === "visual" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
              <Eye className="h-3.5 w-3.5" /> Visual
            </button>
            <button onClick={() => setView("code")} className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${view === "code" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
              <Code className="h-3.5 w-3.5" /> Code
            </button>
          </div>
          <div className="flex items-center gap-1">
            {view === "visual" && Object.entries(DEVICE_WIDTHS).map(([d, w]) => (
              <button key={d} onClick={() => setDevice(d)} className={`flex h-8 w-8 items-center justify-center rounded ${device === d ? "bg-[#00f2ff]/15 text-[#00f2ff]" : "text-white/40 hover:text-white"}`}>
                {d === "desktop" ? <Monitor className="h-4 w-4" /> : d === "tablet" ? <Tablet className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
              </button>
            ))}
            <button onClick={handleSave} disabled={saving} className="ml-2 flex items-center gap-1.5 rounded-lg border border-[#00f2ff]/30 bg-[#00f2ff]/5 px-3 py-1.5 text-xs text-[#00f2ff] hover:bg-[#00f2ff]/10 disabled:opacity-50">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center">
          {view === "visual" ? (
            <div style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%" }} className="h-full overflow-hidden rounded-lg border border-white/10 bg-white transition-all">
              <iframe srcDoc={html} className="h-full w-full border-0" title="preview" sandbox="allow-same-origin" />
            </div>
          ) : (
            <pre className="w-full overflow-auto text-xs text-white/60"><code>{html}</code></pre>
          )}
        </div>
      </div>
    </div>
  );
}