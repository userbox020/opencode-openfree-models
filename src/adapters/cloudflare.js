import { createOpenAICompatibleAdapter, normalizeOpenAICompatibleModel } from "./openai-compatible.js"

function accountId(config) {
  return config.credentials?.cloudflareAccountId || config.providers.cloudflare?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID
}

const spec = {
  configKey: "cloudflare",
  providerId: "free-cloudflare",
  displayName: "OPENFREE Cloudflare",
  baseURL: (config) => accountId(config)
    ? `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId(config))}/ai/v1`
    : undefined,
  catalogURL: (_apiKey, config) =>
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId(config))}/ai/models/search?per_page=100`,
  env: "CLOUDFLARE_API_TOKEN",
  integrationID: "cloudflare-workers-ai",
  registerIntegration: false,
  freeClass: "free-tier",
  privacy: { trainsOnPrompts: false, source: "https://developers.cloudflare.com/workers-ai/platform/data-usage/" },
  allowlist: ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/qwen/qwen2.5-coder-32b-instruct", "@cf/mistralai/mistral-small-3.1-24b-instruct", "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", "@cf/moonshotai/kimi-k2.5", "@cf/moonshotai/kimi-k2.6", "@cf/zai-org/glm-4.7-flash"],
  defaultContext: 131072,
  defaultOutput: 32768,
  pick: (payload) => payload.result ?? payload.data ?? payload.models,
  normalize(model, spec) {
    const properties = Object.fromEntries(
      (model.properties || []).map((property) => [property.property_id, property.value]),
    )
    const tools = properties.function_calling === "true" || properties.function_calling === true

    return normalizeOpenAICompatibleModel({
      ...model,
      id: model.name || model.id,
      name: model.name || model.id,
      context_length: Number(properties.context_window) || spec.defaultContext,
      max_completion_tokens: spec.defaultOutput,
      supported_parameters: tools ? ["tools"] : [],
    }, spec)
  },
}

const adapter = createOpenAICompatibleAdapter(spec)

export async function discoverCloudflare(config) {
  if (!accountId(config)) {
    return {
      providerId: spec.providerId,
      name: spec.displayName,
      baseURL: spec.baseURL(config),
      integration: {
        id: spec.integrationID,
        name: spec.displayName,
        env: config.providers.cloudflare?.env || spec.env,
        register: false,
      },
      allModels: [],
      diagnostics: ["CLOUDFLARE_ACCOUNT_ID is not set; OPENFREE Cloudflare was skipped"],
    }
  }
  const result = await adapter.discover(config)
  return {
    ...result,
    package: "@opencode/ai/providers/cloudflare-workers-ai",
    settings: { accountId: accountId(config) },
  }
}

export const normalizeCloudflareModel = adapter.normalize
export { spec as cloudflareSpec }

