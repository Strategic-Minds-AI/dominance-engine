import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const StatusIcon = ({ status }) => {
  if (["completed", "success"].includes(status)) return <span className="text-emerald-400">✓</span>;
  if (["failed", "error"].includes(status)) return <span className="text-red-400">✕</span>;
  if (["pending", "running", "in_progress"].includes(status)) return <span className="text-[#00f2ff] animate-pulse">◐</span>;
  return <span className="text-white/30">•</span>;
};

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const proj = toolCall.display_projection || {};
  const hide = proj.hide_details && proj.details_redacted;
  const label = proj.label || toolCall.name;
  const activeLabel = proj.active_label || label;
  const errorLabel = proj.error_label || label;
  const status = toolCall.status;
  const displayLabel = ["failed", "error"].includes(status) ? errorLabel : ["pending", "running", "in_progress"].includes(status) ? activeLabel : label;

  let parsedArgs = toolCall.arguments_string;
  try { parsedArgs = JSON.parse(toolCall.arguments_string); } catch (e) {}
  let parsedResults = toolCall.results;
  try { if (typeof toolCall.results === "string") parsedResults = JSON.parse(toolCall.results); } catch (e) {}

  return (
    <div className="mt-2 text-xs border border-white/10 rounded-lg bg-black/30 overflow-hidden">
      <button onClick={() => !hide && setExpanded(!expanded)} className={`w-full flex items-center gap-2 px-3 py-2 text-left ${hide ? "cursor-default" : "hover:bg-white/5"}`}>
        <StatusIcon status={status} />
        <span className="font-semibold text-white/70">{displayLabel}</span>
        {!hide && <span className="ml-auto text-white/30">{expanded ? "▴" : "▾"}</span>}
      </button>
      {expanded && !hide && (
        <div className="px-3 pb-3 space-y-2">
          {parsedArgs && (
            <div>
              <div className="font-semibold text-white/40 mb-1">Parameters</div>
              <pre className="bg-black/40 border border-white/10 rounded p-2 overflow-x-auto text-[11px] text-white/70">{JSON.stringify(parsedArgs, null, 2)}</pre>
            </div>
          )}
          {parsedResults != null && (
            <div>
              <div className="font-semibold text-white/40 mb-1">Result</div>
              <pre className="bg-black/40 border border-white/10 rounded p-2 overflow-x-auto text-[11px] text-white/70">{typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "" : "w-full"}`}>
        <div className={`rounded-2xl px-4 py-3 ${isUser ? "bg-[#00f2ff] text-black rounded-br-md" : "dd-panel text-white rounded-bl-md"}`}>
          {message.content && (isUser
            ? <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            : <div className="prose prose-invert prose-sm max-w-none prose-headings:font-heading prose-headings:text-white prose-a:text-[#00f2ff] prose-strong:text-white"><ReactMarkdown>{message.content}</ReactMarkdown></div>)}
        </div>
        {message.tool_calls?.length > 0 && (
          <div className="mt-1 space-y-1">
            {message.tool_calls.map((tc, i) => <FunctionDisplay key={i} toolCall={tc} />)}
          </div>
        )}
      </div>
    </div>
  );
}