import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "kimchi",
  providerId: "free-kimchi",
  displayName: "OPENFREE Kimchi",
  baseURL: "https://llm.kimchi.dev/openai/v1",
  catalogURL: "https://llm.kimchi.dev/openai/v1/models",
  env: "KIMCHI_API_KEY",
  integrationID: "free-kimchi",
  registerIntegration: true,
  freeClass: "free-tier",
  privacy: { trainsOnPrompts: "unknown", source: "https://kimchi.dev" },
  allowlist: ["minimax-m3", "kimi-k2.7", "kimi-k2.6", "kimi-k2.5", "nemotron-3-ultra-fp4", "minimax-m2.7", "claude-opus-4-6", "claude-sonnet-4-6"],
  defaultContext: 131072,
  defaultOutput: 32768,
  tools: true,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverKimchi = adapter.discover
export const normalizeKimchiModel = adapter.normalize
export { spec as kimchiSpec }
