export async function resolveCredential(ctx, integrationIDs, envName) {
  if (envName && process.env[envName]) {
    return { key: process.env[envName], source: "env" }
  }

  for (const integrationID of integrationIDs) {
    try {
      const connection = await ctx.integration.connection.active(integrationID)
      if (!connection) continue

      const value = await ctx.integration.connection.resolve(connection)
      if (value?.type === "key" && value.key) {
        return {
          key: value.key,
          source: integrationID,
          configuration: value.configuration,
        }
      }
      if (value?.type === "oauth" && value.access) {
        return {
          key: value.access,
          source: integrationID,
          configuration: value.configuration,
        }
      }
    } catch {
      // Try the next approved integration source.
    }
  }

  return null
}
