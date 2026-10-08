import { validateUrl } from './ssrfProtection.js';

export function crawlUrl(value, hosts) {
  const checked = validateUrl(value, { enforceHttps: true });
  if (!checked.valid) throw new Error(checked.reason);
  const url = new URL(checked.sanitized);
  const host = url.hostname.toLowerCase();
  if (url.username || url.password || (url.port && url.port !== '443') || !host.includes('.') || /\.(local|internal|localhost|test|invalid)$/i.test(host) || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) {
    throw new Error('Use a public HTTPS domain without credentials or a custom port.');
  }
  if (hosts && !hosts.has(host)) throw new Error('Crawl URLs must remain on the requested site.');
  url.hash = '';
  return url;
}

export async function crawlFetch(value, hosts, maxBytes = 1048576) {
  let url = crawlUrl(value, hosts);
  const signal = AbortSignal.timeout(10000);
  for (let hop = 0; hop < 4; hop++) {
    const response = await fetch(url.href, { redirect: 'manual', signal, headers: { 'User-Agent': 'DigitalDominance-SEO-Audit/1.0' } });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error('Redirect did not provide a destination.');
      url = crawlUrl(new URL(location, url).href, hosts);
      continue;
    }
    const declaredSize = Number(response.headers.get('content-length'));
    if (declaredSize > maxBytes) { await response.body?.cancel(); throw new Error('Page exceeds the crawl size limit.'); }
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let size = 0;
    let text = '';
    if (reader) {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > maxBytes) { await reader.cancel(); throw new Error('Page exceeds the crawl size limit.'); }
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
    }
    return { text, status: response.status, url: url.href, contentType: response.headers.get('content-type') || '' };
  }
  throw new Error('Crawl stopped after too many redirects.');
}

function decodeLocation(value) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").trim();
}

export async function sitemapPageUrls(origin, hosts, maxPages) {
  const pending = [new URL('/sitemap.xml', origin).href];
  const visited = new Set();
  const pages = new Set();
  const warnings = [];
  while (pending.length && visited.size < 10 && pages.size < maxPages) {
    const sitemap = pending.shift();
    if (visited.has(sitemap)) continue;
    visited.add(sitemap);
    let result;
    try {
      result = await crawlFetch(sitemap, hosts, 2097152);
      if (result.status !== 200) throw new Error(`Sitemap returned HTTP ${result.status}.`);
    } catch (error) {
      if (visited.size === 1) throw error;
      warnings.push({ sitemap, error: error.message });
      continue;
    }
    const index = /<(?:[\w-]+:)?sitemapindex\b/i.test(result.text);
    for (const match of result.text.matchAll(/<(?:[\w-]+:)?loc\b[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?loc\s*>/gi)) {
      try {
        const url = crawlUrl(decodeLocation(match[1]), hosts).href;
        if (index) { if (pending.length + visited.size < 10 && !visited.has(url)) pending.push(url); }
        else pages.add(url);
      } catch { warnings.push({ sitemap, error: 'Ignored a URL outside the allowed public site.' }); }
      if (pages.size >= maxPages) break;
    }
  }
  return { urls: [...pages], warnings: warnings.slice(0, 20), sitemapLimitReached: visited.size >= 10 };
}