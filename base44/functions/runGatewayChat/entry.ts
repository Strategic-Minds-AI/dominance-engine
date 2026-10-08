import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { gatewayCompletion } from '../../shared/vercelGateway.ts';
import { getAgentPrompt, getAgentTaskType } from '../../shared/agentPrompts.ts';
import { getModelForTask } from '../../shared/aiRouter.ts';

// runGatewayChat — the Xtreme Super Agent conversation runtime.
// Uses the Vercel AI Gateway (VERCEL_AI_GATEWAY secret) with intelligent
// per-agent model routing. Bypasses Base44 integration credits.
//
//   action: 'start'  → { agent_name }              → creates a conversation
//   action: 'send'   → { conversation_id, content, request_key } → user + assistant reply

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── START a conversation ──────────────────────────────────────────────
    if (action === 'start') {
      const { agent_name } = body;
      if (!agent_name) return Response.json({ error: 'agent_name is required' }, { status: 400 });
      if (!getAgentPrompt(agent_name)) return Response.json({ error: `Unknown agent: ${agent_name}` }, { status: 400 });

      const conversation = await base44.entities.GatewayConversation.create({
        agent_name,
        metadata: { user_email: user.email || '' },
      });
      return Response.json({ conversation });
    }

    // ── SEND a message ───────────────────────────────────────────────────
    if (action === 'send') {
      const { conversation_id, content, request_key } = body;
      if (!conversation_id) return Response.json({ error: 'conversation_id is required' }, { status: 400 });
      if (!content || !String(content).trim()) return Response.json({ error: 'content is required' }, { status: 400 });

      const conversation: any = await base44.entities.GatewayConversation.get(conversation_id);
      if (!conversation) return Response.json({ error: 'Conversation not found' }, { status: 404 });

      const systemPrompt = getAgentPrompt(conversation.agent_name);
      if (!systemPrompt) return Response.json({ error: `Unknown agent: ${conversation.agent_name}` }, { status: 400 });

      // Load recent history (last 30 messages) for context
      const msgRes: any = await base44.entities.GatewayMessage.filter(
        { conversation_id },
        { sort: 'created_date', limit: 30 }
      );
      const history = (msgRes.items || []).map((m: any) => ({ role: m.role, content: m.content }));

      // Persist the user message
      const key = request_key || crypto.randomUUID();
      const userMessage = await base44.entities.GatewayMessage.create({
        conversation_id,
        role: 'user',
        content,
        request_key: key,
      });

      // Route to the best model for this agent, then call the Vercel AI Gateway
      const taskType: any = getAgentTaskType(conversation.agent_name);
      const cfg = getModelForTask(taskType);

      let assistantContent = '';
      try {
        const result = await gatewayCompletion({
          model: cfg.model,
          max_tokens: cfg.maxTokens,
          temperature: cfg.temperature,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content },
          ],
        });
        assistantContent = result.content;
      } catch (e: any) {
        return Response.json({
          error: e.message || 'Vercel AI Gateway could not complete the request.',
          user_message: userMessage,
        });
      }

      // Persist the assistant reply
      const assistantMessage = await base44.entities.GatewayMessage.create({
        conversation_id,
        role: 'assistant',
        content: assistantContent,
        request_key: key,
      });

      return Response.json({ user_message: userMessage, assistant_message: assistantMessage });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}