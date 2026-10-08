/**
 * Extracts all image URLs from a TemplatePack's manifest, brand_tokens,
 * and preview_html so they can be displayed as a gallery and expanded
 * to full resolution.
 */

function safeParse(s) {
  try {
    return typeof s === "string" ? JSON.parse(s) : s || {};
  } catch {
    return {};
  }
}

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/i;
const IMAGE_HOSTS = /(media\.base44|unsplash|images?\.[\w-]+\.|cloudinary|amazonaws|wixstatic|imgur|githubusercontent|\.storage\.|googleapis)/i;
const URL_KEYS = /^(url|src|image|image_url|photo|photo_url|logo|logo_url|hero|hero_url|background|background_url|icon|icon_url|preview|preview_url|thumbnail|thumb)$/i;

export function extractPackImages(pack) {
  const urls = new Set();

  const add = (u) => {
    if (typeof u !== "string") return;
    let t = u.trim();
    if (!t || !/^https?:\/\//i.test(t)) return;
    // Force HTTPS to prevent mixed-content blocking on the live site
    t = t.replace(/^http:\/\//i, "https://");
    if (IMAGE_EXT.test(t) || IMAGE_HOSTS.test(t)) urls.add(t);
  };

  const scan = (obj) => {
    if (!obj) return;
    if (typeof obj === "string") { add(obj); return; }
    if (Array.isArray(obj)) { obj.forEach(scan); return; }
    if (typeof obj === "object") {
      for (const k in obj) {
        const v = obj[k];
        if (typeof v === "string" && URL_KEYS.test(k)) add(v);
        else scan(v);
      }
    }
  };

  scan(safeParse(pack?.manifest));
  scan(safeParse(pack?.brand_tokens));

  // Also extract <img src="..."> and url(...) from preview HTML
  if (pack?.preview_html) {
    const srcRe = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = srcRe.exec(pack.preview_html))) add(m[1]);
    const cssRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
    while ((m = cssRe.exec(pack.preview_html))) add(m[1]);
  }

  return [...urls];
}