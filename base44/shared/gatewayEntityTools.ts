// GATEWAY ENTITY TOOLS — provides entity CRUD operations as tools for the agent runner.
// Simplified: no zod schemas, plain JSON parameter definitions.
// The agent runner sends these as OpenAI-compatible tool definitions to the gateway.

import { searchGatewayWeb } from "./vercelGateway.ts";

export function createEntityTools(base44, entityNames) {
  const tools = {};

  for (const entityName of entityNames) {
    const e = base44.asServiceRole.entities[entityName];
    if (!e) continue;

    tools[`list_${entityName}`] = {
      description: `List ${entityName} records. Pass a MongoDB-style query filter and optional limit (max 50).`,
      parameters: {
        type: "object",
        properties: {
          query: { type: "object", description: "MongoDB filter, e.g. {status: 'pending'}" },
          limit: { type: "number", description: "Max records to return (default 10, max 50)" },
        },
      },
      execute: async ({ query, limit }) => {
        const page = await e.filter(query || {}, { limit: Math.min(limit || 10, 50) });
        return page.items || page || [];
      },
    };

    tools[`create_${entityName}`] = {
      description: `Create a new ${entityName} record.`,
      parameters: {
        type: "object",
        properties: { data: { type: "object", description: "The record fields to create" } },
        required: ["data"],
      },
      execute: async ({ data }) => {
        return await e.create(data);
      },
    };

    tools[`update_${entityName}`] = {
      description: `Update a ${entityName} record by its id.`,
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "The record id" },
          data: { type: "object", description: "Fields to update" },
        },
        required: ["id", "data"],
      },
      execute: async ({ id, data }) => {
        return await e.update(id, data);
      },
    };

    tools[`delete_${entityName}`] = {
      description: `Delete a ${entityName} record by its id.`,
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      execute: async ({ id }) => {
        await e.delete(id);
        return { deleted: true, id };
      },
    };
  }

  // Web search tool — always available
  tools.web_search = {
    description: "Research the live public web through the Vercel AI Gateway. Returns a summary with source links. Never invent search results.",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "The search query" } },
      required: ["query"],
    },
    execute: async ({ query }) => await searchGatewayWeb(query),
  };

  return tools;
}