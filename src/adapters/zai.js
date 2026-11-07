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
  allowlist: ["glm-4.7-flash", "glm-4.5-flash"],
  defaultContext: 200000,
  defaultOutput: 32768,
  tools: true,
}

const STATIC_FREE_MODELS = [
  {
    id: "glm-4.7-flash",
    name: "glm-4.7-flash",
    context: 200000,
    output: 32768,
    tools: true,
    input: ["text"],
    outputModalities: ["text"],
    freeClass: "free-tier",
    privacy: { trainsOnPrompts: "unknown", source: "https://docs.z.ai/guides/overview/pricing" },
    evidence: "https://docs.z.ai/guides/overview/pricing",
  },
  {
    id: "glm-4.5-flash",
    name: "glm-4.5-flash",
    context: 131072,
    output: 8192,
    tools: true,
    input: ["text"],
    outputModalities: ["text"],
    freeClass: "free-tier",
    privacy: { trainsOnPrompts: "unknown", source: "https://docs.z.ai/guides/overview/pricing" },
    evidence: "https://docs.z.ai/guides/overview/pricing",
  },
]

const adapter = createOpenAICompatibleAdapter(spec)

export async function discoverZai(config) {
  const result = await adapter.discover(config)
  const envName = config.providers?.zai?.env || spec.env
  const hasCredential = Boolean(config.credentials?.zai?.key || process.env[envName])
  if (!hasCredential) return result

  const existing = new Set(result.allModels.map((model) => model.id))
  const missing = STATIC_FREE_MODELS.filter((model) => !existing.has(model.id))

  return {
    ...result,
    allModels: [...result.allModels, ...missing],
  }
}

export const normalizeZaiModel = adapter.normalize
export { spec as zaiSpec, STATIC_FREE_MODELS as zaiStaticFreeModels }

