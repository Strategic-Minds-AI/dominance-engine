// Shared logic for page generation via Vercel AI Gateway.
// Used by generatePage (single page) and processGenerationQueue (batch).

const AI_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-6-astra';

export function buildGenerationPrompt(website: any, location: string, service: string, rulesText: string): string {
  return `You are a programmatic SEO expert. Generate a complete, Google-compliant HTML page by adapting the template below for the location "${location}" and service "${service}".

TEMPLATE HTML:
${website.preview_html || '(no template provided — create from scratch)'}

BRAND TOKENS:
${website.brand_tokens || '(none provided)'}

GOOGLE COMPLIANCE RULES (follow ALL of these):
${rulesText}

REQUIREMENTS:
1. Adapt the template for ${location} and ${service} — do NOT just swap tokens. Each section must have genuinely different content.
2. Include real local specifics about ${location} (landmarks, neighborhoods, local context, nearby areas).
3. Make the content genuinely unique and valuable for this specific location+service combination.
4. Include proper <title> tag, <meta name="description">, <link rel="canonical">, and structured data (schema.org LocalBusiness or Service).
5. Ensure mobile-first responsive design with proper viewport meta tag.
6. Include internal links to related pages (e.g., /{location}/{other-services}).
7. Demonstrate E-E-A-T signals (expertise, experience, authority, trust).
8. Return ONLY the complete HTML document. No markdown, no code fences, no explanations.`;
}

export async function callAIGateway(prompt: string, apiKey: string, model?: string): Promise<string> {
  const response = await fetch(AI_GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI Gateway error: ${response.status} — ${errText.substring(0, 500)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function checkCompliance(htmlContent: string, rulesText: string, apiKey: string, model?: string): Promise<{ score: number; notes: string }> {
  const prompt = `You are a Google compliance auditor. Score this HTML page against these rules. Return ONLY a JSON object (no markdown, no code fences) with "score" (integer 0-100) and "notes" (one sentence per critical rule: pass or fail).

RULES:
${rulesText}

HTML PAGE (first 8000 chars):
${htmlContent.substring(0, 8000)}

Return ONLY: {"score": 85, "notes": "..."}`;

  try {
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) return { score: 0, notes: 'Compliance check failed' };

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { score: parsed.score || 0, notes: parsed.notes || '' };
    }
    return { score: 0, notes: 'Compliance check: unparseable response' };
  } catch {
    return { score: 0, notes: 'Compliance check skipped' };
  }
}

export function makeSlug(location: string, service: string): string {
  const loc = String(location).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const svc = String(service).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${loc}/${svc}`;
}

export function makeCompositeKey(websiteId: string, location: string, service: string): string {
  return `${websiteId}::${location}::${service}`;
}

export function rulesToText(rules: any[]): string {
  return (rules || []).map((r: any) => `- ${r.rule_name}: ${r.rule_description}`).join('\n');
}