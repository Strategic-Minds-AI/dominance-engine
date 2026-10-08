export default async function (req) {
  try {
    const base = (new URL(req.url).searchParams.get("site") || "https://scale-dominance.base44.app").replace(/\/$/, "");
    const txt =
      "User-agent: *\n" +
      "Allow: /\n" +
      "Disallow: /admin\n" +
      "Disallow: /login\n" +
      "Disallow: /register\n" +
      "Disallow: /forgot-password\n" +
      "Disallow: /reset-password\n" +
      "\n" +
      `Sitemap: ${base}/functions/seoSitemap?site=${encodeURIComponent(base)}\n`;
    return new Response(txt, { status: 200, headers: { "Content-Type": "text/plain" } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}