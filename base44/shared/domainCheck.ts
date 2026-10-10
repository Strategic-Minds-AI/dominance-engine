// Shared domain availability check utilities.
// Uses Google DNS-over-HTTPS (free, no API key) as primary check,
// with optional Vercel/GoDaddy price enrichment.

export async function checkDns(domain: string): Promise<{ available: boolean | null; registered: boolean }> {
  try {
    // Check NS records first
    const r = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`);
    if (!r.ok) return { available: null, registered: false };
    const data: any = await r.json();
    // Status 0 = NOERROR (has records), Status 3 = NXDOMAIN (doesn't exist)
    if (data.Status === 3) return { available: true, registered: false };
    if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
      return { available: false, registered: true };
    }
    // No Answer but NOERROR — could be registered without NS, check A records
    const r2 = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    if (!r2.ok) return { available: null, registered: false };
    const data2: any = await r2.json();
    if (data2.Status === 3) return { available: true, registered: false };
    if (data2.Status === 0 && data2.Answer && data2.Answer.length > 0) {
      return { available: false, registered: true };
    }
    // No records found at all — likely available
    return { available: true, registered: false };
  } catch {
    return { available: null, registered: false };
  }
}

export async function checkVercel(domain: string, token: string, teamId?: string) {
  try {
    const qs = teamId ? `?teamId=${teamId}` : '';
    const r = await fetch(`https://api.vercel.com/v1/registrar/domains/${domain}/availability${qs}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!r.ok) return { available: null, price: 0 };
    const data = await r.json();
    return { available: !!data.available, price: data.price || 0 };
  } catch {
    return { available: null, price: 0 };
  }
}

export async function checkGoDaddy(domain: string, key: string, secret: string) {
  try {
    const r = await fetch(`https://api.godaddy.com/v1/domains/available?domain=${domain}`, { headers: { 'Authorization': `sso-key ${key}:${secret}` } });
    if (!r.ok) return { available: null, price: 0 };
    const data = await r.json();
    return { available: !!data.available, price: data.price ? data.price / 1000000 : 0 };
  } catch {
    return { available: null, price: 0 };
  }
}

export function generateAlternatives(domain: string): string[] {
  const parts = domain.split('.');
  const name = parts[0];
  const tlds = ['net', 'org', 'io', 'co'];
  return tlds.map((t) => `${name}.${t}`).slice(0, 4);
}

export async function checkSingleDomain(
  domain: string,
  vercelToken?: string,
  teamId?: string,
  godaddyKey?: string,
  godaddySecret?: string
): Promise<{ available: boolean; price: number; source: string }> {
  // Try Vercel first (gives price), then GoDaddy, then free Google DNS
  if (vercelToken) {
    const v = await checkVercel(domain, vercelToken, teamId);
    if (v.available !== null) {
      return { available: v.available, price: v.price, source: 'vercel' };
    }
  }
  if (godaddyKey && godaddySecret) {
    const g = await checkGoDaddy(domain, godaddyKey, godaddySecret);
    if (g.available !== null) {
      return { available: g.available, price: g.price, source: 'godaddy' };
    }
  }
  // Free Google DNS-over-HTTPS — no API key needed
  const dns = await checkDns(domain);
  if (dns.available !== null) {
    return { available: dns.available, price: 0, source: 'dns' };
  }
  throw new Error('Unable to verify domain availability. Please try again.');
}