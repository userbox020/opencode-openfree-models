import { createOpenAICompatibleAdapter, normalizeOpenAICompatibleModel } from "./openai-compatible.js"

const spec = {
  configKey: "cohere",
  providerId: "free-cohere",
  displayName: "OPENFREE Cohere",
  baseURL: "https://api.cohere.ai/compatibility/v1",
  catalogURL: "https://api.cohere.ai/v1/models?page_size=100",
  env: "COHERE_API_KEY",
  integrationID: "cohere",
  registerIntegration: false,
  freeClass: "free-tier",
  privacy: { trainsOnPrompts: "unknown", source: "https://cohere.com/enterprise-data-commitments" },
  allowlist: ["command-a-03-2025", "command-r-plus-08-2024", "command-r-08-2024", "command-r7b-12-2024", "north-mini-code-6b"],
  defaultContext: 128000,
  defaultOutput: 4096,
  tools: true,
  pick: (payload) => payload.models,
  normalize: (model, spec) => normalizeOpenAICompatibleModel({
    ...model,
    id: model.name,
    context_length: model.context_length,
    max_completion_tokens: 4096,
  }, spec),
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverCohere = adapter.discover
export const normalizeCohereModel = adapter.normalize
export { spec as cohereSpec }
