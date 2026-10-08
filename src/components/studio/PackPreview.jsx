import React from "react";
import DeviceFrame from "./DeviceFrame";

function safeParse(s) {
  try { return typeof s === "string" ? JSON.parse(s) : s || {}; } catch { return {}; }
}
function esc(s) {
  return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function fallbackHtml(pack) {
  const t = safeParse(pack.brand_tokens);
  const colors = t.colors || {};
  const logo = t.logo_url;
  const bg = colors.background || "#ffffff";
  const text = colors.text || "#0a0d0f";
  const accent = colors.accent || colors.primary || "#df2a2a";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;font-family:Inter,Arial,sans-serif;background:${bg};color:${text}}
    .w{padding:64px 72px}
    .tag{font-size:13px;letter-spacing:.25em;text-transform:uppercase;color:${accent};margin-bottom:20px}
    h1{font-family:Spectral,Georgia,serif;font-size:60px;margin:0 0 20px;font-weight:400;line-height:1.05}
    p{font-size:19px;opacity:.7;max-width:620px;line-height:1.5}
    .swatches{display:flex;gap:12px;margin-top:36px}
    .sw{width:54px;height:54px;border-radius:8px;border:1px solid rgba(0,0,0,.08)}
  </style></head><body><div class="w">
    ${logo ? `<img src="${esc(logo)}" alt="logo" style="height:44px;margin-bottom:32px"/>` : ""}
    <div class="tag">${esc(pack.kind.replace("_", " "))}</div>
    <h1>${esc(pack.name)}</h1>
    <p>${esc(pack.description || "Add preview HTML to render the full mockup.")}</p>
    <div class="swatches">
      ${[accent, colors.secondary || "#001a70", text, bg].map((c) => `<div class="sw" style="background:${c}"></div>`).join("")}
    </div>
  </div></body></html>`;
}

export default function PackPreview({ pack, displayW = 300, frame = "browser", designH = 820 }) {
  const html = pack.preview_html || fallbackHtml(pack);
  return (
    <DeviceFrame type={frame} designW={1280} designH={designH} displayW={displayW}>
      <iframe title={pack.name || "preview"} srcDoc={html} sandbox="allow-same-origin" loading="lazy" style={{ width: 1280, height: designH, border: 0, background: "#fff" }} />
    </DeviceFrame>
  );
}