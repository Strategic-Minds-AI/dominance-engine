/**
 * Universal page generator for programmatic SEO.
 * Works for ANY industry — legal, medical, home services, finance, etc.
 * Generates unique AI content per page with local context + internal linking.
 *
 * AI calls route through the Vercel AI Gateway (VERCEL_AI_GATEWAY secret),
 * which bills to the user's Vercel account — NOT Base44 integration credits.
 */
import { gatewayPost } from "./vercelGateway.ts";

export function slugify(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Generate a rich AI content matrix with 16 unique variants per section.
 * Universal — works for any industry, not just legal.
 * Returns { intros, why_hire, faqs, ctas } or null on failure.
 */
export async function generateContentMatrix(keywords, opts = {}) {
  const { tone, industry, brandName, brandDescription } = opts;
  const prompt = `You are an expert SEO content strategist. Generate a content matrix for a programmatic SEO campaign.

${brandName ? `Brand: ${brandName}. ` : ""}${industry ? `Industry: ${industry}. ` : ""}Description: ${brandDescription || "Professional services firm"}
Target keywords/services: ${keywords.join(", ")}
Tone: ${tone || "professional, authoritative, trustworthy"}

Generate 16 unique content variants for each category. Each variant must be substantially different in structure, wording, and angle to satisfy Google's helpful content guidelines — not just synonyms swapped, but genuinely different hooks and value propositions. Use the placeholders {CITY}, {STATE}, {COUNTY}, and {BRAND} where relevant.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "intros": ["16 unique 2-4 sentence intro paragraphs, each with a different hook angle"],
  "why_hire": ["16 unique 3-4 sentence paragraphs, each a different value proposition"],
  "faqs": [[{"question":"...","answer":"..."}, ...5 per array], ...16 arrays total],
  "ctas": ["16 unique 1-2 sentence call-to-action lines, each with a different urgency or benefit angle"]
}`;

  try {
    const data = await gatewayPost("/chat/completions", {
      model: "openai/gpt-6-astra",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 12000,
    }, 180000);
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

/**
 * Build a single page with local context and hash-based variant selection.
 */
export function buildPage(keyword, loc, matrix, opts = {}) {
  const { brandName = "YOUR FIRM", siteUrl = "", launchedSiteId, nearbyCities = [] } = opts;
  const city = loc.city;
  const state = loc.state || "";
  const stateCode = loc.state_code || "";
  const county = loc.county || "";
  const keyStr = keyword + "|" + city + "|" + stateCode;
  const h = hashStr(keyStr);
  const slug = slugify(keyword) + "-in-" + slugify(city) + (stateCode ? "-" + stateCode.toLowerCase() : "");
  const routePath = "/" + slug;
  const title = keyword + " in " + city + (state ? ", " + state : "") + " | Free Consultation";
  const metaDescription = "Looking for " + keyword.toLowerCase() + " in " + city + (state ? ", " + state : "") + "? Get a free consultation today. Experienced, local, and ready to help.";
  const h1 = keyword + " in " + city + (state ? ", " + state : "");

  const introIdx = h % (matrix?.intros?.length || 1);
  const whyIdx = (h >> 3) % (matrix?.why_hire?.length || 1);
  const faqIdx = (h >> 6) % (matrix?.faqs?.length || 1);
  const ctaIdx = (h >> 9) % (matrix?.ctas?.length || 1);

  const fill = (s) => String(s || "")
    .replace(/\{CITY\}/g, city)
    .replace(/\{STATE\}/g, state || "")
    .replace(/\{COUNTY\}/g, county || "")
    .replace(/\{BRAND\}/g, brandName);

  const intro = fill(matrix?.intros?.[introIdx] || "") || `If you need ${keyword.toLowerCase()} in ${city}, ${brandName} is ready to help.`;
  const whyHire = fill(matrix?.why_hire?.[whyIdx] || "") || `Choosing the right ${keyword.toLowerCase()} provider in ${city} matters for your outcome.`;
  const faqSet = (matrix?.faqs?.[faqIdx] || []).map((f) => ({ question: fill(f.question), answer: fill(f.answer) }));
  if (!faqSet.length) {
    faqSet.push(
      { question: `How much do ${keyword.toLowerCase()} services cost in ${city}?`, answer: `We offer free consultations. Contact us for pricing specific to your needs.` },
      { question: `How quickly can I get help in ${city}?`, answer: `We respond quickly. Call today to schedule your consultation.` },
      { question: `What areas do you serve?`, answer: `We serve ${city}${county ? " and " + county + " County" : ""} and surrounding areas.` },
      { question: `What should I bring to my consultation?`, answer: `Bring any relevant documents and questions. We'll guide the conversation.` },
      { question: `Do you offer virtual consultations?`, answer: `Yes, we can meet in person or virtually, whichever works for you.` }
    );
  }
  const cta = fill(matrix?.ctas?.[ctaIdx] || "") || `Call today for your free consultation in ${city}.`;

  const sections = [
    intro,
    `## Why Choose ${brandName} in ${city}?`,
    whyHire,
  ];

  if (nearbyCities.length > 0) {
    sections.push(`## Proudly Serving ${city} and the ${county ? county + " County " : ""}Area`);
    sections.push(`${brandName} serves clients throughout ${city}, ${state || "the region"}${county ? ", including " + county + " County" : ""}, and nearby communities such as ${nearbyCities.slice(0, 5).join(", ")}. Our team knows the local landscape and is committed to delivering results for every client we represent.`);
  } else {
    sections.push(`## Serving ${city}${county ? " & " + county + " County" : ""}`);
    sections.push(`Our team proudly serves clients throughout ${city}, ${state || "the region"}${county ? " and " + county + " County" : ""}. We know the local landscape and are committed to delivering results for every client.`);
  }

  sections.push(`## Take Action Today`);
  sections.push(cta);

  const content = sections.join("\n\n");

  const schema = [
    { "@context": "https://schema.org", "@type": "ProfessionalService", name: `${keyword} — ${city}`, description: metaDescription, areaServed: [{ "@type": "City", name: city }, ...(state ? [{ "@type": "State", name: state }] : [])], url: (siteUrl || "") + routePath },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSet.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
  ];

  return {
    slug, route_path: routePath, keyword: keyword + " " + city, title, meta_description: metaDescription, h1,
    practice_area: keyword, city, state, state_code: stateCode, county,
    content_markdown: content, faq: JSON.stringify(faqSet), schema_json: JSON.stringify(schema),
    canonical_path: routePath, status: "published", ...(launchedSiteId ? { launched_site_id: launchedSiteId } : {}),
  };
}

/**
 * Add internal links to each page — related pages (same keyword in nearby cities,
 * same city different keywords). This distributes authority and speeds Google indexing.
 */
export function addInternalLinks(pages, maxLinks = 5) {
  return pages.map((page) => {
    const related = findRelated(pages, page, maxLinks);
    if (related.length === 0) return page;
    const linksMd = "## Related Resources\n\n" +
      related.map((r) => `- [${r.title}](${r.route_path})`).join("\n");
    return { ...page, content_markdown: page.content_markdown + "\n\n" + linksMd };
  });
}

function findRelated(allPages, currentPage, maxLinks) {
  const sameKeyword = allPages.filter((p) =>
    p.slug !== currentPage.slug &&
    p.practice_area === currentPage.practice_area &&
    p.state_code === currentPage.state_code &&
    p.city !== currentPage.city
  ).slice(0, 3);

  const sameCity = allPages.filter((p) =>
    p.slug !== currentPage.slug &&
    p.city === currentPage.city &&
    p.practice_area !== currentPage.practice_area
  ).slice(0, 2);

  return [...sameKeyword, ...sameCity].slice(0, maxLinks);
}

/**
 * Compute nearby cities from the locations list for local context.
 */
export function getNearbyCities(locations, currentCity, stateCode, maxCities = 5) {
  return locations
    .filter((l) => l.city !== currentCity && l.state_code === stateCode)
    .slice(0, maxCities)
    .map((l) => l.city);
}