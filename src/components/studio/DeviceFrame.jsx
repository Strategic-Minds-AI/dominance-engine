import React from "react";

export default function DeviceFrame({ type = "browser", designW, designH, displayW = 320, children }) {
  const scale = displayW / designW;
  const displayH = Math.round(designH * scale);
  const screen = (
    <div style={{ width: displayW, height: displayH, overflow: "hidden", position: "relative", background: "#fff" }}>
      <div style={{ width: designW, height: designH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
  if (type === "phone") {
    return (
      <div style={{ padding: 6, background: "#0f172a", borderRadius: 22, boxShadow: "0 10px 24px rgba(0,0,0,.18)", display: "inline-block" }}>
        <div style={{ width: displayW, height: displayH, borderRadius: 16, overflow: "hidden", background: "#fff" }}>{screen}</div>
      </div>
    );
  }
  return (
    <div style={{ width: displayW, borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,.10)", border: "1px solid #e2e8f0", background: "#fff" }}>
      <div style={{ height: 22, background: "#f1f5f9", display: "flex", alignItems: "center", gap: 5, padding: "0 9px", borderBottom: "1px solid #e2e8f0" }}>
        <span style={{ width: 7, height: 7, borderRadius: 9999, background: "#ef4444" }} />
        <span style={{ width: 7, height: 7, borderRadius: 9999, background: "#f59e0b" }} />
        <span style={{ width: 7, height: 7, borderRadius: 9999, background: "#22c55e" }} />
      </div>
      {screen}
    </div>
  );
}