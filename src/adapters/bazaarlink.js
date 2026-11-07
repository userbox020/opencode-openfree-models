import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "bazaarlink",
  providerId: "free-bazaarlink",
  displayName: "OPENFREE BazaarLink",
  baseURL: "https://bazaarlink.ai/api/v1",
  catalogURL: "https://bazaarlink.ai/api/v1/models",
  env: "BAZAARLINK_API_KEY",
  integrationID: "free-bazaarlink",
  registerIntegration: true,
  freeClass: "free-tier",
  privacy: { trainsOnPrompts: "unknown", source: "https://bazaarlink.ai" },
  allowlist: ["auto:free"],
  defaultContext: 200000,
  defaultOutput: 32768,
  tools: true,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverBazaarLink = adapter.discover
export const normalizeBazaarLinkModel = adapter.normalize
export { spec as bazaarlinkSpec }
