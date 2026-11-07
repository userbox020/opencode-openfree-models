import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "zai",
  providerId: "free-zai",
  displayName: "OPENFREE Z.ai",
  baseURL: "https://api.z.ai/api/paas/v4",
  catalogURL: "https://api.z.ai/api/paas/v4/models",
  env: "ZHIPU_API_KEY",
  integrationID: "zai",
  registerIntegration: false,
  freeClass: "free-tier",
  privacy: { trainsOnPrompts: "unknown", source: "https://docs.z.ai/guides/overview/pricing" },
  allowlist: ["glm-4.7-flash", "glm-4.5-flash", "glm-4.6v-flash"],
  defaultContext: 200000,
  defaultOutput: 32768,
  tools: true,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverZai = adapter.discover
export const normalizeZaiModel = adapter.normalize
export { spec as zaiSpec }
