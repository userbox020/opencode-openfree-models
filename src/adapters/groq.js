import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "groq",
  providerId: "free-groq",
  displayName: "OPENFREE Groq",
  baseURL: "https://api.groq.com/openai/v1",
  catalogURL: "https://api.groq.com/openai/v1/models",
  env: "GROQ_API_KEY",
  integrationID: "groq",
  registerIntegration: false,
  freeClass: "free-tier",
  privacy: { trainsOnPrompts: false, source: "https://console.groq.com/docs/your-data" },
  allowlist: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"],
  defaultContext: 131072,
  defaultOutput: 32768,
  // Free-tier TPM cannot fit OpenCode tool schemas.
  tools: false,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverGroq = adapter.discover
export const normalizeGroqModel = adapter.normalize
export { spec as groqSpec }

