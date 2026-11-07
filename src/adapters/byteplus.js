import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "byteplus",
  providerId: "free-byteplus",
  displayName: "OPENFREE BytePlus",
  baseURL: "https://ark.ap-southeast.bytepluses.com/api/coding/v3",
  catalogURL: "https://ark.ap-southeast.bytepluses.com/api/coding/v3/models",
  env: "BYTEPLUS_API_KEY",
  integrationID: "free-byteplus",
  registerIntegration: true,
  freeClass: "trial-credit",
  privacy: { trainsOnPrompts: "unknown", source: "https://console.byteplus.com/ark" },
  allowlist: [
    "seed-2-0-pro-260328",
    "seed-2-0-code-preview-260328",
    "seed-2-0-mini-260215",
    "seed-2-0-lite-260228",
    "kimi-k2-thinking-251104",
    "glm-4-7-251222",
    "gpt-oss-120b-250805",
  ],
  defaultContext: 131072,
  defaultOutput: 8192,
  tools: true,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverByteplus = adapter.discover
export const normalizeByteplusModel = adapter.normalize
export { spec as byteplusSpec }
