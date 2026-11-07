import { fetchJson } from "../http.js"
import { normalizeInput, positiveInt, supportsTools } from "./common.js"

const CATALOG_URL = "https://ai-gateway.kilo.ai/api/v1/models"
const BASE_URL = "https://ai-gateway.kilo.ai/api/v1"

export function normalizeKiloModel(model) {
  const id = String(model.id)
  const input = normalizeInput(model.architecture?.input_modalities)

  return {
    id,
    name: model.name || id,
    context: positiveInt(model.context_length ?? model.top_provider?.context_length, 256_000),
    output: positiveInt(model.top_provider?.max_completion_tokens, 32_768),
    tools: supportsTools(model),
    input,
    outputModalities: ["text"],
    freeClass: "free-tier",
    privacy: {
      trainsOnPrompts: model.mayTrainOnYourPrompts === true ? true : "unknown",
      source: "https://kilo.ai/docs/gateway/models-and-providers",
    },
    evidence: CATALOG_URL,
  }
}

export async function discoverKilo(config) {
  const payload = await fetchJson(CATALOG_URL, {
    timeoutMs: config.catalog.timeoutMs,
    fetchImpl: config.fetch,
  })

  const items = Array.isArray(payload) ? payload : payload?.data
  if (!Array.isArray(items)) {
    throw new Error("Kilo catalog is not an array")
  }

  const models = items
    .filter((model) => model && model.isFree === true && typeof model.id === "string")
    .map(normalizeKiloModel)

  return {
    providerId: "free-kilo",
    name: "OPENFREE Kilo Free",
    baseURL: BASE_URL,
    integration: null,
    allModels: models,
    diagnostics: [],
  }
}
