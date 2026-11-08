import { fetchJson } from "../http.js"
import { normalizeInput, positiveInt, supportsTools } from "./common.js"

const CATALOG_URL = "https://openrouter.ai/api/v1/models"
const BASE_URL = "https://openrouter.ai/api/v1"

function numericPrice(value) {
  if (typeof value !== "number" && typeof value !== "string") return NaN
  if (typeof value === "string" && value.trim() === "") return NaN
  return Number(value)
}

function isZeroPrice(value) {
  const price = numericPrice(value)
  if (!Number.isFinite(price) || price !== 0) return false
  // A nonzero decimal significand can underflow to zero during Number conversion.
  return typeof value === "number" || !/[1-9]/.test(value.trim().split(/[eE]/)[0])
}

export function normalizeOpenRouterModel(model) {
  const id = String(model.id)
  const outputModalities = Array.isArray(model.architecture?.output_modalities)
    ? model.architecture.output_modalities
    : ["text"]

  if (!outputModalities.includes("text")) return null
  if (outputModalities.some((modality) => modality !== "text")) return null

  return {
    id,
    name: model.name || id,
    context: positiveInt(model.context_length, 200_000),
    output: positiveInt(model.top_provider?.max_completion_tokens, 32_768),
    tools: supportsTools(model),
    input: normalizeInput(model.architecture?.input_modalities),
    outputModalities: ["text"],
    freeClass: "zero-price",
    privacy: {
      trainsOnPrompts: "unknown",
      source: "https://openrouter.ai/docs/features/privacy-and-logging",
    },
    evidence: CATALOG_URL,
  }
}

export async function discoverOpenRouter(config) {
  const envName = config.providers.openrouter.env || "OPENROUTER_API_KEY"
  const apiKey = config.credentials?.openrouter?.key || process.env[envName]
  const source = config.credentials?.openrouter?.source || (process.env[envName] ? "env" : null)
  const integrationID = source === "free-openrouter" ? "free-openrouter" : "openrouter"

  const integration = {
    id: integrationID,
    name: integrationID === "openrouter" ? "OpenRouter" : "OPENFREE OpenRouter Free",
    env: envName,
    register: false,
  }

  if (!apiKey) {
    return {
      providerId: "free-openrouter",
      name: "OPENFREE OpenRouter Free",
      baseURL: BASE_URL,
      integration,
      allModels: [],
      diagnostics: [`${envName} is not set and no OpenRouter connection is active`],
    }
  }

  const payload = await fetchJson(CATALOG_URL, {
    timeoutMs: config.catalog.timeoutMs,
    fetchImpl: config.fetch,
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  })

  const items = payload?.data
  if (!Array.isArray(items)) {
    throw new Error("OpenRouter catalog is not an array")
  }

  const models = items
    .filter((model) => {
      if (!model || typeof model.id !== "string") return false
      const pricing = model.pricing
      if (!pricing || typeof pricing !== "object" || Array.isArray(pricing)) return false
      if (!isZeroPrice(pricing.prompt) || !isZeroPrice(pricing.completion)) return false
      return !Object.values(pricing).some((value) => {
        const price = numericPrice(value)
        if (!Number.isFinite(price)) return false
        if (price !== 0) return price > 0
        return !isZeroPrice(value) && !value.trim().startsWith("-")
      })
    })
    .map(normalizeOpenRouterModel)
    .filter(Boolean)

  return {
    providerId: "free-openrouter",
    name: "OPENFREE OpenRouter Free",
    baseURL: BASE_URL,
    integration,
    allModels: models,
    diagnostics: [],
  }
}
