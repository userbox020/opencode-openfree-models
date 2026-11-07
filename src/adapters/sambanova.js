import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "sambanova",
  providerId: "free-sambanova",
  displayName: "OPENFREE SambaNova",
  baseURL: "https://api.sambanova.ai/v1",
  catalogURL: "https://api.sambanova.ai/v1/models",
  env: "SAMBANOVA_API_KEY",
  integrationID: "sambanova",
  registerIntegration: false,
  freeClass: "free-tier",
  privacy: { trainsOnPrompts: "unknown", source: "https://docs.sambanova.ai/docs/en/models/rate-limits" },
  allowlist: ["DeepSeek-V3.1", "Meta-Llama-3.3-70B-Instruct", "gpt-oss-120b", "DeepSeek-V3.2", "gemma-4-31B-it"],
  defaultContext: 131072,
  defaultOutput: 32768,
  tools: true,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverSambaNova = adapter.discover
export const normalizeSambaNovaModel = adapter.normalize
export { spec as sambanovaSpec }
