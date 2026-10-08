// GATEWAY AGENT RUNNER — simplified tool-calling loop using the Vercel AI Gateway.
// No `ai` SDK dependency: implements a manual OpenAI-compatible tool loop.
// Calls the model, executes any tool calls, feeds results back, repeats up to 8 steps.

import { gatewayPost } from "./vercelGateway.ts";
import { getModelForTask } from "./aiRouter.ts";
import { GATEWAY_AGENTS, GATEWAY_RULES } from "./gatewayAgents.ts";
import { createEntityTools } from "./gatewayEntityTools.ts";
import { withRetry } from "./resilience.ts";

export async function runGatewayAgent(base44, { agentName, messages }) {
  const config = GATEWAY_AGENTS[agentName];
  if (!config) throw new Error("Unknown agent: " + agentName);

  const model = getModelForTask(config.taskType);
  const entityTools = createEntityTools(base44, config.entities);

  // Build OpenAI-compatible tool definitions
  const toolDefs = Object.entries(entityTools).map(([name, t]) => ({
    type: "function",
    function: {
      name,
      description: t.description,
      parameters: t.parameters,
    },
  }));

  const allMessages = [
    { role: "system", content: `${config.instructions}\n\n${GATEWAY_RULES}` },
    ...messages,
  ];

  const receipts = [];

  for (let step = 0; step < 8; step++) {
    const data = await withRetry(() =>
      gatewayPost("/chat/completions", {
        model: model.model,
        messages: allMessages,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
        max_tokens: model.maxTokens || 4096,
        temperature: model.temperature ?? 0.7,
      }, 90000)
    , { retries: 2 });

    const choice = data?.choices?.[0];
    const msg = choice?.message;
    if (!msg) throw new Error("AI Gateway returned no message.");

    // If there are tool calls, execute them and continue
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      allMessages.push({
        role: "assistant",
        content: msg.content || null,
        tool_calls: msg.tool_calls,
      });

      for (const call of msg.tool_calls) {
        const toolName = call.function?.name;
        const tool = entityTools[toolName];
        let result;
        if (!tool) {
          result = { error: `Unknown tool: ${toolName}` };
        } else {
          let args = {};
          try { args = JSON.parse(call.function?.arguments || "{}"); }
          catch { args = {}; }
          try {
            result = await tool.execute(args);
          } catch (e) {
            result = { error: String(e.message || e) };
          }
        }
        const failed = !!result?.error;
        receipts.push({
          name: toolName,
          status: failed ? "failed" : "completed",
          arguments_string: JSON.stringify(call.function?.arguments || {}).slice(0, 1500),
          results: JSON.stringify(result).slice(0, 2000),
        });
        allMessages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result).slice(0, 4000),
        });
      }
      continue; // next step
    }

    // No tool calls — final response
    const content = (msg.content || "").trim() ||
      "The execution step limit was reached. Review the recorded actions below before continuing; no further work was performed.";
    return {
      content: content.slice(0, 32000),
      tool_calls: receipts,
      provider: "vercel_ai_gateway",
      model: model.model,
    };
  }

  return {
    content: "The execution step limit was reached. Review the recorded actions below before continuing; no further work was performed.",
    tool_calls: receipts,
    provider: "vercel_ai_gateway",
    model: model.model,
  };
}