import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "nebius",
  providerId: "free-nebius",
  displayName: "OPENFREE Nebius",
  baseURL: "https://api.tokenfactory.nebius.com/v1",
  catalogURL: "https://api.tokenfactory.nebius.com/v1/models",
  env: "NEBIUS_API_KEY",
  integrationID: "nebius",
  registerIntegration: false,
  freeClass: "trial-credit",
  privacy: { trainsOnPrompts: true, source: "https://docs.nebius.com/legal/token-factory" },
  defaultContext: 131072,
  defaultOutput: 8192,
  tools: true,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverNebius = adapter.discover
export const normalizeNebiusModel = adapter.normalize
export { spec as nebiusSpec }
