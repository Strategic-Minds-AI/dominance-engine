import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

// ═══════════════════════════════════════════════════════════════════════════
// pingIndex — IndexNow accelerator.
//
// Pings IndexNow (Bing, Yandex, and the central IndexNow API) with the full
// URL list of one or more deployed websites so indexers crawl them within
// minutes instead of waiting on passive discovery. Generates a per-site
// key + key-file content the operator must host at /<key>.txt for ownership
// validation. No integration credits required.
//
// Accepts: { website_ids: string[], domains: string[] }
// ═══════════════════════════════════════════════════════════════════════════

const INDEXNOW_HOSTS = [
  "https://api.indexnow.org/IndexNow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

function genKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function cleanDomain(d: string): string {
  return String(d || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim();
}

async function pingHost(host: string, body: any): Promise<any> {
  try {
    const res = await fetch(host, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    return { host, status: res.status, ok: res.status >= 200 && res.status < 300 };
  } catch (e: any) {
    return { host, status: 0, ok: false, error: e.message };
  }
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin")
      return Response.json({ error: "Forbidden — admin only" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { website_ids = [], domains = [] } = body;

    const work: any[] = [];

    for (const id of website_ids) {
      try {
        const site: any = await base44.entities.Website.get(id);
        const domain = cleanDomain(site.deploy_url || site.domain_candidate || "");
        if (!domain) continue;
        const pageRes: any = await base44.entities.GeneratedPage.filter(
          { website_id: id },
          { limit: 100 }
        );
        const pages = pageRes.items || [];
        const urls =
          pages.length > 0
            ? pages.map((p: any) => `https://${domain}${p.slug ? "/" + p.slug : "/"}`)
            : [`https://${domain}/`];
        work.push({ website_id: id, domain, urls, site });
      } catch (_e) {
        /* skip missing site */
      }
    }
    for (const d of domains) {
      const domain = cleanDomain(d);
      if (domain) work.push({ domain, urls: [`https://${domain}/`] });
    }

    if (!work.length)
      return Response.json({ error: "No valid websites/domains to ping" }, { status: 400 });
    if (work.length > 50)
      return Response.json({ error: "Max 50 sites per ping call" }, { status: 400 });

    const results: any[] = [];
    for (const w of work) {
      const key = genKey();
      const keyFileUrl = `https://${w.domain}/${key}.txt`;
      const pingBody = {
        host: w.domain,
        key,
        keyLocation: keyFileUrl,
        urlList: w.urls,
      };
      const hostResults = await Promise.all(
        INDEXNOW_HOSTS.map((h) => pingHost(h, pingBody))
      );
      const okCount = hostResults.filter((r) => r.ok).length;
      results.push({
        domain: w.domain,
        website_id: w.website_id || null,
        key,
        keyFileUrl,
        keyFileContent: key,
        urls: w.urls.length,
        ok: okCount,
        hosts: hostResults,
      });

      // Persist the key + ping result on the website
      if (w.website_id) {
        try {
          const prev: any = w.site.provision_state || {};
          await base44.entities.Website.update(w.website_id, {
            provision_state: {
              ...prev,
              indexnow: {
                key,
                keyFileUrl,
                keyFileContent: key,
                pinged_at: new Date().toISOString(),
                hosts: hostResults,
              },
            },
          });
        } catch (_e) {
          /* non-fatal */
        }
      }
    }

    const totalOk = results.filter((r) => r.ok > 0).length;
    return Response.json({
      ok: true,
      pinged: results.length,
      sites_with_at_least_one_ok: totalOk,
      results,
      note: "IndexNow pings sent to Bing, Yandex and the IndexNow API. For the ping to validate, host each site's key file at its keyFileUrl (deploy the keyFileContent as <key>.txt at the site root). Google discovers via sitemap submission + crawl; use the Google Search Console connector for direct URL inspection.",
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}