import { loadConfig } from "./config.js"
import { credentialFingerprint, readCache, writeCache } from "./cache.js"
import { resolveCredential } from "./credentials.js"
import { discoverAll } from "./discovery.js"
import { toModelInfo, toProviderInfo } from "./opencode.js"
import { applyPolicy } from "./policy.js"
import { registerCommands } from "./commands.js"
import { normalizeWireMessages } from "./cloudflare-wire.js"

async function loadInventory(ctx, config) {
  const fingerprint = credentialFingerprint(config.credentials)
  const cached = await readCache(ctx)
  const freshEnough =
    cached &&
    cached.credentialFingerprint === fingerprint &&
    Date.now() - cached.fetchedAt < config.catalog.ttlSeconds * 1000

  if (freshEnough) {
    return applyPolicy(cached, config.policy)
  }

  const fresh = await discoverAll(config)
  const inventory = applyPolicy(fresh, config.policy)

  if (inventory.providers.some((provider) => provider.allModels.length) || !cached) {
    await writeCache(ctx, inventory, fingerprint)
    return inventory
  }

  return applyPolicy(
    {
      ...cached,
      diagnostics: [...(cached.diagnostics || []), "catalog refresh failed; using stale cache"],
    },
    config.policy,
  )
}

async function registerIntegrations(ctx, inventory) {
  const integrations = inventory.providers
    .map((provider) => provider.integration)
    .filter((integration) => integration?.id && integration?.env && integration.register !== false)

  if (!integrations.length) return

  await ctx.integration.transform((editor) => {
    for (const integration of integrations) {
      try {
        editor.update(integration.id, (value) => {
          value.name = integration.name
        })
      } catch {
        // The host may not expose a mutable integration reference for a new ID.
      }

      try {
        editor.method.update({
          integrationID: integration.id,
          method: {
            type: "env",
            names: [integration.env],
          },
        })
        editor.method.update({
          integrationID: integration.id,
          method: {
            type: "key",
            label: "Manually enter API Key",
          },
        })
      } catch {
        // Provider registration still succeeds; auth resolution will report the failure.
      }
    }
  })
}

async function registerProviders(ctx, state) {
  await ctx.provider.transform((editor) => {
    state.addedProviders = new Set()
    const existing = new Set(editor.list().map((record) => record.provider.id))

    for (const provider of state.inventory.providers) {
      if (!provider.models.length) continue
      if (existing.has(provider.providerId)) continue

      try {
        editor.add({
          info: toProviderInfo(provider),
          models: provider.models.map((model) => toModelInfo(provider.providerId, model)),
        })
        state.addedProviders.add(provider.providerId)
      } catch (error) {
        state.inventory.diagnostics.push(
          `${provider.providerId}: provider registration failed: ${error?.message || error}`,
        )
      }
    }
  })
}

async function registerModelFilter(ctx, state) {
  await ctx.model.transform((editor) => {
    for (const provider of state.inventory.providers) {
      if (!state.addedProviders.has(provider.providerId)) continue

      const allowed = new Set(provider.models.map((model) => model.id))
      for (const model of editor.list(provider.providerId)) {
        if (!allowed.has(model.id)) {
          editor.remove(provider.providerId, model.id)
        }
      }
    }
  })
}

const plugin = {
  id: "community.free-models",
  async setup(ctx) {
    const config = await loadConfig(ctx)

    const credentialSpecs = [
      ["openrouter", ["openrouter", "free-openrouter"], config.providers.openrouter.env],
      ["ollamaCloud", ["ollama-cloud", "free-ollama-cloud"], config.providers.ollamaCloud.env],
      ["gemini", ["google", "free-gemini"], config.providers.gemini.env],
      ["groq", ["groq", "free-groq"], config.providers.groq.env],
      ["mistral", ["mistral", "free-mistral"], config.providers.mistral.env],
      ["cohere", ["cohere", "free-cohere"], config.providers.cohere.env],
      ["cloudflare", ["cloudflare-workers-ai", "cloudflare", "free-cloudflare"], config.providers.cloudflare.env],
      ["sambanova", ["sambanova", "free-sambanova"], config.providers.sambanova.env],
      ["zai", ["zai", "free-zai"], config.providers.zai.env],
      ["nvidia", ["nvidia", "free-nvidia"], config.providers.nvidia.env],
      ["alibaba", ["alibaba", "free-alibaba"], config.providers.alibaba.env],
      ["nebius", ["nebius", "free-nebius"], config.providers.nebius.env],
      ["bazaarlink", ["bazaarlink", "free-bazaarlink"], config.providers.bazaarlink.env],
      ["byteplus", ["byteplus", "free-byteplus"], config.providers.byteplus.env],
      ["kimchi", ["kimchi", "free-kimchi"], config.providers.kimchi.env],
    ]

    const resolved = await Promise.all(
      credentialSpecs.map(async ([key, integrationIDs, env]) => [
        key,
        await resolveCredential(ctx, integrationIDs, env),
      ]),
    )

    config.credentials = Object.fromEntries(resolved)
    config.credentials.cloudflareAccountId =
      process.env.CLOUDFLARE_ACCOUNT_ID ||
      config.providers.cloudflare.accountId ||
      config.credentials.cloudflare?.configuration?.accountId ||
      undefined

    const state = {
      inventory: await loadInventory(ctx, config),
      addedProviders: new Set(),
    }

    await registerIntegrations(ctx, state.inventory)
    await registerProviders(ctx, state)
    await registerModelFilter(ctx, state)
    await registerCommands(ctx, state, config)

    const registrations = []
    if (typeof ctx.session?.hook === "function") {
      const registration = await ctx.session.hook(
        "http.request",
        async (event) => {
          const request = event.request
          if (!request || request.method !== "POST") return
          try {
            if (!new URL(request.url).pathname.endsWith("/chat/completions")) return
            const body = await request.clone().json()
            if (!body || !Array.isArray(body.messages)) return
            const headers = new Headers(request.headers)
            headers.delete("content-length")
            event.request = new Request(request, {
              headers,
              body: JSON.stringify({ ...body, messages: normalizeWireMessages(body.messages) }),
            })
          } catch {
            // Leave the original request untouched if parsing or rewriting fails.
          }
        },
        { providerID: "free-cloudflare" },
      )
      registrations.push(registration)
    }

    return async () => {
      for (const registration of registrations) await registration?.dispose?.()
    }
  },
}

export default plugin

export const __test = {
  loadConfig,
  applyPolicy,
  toProviderInfo,
  toModelInfo,
  loadInventory,
}
