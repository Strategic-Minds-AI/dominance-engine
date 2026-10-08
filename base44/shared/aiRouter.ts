import { gatewayCompletion } from './vercelGateway.ts';

// INTELLIGENT AI ROUTER — picks the best Vercel AI Gateway model for each task.
// Vercel AI Gateway only; no Base44 AI fallback.

export type TaskType =
  | 'planning'
  | 'code_generation'
  | 'content_writing'
  | 'sales_outreach'
  | 'social_content'
  | 'template_generation'
  | 'seo_audit'
  | 'web_search'
  | 'quick_json'
  | 'complex_reasoning'
  | 'summarization';

interface ModelConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
  label: string;
  reason: string;
}

const ROUTING_TABLE: Record<TaskType, ModelConfig> = {
  planning: { model: 'anthropic/claude-sonnet-4', maxTokens: 4096, temperature: 0.7, label: 'Claude Sonnet 4', reason: 'Multi-step decomposition and mission briefs' },
  code_generation: { model: 'openai/gpt-4o', maxTokens: 8192, temperature: 0.2, label: 'GPT-4o', reason: 'Code generation and refactoring accuracy' },
  content_writing: { model: 'anthropic/claude-sonnet-4', maxTokens: 4096, temperature: 0.8, label: 'Claude Sonnet 4', reason: 'Prose quality and brand voice' },
  sales_outreach: { model: 'openai/gpt-4o-mini', maxTokens: 2048, temperature: 0.7, label: 'GPT-4o mini', reason: 'High-volume personalized sequences' },
  social_content: { model: 'openai/gpt-4o-mini', maxTokens: 2048, temperature: 0.85, label: 'GPT-4o mini', reason: 'Platform-native output at low cost' },
  template_generation: { model: 'openai/gpt-4o-mini', maxTokens: 2048, temperature: 0.5, label: 'GPT-4o mini', reason: 'Structured JSON output for batches' },
  seo_audit: { model: 'openai/gpt-4o-mini', maxTokens: 2048, temperature: 0.3, label: 'GPT-4o mini', reason: 'Analytical precision for audit cycles' },
  web_search: { model: 'perplexity/sonar', maxTokens: 2048, temperature: 0.3, label: 'Live Web Research', reason: 'Web-grounded research' },
  quick_json: { model: 'openai/gpt-4o-mini', maxTokens: 1024, temperature: 0.2, label: 'GPT-4o mini', reason: 'Simple structured output' },
  complex_reasoning: { model: 'anthropic/claude-sonnet-4', maxTokens: 8192, temperature: 0.5, label: 'Claude Sonnet 4', reason: 'Deep multi-step reasoning' },
  summarization: { model: 'openai/gpt-4o-mini', maxTokens: 1024, temperature: 0.3, label: 'GPT-4o mini', reason: 'Fast condensation' },
};

export function getModelForTask(taskType: TaskType): ModelConfig {
  return ROUTING_TABLE[taskType] || ROUTING_TABLE.quick_json;
}

export function listRoutes() {
  return Object.entries(ROUTING_TABLE).map(([type, cfg]) => ({
    taskType: type,
    model: cfg.model,
    label: cfg.label,
    reason: cfg.reason,
    maxTokens: cfg.maxTokens,
    temperature: cfg.temperature,
  }));
}

export async function callVercelGateway(opts: {
  apiKey?: string;
  taskType: TaskType;
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  timeoutMs?: number;
}): Promise<{ content: string; model: string; provider: string }> {
  const cfg = getModelForTask(opts.taskType);
  const body: any = {
    model: cfg.model,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userPrompt },
    ],
    max_tokens: cfg.maxTokens,
    temperature: cfg.temperature,
  };
  if (opts.jsonMode) body.response_format = { type: 'json_object' };
  return await gatewayCompletion(body, { apiKey: opts.apiKey, timeoutMs: opts.timeoutMs || 60000 });
}