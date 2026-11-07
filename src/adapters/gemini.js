import { createOpenAICompatibleAdapter, normalizeOpenAICompatibleModel } from "./openai-compatible.js"

const spec = {
  configKey: "gemini",
  providerId: "free-gemini",
  displayName: "OPENFREE Gemini",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
  catalogURL: (apiKey) => "https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(apiKey),
  auth: "query",
  env: "GEMINI_API_KEY",
  integrationID: "google",
  registerIntegration: false,
  freeClass: "free-tier",
  privacy: { trainsOnPrompts: true, source: "https://ai.google.dev/gemini-api/docs/pricing" },
  allowlist: ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview", "gemini-3-flash-preview", "gemma-4-31b-it"],
  tools: true,
  pick: (payload) => payload.models,
  normalize(model, spec) {
    if (model.supportedGenerationMethods !== undefined && !model.supportedGenerationMethods.includes("generateContent")) {
      return null
    }
    return normalizeOpenAICompatibleModel({
      ...model,
      id: String(model.name || "").replace(/^models\//, ""),
      name: model.displayName,
      context_length: model.inputTokenLimit,
      max_completion_tokens: model.outputTokenLimit,
    }, spec)
  },
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverGemini = adapter.discover
export const normalizeGeminiModel = adapter.normalize
export { spec as geminiSpec }

