import { fetchJson } from "../http.js"
import { normalizeInput, positiveInt } from "./common.js"

const DEFAULT_CATALOG = "https://ollama.com/v1/models"
const DEFAULT_TAGS = "https://ollama.com/api/tags"
const DEFAULT_BASE_URL = "https://ollama.com/v1"

function capabilitiesFor(model, tag) {
  if (Array.isArray(model.capabilities)) return model.capabilities
  if (Array.isArray(tag?.capabilities)) return tag.capabilities
  return []
}

export function normalizeOllamaCloudModel(model, tag = null) {
  const id = String(model.slug || model.id || model.display_name || tag?.name || "").trim()
  if (!id) return null
  if (model.supported_in_api === false || model.visibility === "hide") return null

  const capabilities = capabilitiesFor(model, tag)
  if (capabilities.length && !capabilities.includes("completion")) return null

  const context = positiveInt(
    model.context_window ?? model.max_context_window,
    32_768,
  )

  return {
    id,
    name: model.display_name || tag?.name || id,
    context,
    output: Math.min(32_768, context),
    tools: capabilities.length ? capabilities.includes("tools") : true,
    input: normalizeInput(model.input_modalities),
    outputModalities: ["text"],
    freeClass: "free-tier",
    privacy: {
      trainsOnPrompts: "unknown",
      source: "https://ollama.com/legal",
    },
    evidence: DEFAULT_CATALOG,
  }
}

export async function discoverOllamaCloud(config) {
  const providerConfig = config.providers.ollamaCloud
  const catalogURL = providerConfig.catalogURL || DEFAULT_CATALOG
  const tagsURL = providerConfig.tagsURL || DEFAULT_TAGS
  const baseURL = providerConfig.baseURL || DEFAULT_BASE_URL
  const envName = providerConfig.env || "OLLAMA_API_KEY"
  const apiKey = config.credentials?.ollamaCloud?.key

  if (!apiKey) {
    return {
      providerId: "free-ollama-cloud",
      name: "OPENFREE Ollama Cloud",
      baseURL,
      integration: {
        id: "ollama-cloud",
        name: "Ollama Cloud",
        env: envName,
        register: false,
      },
      allModels: [],
      diagnostics: [`${envName} is not set; Ollama Cloud was skipped`],
    }
  }

  const headers = { authorization: `Bearer ${apiKey}` }
  const [catalogResult, tagsResult] = await Promise.allSettled([
    fetchJson(catalogURL, {
      timeoutMs: config.catalog.timeoutMs,
      fetchImpl: config.fetch,
      headers,
    }),
    fetchJson(tagsURL, {
      timeoutMs: config.catalog.timeoutMs,
      fetchImpl: config.fetch,
      headers,
    }),
  ])

  if (catalogResult.status === "rejected") {
    throw catalogResult.reason
  }

  const catalog = catalogResult.value
  const richModels = Array.isArray(catalog?.models) ? catalog.models : []
  const openAiModels = Array.isArray(catalog?.data) ? catalog.data : []
  const tags = tagsResult.status === "fulfilled" && Array.isArray(tagsResult.value?.models)
    ? tagsResult.value.models
    : []
  const tagsById = new Map(tags.map((model) => [model.name || model.model, model]))
  const byId = new Map()

  for (const model of richModels) {
    const id = model.slug || model.id || model.display_name
    if (id) byId.set(id, model)
  }
  for (const model of openAiModels) {
    if (model.id && !byId.has(model.id)) byId.set(model.id, model)
  }

  const models = [...byId.values()]
    .map((model) => normalizeOllamaCloudModel(model, tagsById.get(model.slug || model.id)))
    .filter(Boolean)

  return {
    providerId: "free-ollama-cloud",
    name: "OPENFREE Ollama Cloud",
    baseURL,
    integration: {
      id: "ollama-cloud",
      name: "Ollama Cloud",
      env: envName,
      register: false,
    },
    allModels: models,
    diagnostics: tagsResult.status === "rejected"
      ? ["Ollama Cloud capability metadata unavailable; tool support defaulted to yes"]
      : [],
  }
}
