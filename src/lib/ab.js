import { base44 } from "@/api/base44Client";

const VARIANT_KEY = "jf_variant";
const SESSION_KEY = "jf_sid";

export function getSessionId() {
  try {
    let s = localStorage.getItem(SESSION_KEY);
    if (!s) {
      s = (crypto?.randomUUID?.() || String(Date.now() + Math.random()));
      localStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return String(Date.now() + Math.random());
  }
}

export function getVariant() {
  try { return localStorage.getItem(VARIANT_KEY) || null; } catch { return null; }
}

export function setVariant(slug) {
  try { localStorage.setItem(VARIANT_KEY, slug); } catch { /* */ }
}

export function pickWeighted(items) {
  const total = items.reduce((a, b) => a + (b.weight || 0), 0);
  if (total <= 0) return items[0];
  let r = Math.random() * total;
  for (const it of items) {
    r -= (it.weight || 0);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

export async function recordVisit(slug, versionId = "", isControl = false) {
  try {
    await base44.entities.Visit.create({
      slug,
      version_id: versionId || "",
      session_id: getSessionId(),
      is_control: !!isControl,
    });
  } catch {
    /* analytics — never block rendering */
  }
}