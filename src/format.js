function privacyLabel(model) {
  const value = model.privacy?.trainsOnPrompts
  if (value === true) return "train:yes"
  if (value === false) return "train:no"
  return "train:unknown"
}

function reasonForEmpty(provider, config) {
  if (!provider.allModels.length) return "no free models discovered"
  if (!config.policy.allowTraining && provider.allModels.some((model) => model.privacy?.trainsOnPrompts === true)) {
    return "blocked by allowTraining=false"
  }
  if (!config.policy.allowUnknownPrivacy && provider.allModels.some((model) => model.privacy?.trainsOnPrompts === "unknown")) {
    return "blocked by allowUnknownPrivacy=false"
  }
  return "blocked by policy"
}

export function formatList(inventory, config) {
  const lines = [
    `Free model providers (allowTraining=${config.policy.allowTraining}, allowUnknownPrivacy=${config.policy.allowUnknownPrivacy})`,
    "",
  ]

  for (const provider of inventory.providers) {
    const count = provider.models.length
    const discovered = provider.allModels.length
    lines.push(`${provider.providerId} (${provider.name}): ${count}/${discovered} eligible`)
    if (!count && discovered) {
      lines.push(`  ${reasonForEmpty(provider, config)}`)
    }
    for (const model of provider.models) {
      lines.push(
        `  ${provider.providerId}/${model.id}  ctx=${model.context}  out=${model.output}  tools=${model.tools ? "yes" : "no"}  ${privacyLabel(model)}`,
      )
    }
    lines.push("")
  }

  if (inventory.diagnostics.length) {
    lines.push("Diagnostics:")
    for (const diagnostic of inventory.diagnostics) lines.push(`  - ${diagnostic}`)
  }

  return lines.join("\n").trimEnd()
}

export function formatDoctor(inventory, config) {
  const ageSeconds = Math.max(0, Math.round((Date.now() - inventory.fetchedAt) / 1000))
  const lines = [
    "Free model doctor",
    `cache age: ${ageSeconds}s`,
    `catalog timeout: ${config.catalog.timeoutMs}ms`,
    `cache ttl: ${config.catalog.ttlSeconds}s`,
    "",
  ]

  for (const provider of inventory.providers) {
    lines.push(`${provider.providerId}: ${provider.models.length}/${provider.allModels.length} eligible`)
    if (provider.integration) {
      const envName = provider.integration.env
      lines.push(`  auth: env ${envName} (${process.env[envName] ? "present" : "missing"})`)
    } else {
      lines.push("  auth: none")
    }
    lines.push(`  baseURL: ${provider.baseURL}`)
  }

  lines.push("", "Policy:")
  lines.push(`  allowFreeTier: ${config.policy.allowFreeTier}`)
  lines.push(`  allowTraining: ${config.policy.allowTraining}`)
  lines.push(`  allowUnknownPrivacy: ${config.policy.allowUnknownPrivacy}`)
  lines.push(`  allowTrialCredits: ${config.policy.allowTrialCredits}`)

  if (inventory.diagnostics.length) {
    lines.push("", "Diagnostics:")
    for (const diagnostic of inventory.diagnostics) lines.push(`  - ${diagnostic}`)
  }

  return lines.join("\n").trimEnd()
}

export function formatPrivacy(inventory) {
  const lines = ["Free model privacy labels", ""]
  for (const provider of inventory.providers) {
    lines.push(`${provider.providerId}:`)
    for (const model of provider.models) {
      lines.push(`  ${model.id}  ${privacyLabel(model)}  ${model.privacy?.source || ""}`.trimEnd())
    }
    if (!provider.models.length) lines.push("  (no eligible models)")
    lines.push("")
  }
  return lines.join("\n").trimEnd()
}

export function formatHelp() {
  return [
    "Usage: /free-models [list|refresh|doctor|privacy]",
    "",
    "  list     Show eligible free models (default)",
    "  refresh  Fetch catalogs and reload provider/model transforms",
    "  doctor   Show cache, auth presence, policy, and diagnostics",
    "  privacy  Show training/retention labels",
  ].join("\n")
}
