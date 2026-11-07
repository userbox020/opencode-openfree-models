import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const PROVIDER_KEYS = [
  "kilo",
  "openrouter",
  "ollamaCloud",
  "gemini",
  "groq",
  "mistral",
  "cohere",
  "cloudflare",
  "sambanova",
  "zai",
  "nvidia",
  "alibaba",
  "nebius",
  "bazaarlink",
  "byteplus",
  "kimchi",
]

export const DEFAULTS = {
  providers: {
    kilo: { enabled: true },
    openrouter: { enabled: true, env: "OPENROUTER_API_KEY" },
    ollamaCloud: {
      enabled: true,
      env: "OLLAMA_API_KEY",
      baseURL: "https://ollama.com/v1",
      catalogURL: "https://ollama.com/v1/models",
      tagsURL: "https://ollama.com/api/tags",
    },
    gemini: { enabled: true, env: "GEMINI_API_KEY" },
    groq: { enabled: true, env: "GROQ_API_KEY" },
    mistral: { enabled: true, env: "MISTRAL_API_KEY" },
    cohere: { enabled: true, env: "COHERE_API_KEY" },
    cloudflare: {
      enabled: true,
      env: "CLOUDFLARE_API_TOKEN",
      accountId: "",
    },
    sambanova: { enabled: true, env: "SAMBANOVA_API_KEY" },
    zai: { enabled: true, env: "ZHIPU_API_KEY" },
    nvidia: { enabled: true, env: "NVIDIA_API_KEY" },
    alibaba: { enabled: true, env: "DASHSCOPE_API_KEY" },
    nebius: { enabled: true, env: "NEBIUS_API_KEY" },
    bazaarlink: { enabled: true, env: "BAZAARLINK_API_KEY" },
    byteplus: { enabled: true, env: "BYTEPLUS_API_KEY" },
    kimchi: { enabled: true, env: "KIMCHI_API_KEY" },
  },
  policy: {
    allowFreeTier: true,
    allowTraining: false,
    allowUnknownPrivacy: false,
    allowTrialCredits: false,
  },
  catalog: {
    timeoutMs: 8_000,
    ttlSeconds: 21_600,
  },
}

function mergeProvider(defaults, value) {
  return { ...defaults, ...(value && typeof value === "object" ? value : {}) }
}

export function mergeConfig(value = {}) {
  const input = value && typeof value === "object" ? value : {}
  const providers = input.providers && typeof input.providers === "object" ? input.providers : {}
  const mergedProviders = {}

  for (const key of PROVIDER_KEYS) {
    mergedProviders[key] = mergeProvider(DEFAULTS.providers[key], providers[key])
  }

  return {
    providers: mergedProviders,
    policy: { ...DEFAULTS.policy, ...(input.policy || {}) },
    catalog: { ...DEFAULTS.catalog, ...(input.catalog || {}) },
    credentials: input.credentials && typeof input.credentials === "object" ? input.credentials : {},
    fetch: typeof input.fetch === "function" ? input.fetch : globalThis.fetch,
  }
}

export async function loadConfig(ctx) {
  const directory = ctx?.location?.directory || process.cwd()
  let fileConfig = {}

  try {
    const raw = await readFile(join(directory, ".opencode", "free-models.json"), "utf8")
    fileConfig = JSON.parse(raw)
  } catch {
    // Missing or invalid project config falls back to defaults.
  }

  return mergeConfig({
    ...fileConfig,
    ...(ctx?.options && typeof ctx.options === "object" ? ctx.options : {}),
    providers: {
      ...(fileConfig.providers || {}),
      ...(ctx?.options?.providers || {}),
    },
    policy: {
      ...(fileConfig.policy || {}),
      ...(ctx?.options?.policy || {}),
    },
    catalog: {
      ...(fileConfig.catalog || {}),
      ...(ctx?.options?.catalog || {}),
    },
    credentials: {
      ...(fileConfig.credentials || {}),
      ...(ctx?.options?.credentials || {}),
    },
  })
}
