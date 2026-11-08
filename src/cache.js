export const CACHE_KEY = "free-models:inventory:v18"

export function credentialFingerprint(credentials = {}) {
  const parts = []

  for (const [key, value] of Object.entries(credentials)) {
    if (key === "cloudflareAccountId") continue
    if (value?.key) parts.push(`${key}:${value.source || "env"}`)
  }

  if (credentials.cloudflareAccountId) parts.push("cloudflareAccountId:set")

  return parts.sort().join("|")
}

export async function readCache(ctx) {
  try {
    const value = await ctx.storage.get(CACHE_KEY)
    if (!value || value.version !== 1 || !Array.isArray(value.providers)) return null
    return value
  } catch {
    return null
  }
}

export async function writeCache(ctx, inventory, fingerprint = "") {
  try {
    await ctx.storage.set(CACHE_KEY, {
      version: 1,
      fetchedAt: inventory.fetchedAt,
      credentialFingerprint: fingerprint,
      providers: inventory.providers.map((provider) => ({
        providerId: provider.providerId,
        name: provider.name,
        baseURL: provider.baseURL,
        package: provider.package,
        settings: provider.settings,
        integration: provider.integration,
        allModels: provider.allModels,
        diagnostics: provider.diagnostics || [],
      })),
      diagnostics: inventory.diagnostics || [],
    })
  } catch {
    // Cache failures must not break provider registration.
  }
}
