import assert from "node:assert/strict"
import test from "node:test"

import plugin, { __test } from "../src/index.js"
import { normalizeKiloModel } from "../src/adapters/kilo.js"
import { normalizeOllamaCloudModel } from "../src/adapters/ollama-cloud.js"
import { normalizeOpenRouterModel } from "../src/adapters/openrouter.js"
import { credentialFingerprint } from "../src/cache.js"
import { mergeConfig, PROVIDER_KEYS } from "../src/config.js"
import { filterModels } from "../src/policy.js"

function jsonResponse(value) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

function createContext({
  options = {},
  fetchImpl = async () => jsonResponse({}),
  connections = {},
} = {}) {
  const providers = []
  const commands = []
  const integrations = []
  const synthetic = []
  const storage = new Map()

  const providerRecords = () =>
    providers.map((entry) => ({
      provider: entry.info,
      models: new Map(entry.models.map((model) => [model.id, model])),
    }))

  const ctx = {
    options: { ...options, fetch: fetchImpl },
    location: { directory: process.cwd() },
    provider: {
      list: providerRecords,
      transform: async (callback) => {
        callback({
          list: providerRecords,
          get: (providerID) => providerRecords().find((entry) => entry.provider.id === providerID),
          add: (input) => providers.push({ info: input.info, models: [...input.models] }),
          update: () => {},
          remove: () => {},
          models: { set: () => {}, update: () => {}, remove: () => {} },
        })
      },
      reload: async () => {},
    },
    model: {
      transform: async (callback) => {
        callback({
          list: (providerID) => {
            const provider = providers.find((entry) => entry.info.id === providerID)
            return provider ? provider.models : []
          },
          get: (providerID, modelID) => {
            const provider = providers.find((entry) => entry.info.id === providerID)
            return provider?.models.find((model) => model.id === modelID)
          },
          update: () => {},
          remove: (providerID, modelID) => {
            const provider = providers.find((entry) => entry.info.id === providerID)
            if (provider) provider.models = provider.models.filter((model) => model.id !== modelID)
          },
          default: { get: () => undefined, set: () => {} },
          provider: { list: providerRecords, get: () => undefined },
        })
      },
      reload: async () => {},
    },
    integration: {
      transform: async (callback) => {
        callback({
          list: () => [],
          get: () => undefined,
          update: () => {},
          remove: () => {},
          method: {
            list: () => [],
            update: (input) => integrations.push(input),
            remove: () => {},
          },
        })
      },
      connection: {
        active: async (integrationID) => {
          if (!connections[integrationID]) return undefined
          return {
            type: "credential",
            id: `cred-${integrationID}`,
            label: integrationID,
            method: "key",
          }
        },
        resolve: async (connection) => connections[connection.label],
      },
      reload: async () => {},
    },
    command: {
      transform: async (callback) => {
        callback({ add: (definition) => commands.push(definition) })
      },
      reload: async () => {},
    },
    session: {
      synthetic: async (input) => synthetic.push(input),
    },
    storage: {
      get: async (key) => storage.get(key),
      set: async (key, value) => storage.set(key, value),
      remove: async (key) => storage.delete(key),
      scan: async () => ({}),
    },
  }

  return { ctx, providers, commands, integrations, synthetic, storage }
}

const kiloPayload = {
  data: [
    {
      id: "kilo-auto/free",
      name: "Auto Free",
      isFree: true,
      context_length: 256000,
      top_provider: { max_completion_tokens: 32768 },
      supported_parameters: ["tools", "reasoning"],
      architecture: { input_modalities: ["text", "image"] },
      mayTrainOnYourPrompts: true,
    },
    {
      id: "paid/model",
      name: "Paid Model",
      isFree: false,
      context_length: 128000,
      supported_parameters: ["tools"],
      architecture: { input_modalities: ["text"] },
      mayTrainOnYourPrompts: false,
    },
  ],
}

const openRouterPayload = {
  data: [
    {
      id: "cohere/north-mini-code:free",
      name: "North Mini Code",
      context_length: 256000,
      top_provider: { max_completion_tokens: 64000 },
      supported_parameters: ["tools"],
      architecture: { input_modalities: ["text"], output_modalities: ["text"] },
      pricing: { prompt: "0", completion: "0" },
    },
    {
      id: "paid/model",
      name: "Paid",
      context_length: 128000,
      supported_parameters: ["tools"],
      architecture: { input_modalities: ["text"], output_modalities: ["text"] },
      pricing: { prompt: "0.1", completion: "0.2" },
    },
  ],
}

const ollamaCloudPayload = {
  models: [
    {
      slug: "gpt-oss:120b",
      display_name: "GPT-OSS 120B",
      context_window: 131072,
      max_context_window: 131072,
      input_modalities: ["text"],
      supported_in_api: true,
      visibility: "list",
    },
    {
      slug: "clef:27b",
      display_name: "Clef 27B",
      context_window: 65536,
      capabilities: ["decision", "vision"],
      input_modalities: ["text", "image"],
      supported_in_api: true,
      visibility: "list",
    },
  ],
}

const ollamaCloudTags = {
  models: [
    { name: "gpt-oss:120b", capabilities: ["completion", "tools", "thinking"] },
    { name: "clef:27b", capabilities: ["decision", "vision"] },
  ],
}

test("normalizes Kilo free models and drops paid entries", () => {
  const model = normalizeKiloModel(kiloPayload.data[0])
  assert.equal(model.id, "kilo-auto/free")
  assert.equal(model.context, 256000)
  assert.equal(model.output, 32768)
  assert.equal(model.tools, true)
  assert.deepEqual(model.input, ["text", "image"])
  assert.equal(model.freeClass, "free-tier")
  assert.equal(model.privacy.trainsOnPrompts, true)
})

test("filters training and unknown-privacy models by policy", () => {
  const config = mergeConfig()
  const kilo = normalizeKiloModel(kiloPayload.data[0])
  const openrouter = normalizeOpenRouterModel(openRouterPayload.data[0])
  const cloud = normalizeOllamaCloudModel(ollamaCloudPayload.models[0])
  const local = { freeClass: "local", privacy: { trainsOnPrompts: false } }

  assert.equal(filterModels([kilo], config.policy).length, 0)
  assert.equal(filterModels([openrouter], config.policy).length, 0)
  assert.equal(filterModels([cloud], config.policy).length, 0)
  assert.equal(filterModels([local], config.policy).length, 1)
  assert.equal(filterModels([kilo], { ...config.policy, allowTraining: true }).length, 1)
  assert.equal(filterModels([openrouter], { ...config.policy, allowUnknownPrivacy: true }).length, 1)
  assert.equal(filterModels([cloud], { ...config.policy, allowUnknownPrivacy: true }).length, 1)
})

test("builds a valid OpenCode provider and model shape", () => {
  const provider = {
    providerId: "free-kilo",
    name: "OPENFREE Kilo Free",
    baseURL: "https://ai-gateway.kilo.ai/api/v1",
    integration: null,
  }
  const model = normalizeKiloModel(kiloPayload.data[0])
  const info = __test.toProviderInfo(provider)
  const modelInfo = __test.toModelInfo(provider.providerId, model)

  assert.equal(info.id, "free-kilo")
  assert.equal(info.activation, "enabled")
  assert.equal(info.package, "@opencode/ai/providers/openai-compatible")
  assert.equal(info.settings.baseURL, provider.baseURL)

  assert.equal(modelInfo.id, "kilo-auto/free")
  assert.equal(modelInfo.modelID, "kilo-auto/free")
  assert.equal(modelInfo.providerID, "free-kilo")
  assert.deepEqual(modelInfo.capabilities.output, ["text"])
  assert.deepEqual(modelInfo.cost, [{ input: 0, output: 0, cache: { read: 0, write: 0 } }])
  assert.equal(modelInfo.limit.context, 256000)
  assert.equal(modelInfo.limit.output, 32768)
})

test("registers Kilo provider and command when training is allowed", async () => {
  const { ctx, providers, commands, storage } = createContext({
    options: {
      providers: {
        kilo: { enabled: true },
        openrouter: { enabled: false },
        ollamaCloud: { enabled: false },
      },
      policy: { allowTraining: true },
    },
    fetchImpl: async () => jsonResponse(kiloPayload),
  })

  await plugin.setup(ctx)

  assert.equal(providers.length, 1)
  assert.equal(providers[0].info.id, "free-kilo")
  assert.equal(providers[0].info.name, "OPENFREE Kilo Free")
  assert.equal(providers[0].models.length, 1)
  assert.equal(providers[0].models[0].id, "kilo-auto/free")
  assert.equal(commands.length, 1)
  assert.equal(commands[0].name, "free-models")
  assert.ok(storage.get("free-models:inventory:v17"))
})

test("does not register a provider when policy blocks every model", async () => {
  const { ctx, providers } = createContext({
    options: {
      providers: {
        kilo: { enabled: true },
        openrouter: { enabled: false },
        ollamaCloud: { enabled: false },
      },
      policy: { allowTraining: false },
    },
    fetchImpl: async () => jsonResponse(kiloPayload),
  })

  await plugin.setup(ctx)
  assert.equal(providers.length, 0)
})

test("resolves the stored OpenRouter connection and registers free models", async () => {
  const previous = process.env.OPENROUTER_API_KEY
  delete process.env.OPENROUTER_API_KEY

  try {
    const { ctx, providers, integrations } = createContext({
      options: {
        providers: {
          kilo: { enabled: false },
          openrouter: { enabled: true, env: "OPENROUTER_API_KEY" },
          ollamaCloud: { enabled: false },
        },
        policy: { allowUnknownPrivacy: true },
      },
      connections: {
        openrouter: { type: "key", key: "test-key" },
      },
      fetchImpl: async () => jsonResponse(openRouterPayload),
    })

    await plugin.setup(ctx)

    assert.equal(providers.length, 1)
    assert.equal(providers[0].info.id, "free-openrouter")
    assert.equal(providers[0].info.name, "OPENFREE OpenRouter Free")
    assert.equal(providers[0].info.integrationID, "openrouter")
    assert.equal(providers[0].models.length, 1)
    assert.equal(providers[0].models[0].id, "cohere/north-mini-code:free")
    assert.equal(integrations.some((entry) => entry.integrationID === "openrouter"), false)
  } finally {
    if (previous === undefined) delete process.env.OPENROUTER_API_KEY
    else process.env.OPENROUTER_API_KEY = previous
  }
})

test("registers a plugin-only integration before its credential exists", async () => {
  const previous = process.env.BAZAARLINK_API_KEY
  delete process.env.BAZAARLINK_API_KEY

  try {
    const { ctx, providers, integrations } = createContext({
      options: {
        providers: {
          bazaarlink: { enabled: true, env: "BAZAARLINK_API_KEY" },
        },
      },
    })

    await plugin.setup(ctx)

    assert.equal(providers.length, 0)
    const methods = integrations
      .filter((entry) => entry.integrationID === "free-bazaarlink")
      .map((entry) => entry.method.type)
    assert.deepEqual(methods, ["env", "key"])
  } finally {
    if (previous === undefined) delete process.env.BAZAARLINK_API_KEY
    else process.env.BAZAARLINK_API_KEY = previous
  }
})

test("resolves a key connected to the plugin-only BazaarLink integration", async () => {
  const previous = process.env.BAZAARLINK_API_KEY
  delete process.env.BAZAARLINK_API_KEY

  try {
    const { ctx, providers } = createContext({
      options: {
        providers: {
          kilo: { enabled: false },
          bazaarlink: { enabled: true, env: "BAZAARLINK_API_KEY" },
        },
        policy: { allowUnknownPrivacy: true },
      },
      connections: {
        "free-bazaarlink": { type: "key", key: "test-key" },
      },
      fetchImpl: async (url, options) => {
        assert.equal(url, "https://bazaarlink.ai/api/v1/models")
        assert.equal(options.headers.authorization, "Bearer test-key")
        return jsonResponse({ data: [{ id: "auto:free" }] })
      },
    })

    await plugin.setup(ctx)

    const provider = providers.find((entry) => entry.info.id === "free-bazaarlink")
    assert.ok(provider)
    assert.equal(provider.info.integrationID, "free-bazaarlink")
    assert.deepEqual(provider.models.map((model) => model.id), ["auto:free"])
  } finally {
    if (previous === undefined) delete process.env.BAZAARLINK_API_KEY
    else process.env.BAZAARLINK_API_KEY = previous
  }
})

test("OpenRouter adapter skips without an API key", async () => {
  const previous = process.env.OPENROUTER_API_KEY
  delete process.env.OPENROUTER_API_KEY

  try {
    const { discoverOpenRouter } = await import("../src/adapters/openrouter.js")
    const result = await discoverOpenRouter(mergeConfig())
    assert.equal(result.allModels.length, 0)
    assert.match(result.diagnostics[0], /no OpenRouter connection is active/)
  } finally {
    if (previous === undefined) delete process.env.OPENROUTER_API_KEY
    else process.env.OPENROUTER_API_KEY = previous
  }
})

test("normalizes Ollama Cloud models and excludes decision-only entries", () => {
  const model = normalizeOllamaCloudModel(
    ollamaCloudPayload.models[0],
    ollamaCloudTags.models[0],
  )
  assert.equal(model.id, "gpt-oss:120b")
  assert.equal(model.context, 131072)
  assert.equal(model.output, 32768)
  assert.equal(model.tools, true)
  assert.equal(model.freeClass, "free-tier")
  assert.equal(model.privacy.trainsOnPrompts, "unknown")
  assert.equal(normalizeOllamaCloudModel(ollamaCloudPayload.models[1]), null)
})

test("resolves the stored Ollama Cloud connection and registers cloud models", async () => {
  const previous = process.env.OLLAMA_API_KEY
  delete process.env.OLLAMA_API_KEY

  try {
    const { ctx, providers } = createContext({
      options: {
        providers: {
          kilo: { enabled: false },
          openrouter: { enabled: false },
          ollamaCloud: { enabled: true, env: "OLLAMA_API_KEY" },
        },
        policy: { allowUnknownPrivacy: true },
      },
      connections: {
        "ollama-cloud": { type: "key", key: "test-key" },
      },
      fetchImpl: async (url) =>
        String(url).includes("/api/tags")
          ? jsonResponse(ollamaCloudTags)
          : jsonResponse(ollamaCloudPayload),
    })

    await plugin.setup(ctx)

    assert.equal(providers.length, 1)
    assert.equal(providers[0].info.id, "free-ollama-cloud")
    assert.equal(providers[0].info.name, "OPENFREE Ollama Cloud")
    assert.equal(providers[0].info.integrationID, "ollama-cloud")
    assert.equal(providers[0].models.length, 1)
    assert.equal(providers[0].models[0].id, "gpt-oss:120b")
  } finally {
    if (previous === undefined) delete process.env.OLLAMA_API_KEY
    else process.env.OLLAMA_API_KEY = previous
  }
})

test("resolves Cloudflare Workers AI connection and account ID", async () => {
  const previous = process.env.CLOUDFLARE_API_TOKEN
  delete process.env.CLOUDFLARE_API_TOKEN

  try {
    const { ctx, providers, storage } = createContext({
      options: {
        providers: {
          kilo: { enabled: false },
          openrouter: { enabled: false },
          ollamaCloud: { enabled: false },
          cloudflare: { enabled: true, env: "CLOUDFLARE_API_TOKEN" },
        },
      },
      connections: {
        "cloudflare-workers-ai": {
          type: "key",
          key: "test-key",
          configuration: { accountId: "acct-123" },
        },
      },
      fetchImpl: async () =>
        jsonResponse({
          result: [
            {
              id: "uuid-1",
              name: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
              properties: [
                { property_id: "context_window", value: "24000" },
                { property_id: "function_calling", value: "true" },
              ],
            },
          ],
        }),
    })

    await plugin.setup(ctx)

    assert.equal(providers.length, 1)
    assert.equal(providers[0].info.id, "free-cloudflare")
    assert.equal(providers[0].info.package, "@opencode/ai/providers/cloudflare-workers-ai")
    assert.equal(providers[0].info.settings.accountId, "acct-123")
    assert.equal(providers[0].models.length, 1)
    const cachedProvider = storage.get("free-models:inventory:v17").providers
      .find((provider) => provider.providerId === "free-cloudflare")
    assert.equal(cachedProvider.package, "@opencode/ai/providers/cloudflare-workers-ai")
    assert.equal(cachedProvider.settings.accountId, "acct-123")
  } finally {
    if (previous === undefined) delete process.env.CLOUDFLARE_API_TOKEN
    else process.env.CLOUDFLARE_API_TOKEN = previous
  }
})

test("preserves Cloudflare provider metadata when registering from cache", async () => {
  let fetchCalls = 0
  const { ctx, providers, storage } = createContext({
    options: {
      providers: Object.fromEntries(PROVIDER_KEYS.map((key) => [
        key,
        { enabled: key === "cloudflare", env: "" },
      ])),
    },
    connections: {
      "cloudflare-workers-ai": {
        type: "key",
        key: "test-key",
        configuration: { accountId: "acct-123" },
      },
    },
    fetchImpl: async () => {
      fetchCalls += 1
      return jsonResponse({})
    },
  })
  storage.set("free-models:inventory:v17", {
    version: 1,
    fetchedAt: Date.now(),
    credentialFingerprint: credentialFingerprint({
      cloudflare: { key: "test-key", source: "cloudflare-workers-ai" },
      cloudflareAccountId: "acct-123",
    }),
    providers: [{
      providerId: "free-cloudflare",
      name: "OPENFREE Cloudflare Workers AI",
      package: "@opencode/ai/providers/cloudflare-workers-ai",
      settings: { accountId: "acct-123" },
      integration: { id: "cloudflare-workers-ai", register: false },
      allModels: [{
        id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        name: "Llama 3.3 70B",
        freeClass: "free-tier",
        privacy: { trainsOnPrompts: false },
        tools: true,
        context: 24000,
        output: 4096,
      }],
      diagnostics: [],
    }],
    diagnostics: [],
  })

  await plugin.setup(ctx)

  assert.equal(fetchCalls, 0)
  const provider = providers.find((entry) => entry.info.id === "free-cloudflare")
  assert.ok(provider)
  assert.equal(provider.info.package, "@opencode/ai/providers/cloudflare-workers-ai")
  assert.equal(provider.info.settings.accountId, "acct-123")
  assert.equal(provider.models.length, 1)
})

test("Ollama Cloud adapter skips without an API key", async () => {
  const previous = process.env.OLLAMA_API_KEY
  delete process.env.OLLAMA_API_KEY

  try {
    const { discoverOllamaCloud } = await import("../src/adapters/ollama-cloud.js")
    const result = await discoverOllamaCloud(mergeConfig())
    assert.equal(result.allModels.length, 0)
    assert.match(result.diagnostics[0], /OLLAMA_API_KEY is not set/)
  } finally {
    if (previous === undefined) delete process.env.OLLAMA_API_KEY
    else process.env.OLLAMA_API_KEY = previous
  }
})
