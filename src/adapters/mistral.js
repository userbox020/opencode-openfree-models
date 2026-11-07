import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "mistral",
  providerId: "free-mistral",
  displayName: "OPENFREE Mistral",
  baseURL: "https://api.mistral.ai/v1",
  catalogURL: "https://api.mistral.ai/v1/models",
  env: "MISTRAL_API_KEY",
  integrationID: "mistral",
  registerIntegration: false,
  freeClass: "free-tier",
  privacy: { trainsOnPrompts: true, source: "https://help.mistral.ai/en/articles/455206-how-can-i-try-the-api-for-free-with-the-experiment-plan" },
  allowlist: ["mistral-small-latest", "codestral-latest", "devstral-small-latest", "devstral-medium-latest", "magistral-small-latest", "magistral-medium-latest"],
  defaultContext: 131072,
  defaultOutput: 32768,
  tools: true,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverMistral = adapter.discover
export const normalizeMistralModel = adapter.normalize
export { spec as mistralSpec }
