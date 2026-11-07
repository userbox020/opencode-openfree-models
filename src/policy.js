export function filterModels(models, policy) {
  return models.filter((model) => {
    if (model.freeClass === "trial-credit" && !policy.allowTrialCredits) return false
    if (model.freeClass === "free-tier" && !policy.allowFreeTier) return false
    if (model.privacy?.trainsOnPrompts === true && !policy.allowTraining) return false
    if (model.privacy?.trainsOnPrompts === "unknown" && !policy.allowUnknownPrivacy) return false
    return true
  })
}

export function applyPolicy(inventory, policy) {
  return {
    ...inventory,
    providers: inventory.providers.map((provider) => ({
      ...provider,
      discovered: provider.allModels.length,
      models: filterModels(provider.allModels, policy),
    })),
  }
}
