import { fetchJson } from "../http.js"
import { normalizeInput, positiveInt } from "./common.js"

function asSet(value) {
  if (value instanceof Set) return value
  return new Set(Array.isArray(value) ? value : [])
}

function modelId(model) {
  return String(model?.id || model?.name || model?.model || model?.slug || "").trim()
}

export function normalizeOpenAICompatibleModel(model, spec) {
  const id = modelId(model)
  if (!id) return null

  const allowlist = asSet(spec.allowlist)
  if (allowlist.size && !allowlist.has(id)) return null

  if (Array.isArray(spec.denylist) && spec.denylist.some((pattern) => pattern.test(id))) {
    return null
  }

  const context = positiveInt(
    model.context_length ??
      model.context_window ??
      model.max_context_length ??
      model.max_context_window ??
      model.input_token_limit ??
      model.max_context_tokens,
    spec.defaultContext ?? 32_768,
  )

  const output = positiveInt(
    model.max_completion_tokens ??
      model.output_token_limit ??
      model.max_output_tokens ??
      model.top_provider?.max_completion_tokens,
    spec.defaultOutput ?? 8_192,
  )

  const capabilities = Array.isArray(model.capabilities) ? model.capabilities : []
  const tools = spec.tools !== undefined
    ? spec.tools
    : capabilities.includes("tools") ||
      model.supported_parameters?.includes("tools") ||
      model.capabilities?.tools === true

  return {
    id,
    name: model.name || model.display_name || id,
    context,
    output,
    tools: Boolean(tools),
    input: normalizeInput(
      model.architecture?.input_modalities ??
        model.input_modalities ??
        model.modalities?.input ??
        ["text"],
    ),
    outputModalities: ["text"],
    freeClass: spec.freeClass || "unknown",
    privacy: spec.privacy || {
      trainsOnPrompts: "unknown",
      source: spec.evidence || spec.catalogURL,
    },
    evidence: spec.evidence || (typeof spec.catalogURL === "string" ? spec.catalogURL : spec.baseURL),
  }
}

export function createOpenAICompatibleAdapter(spec) {
  const normalize = (model) =>
    spec.normalize ? spec.normalize(model, spec) : normalizeOpenAICompatibleModel(model, spec)

  return {
    normalize,
    async discover(config) {
      const providerConfig = config.providers[spec.configKey] || {}
      const envName = providerConfig.env || spec.env
      const credential = config.credentials?.[spec.credentialKey || spec.configKey]
      const apiKey = credential?.key || process.env[envName]
      const integrationID = credential?.source === `free-${spec.configKey}`
        ? `free-${spec.configKey}`
        : spec.integrationID
      const baseURL = typeof spec.baseURL === "function" ? spec.baseURL(config) : spec.baseURL
      const integration = {
        id: integrationID,
        name: spec.integrationName || spec.displayName,
        env: envName,
        register: spec.registerIntegration === true,
      }

      if (!apiKey && spec.auth !== "none") {
        return {
          providerId: spec.providerId,
          name: spec.displayName,
          baseURL,
          integration,
          allModels: [],
          diagnostics: [`${envName} is not set; ${spec.displayName} was skipped`],
        }
      }

      const catalogURL = typeof spec.catalogURL === "function"
        ? spec.catalogURL(apiKey, config)
        : spec.catalogURL
      const headers = spec.auth === "query"
        ? {}
        : apiKey
          ? { authorization: `Bearer ${apiKey}` }
          : {}

      const payload = await fetchJson(catalogURL, {
        timeoutMs: config.catalog.timeoutMs,
        fetchImpl: config.fetch,
        headers,
      })

      const items = spec.pick
        ? spec.pick(payload, config)
        : Array.isArray(payload)
          ? payload
          : payload?.data ?? payload?.models

      if (!Array.isArray(items)) {
        throw new Error(`${spec.displayName} catalog is not an array`)
      }

      return {
        providerId: spec.providerId,
        name: spec.displayName,
        baseURL,
        integration,
        allModels: items.map(normalize).filter(Boolean),
        diagnostics: [],
      }
    },
  }
}
