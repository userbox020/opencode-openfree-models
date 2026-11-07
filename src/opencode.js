export function toProviderInfo(provider) {
  const info = {
    id: provider.providerId,
    name: provider.name,
    activation: "enabled",
    package: provider.package || "@opencode/ai/providers/openai-compatible",
    settings: provider.settings || {
      baseURL: provider.baseURL,
    },
  }

  if (provider.integration?.id) {
    info.integrationID = provider.integration.id
  }

  return info
}

export function toModelInfo(providerID, model) {
  return {
    id: model.id,
    modelID: model.id,
    providerID,
    name: model.name,
    capabilities: {
      tools: Boolean(model.tools),
      input: model.input?.length ? model.input : ["text"],
      output: model.outputModalities?.length ? model.outputModalities : ["text"],
    },
    variants: [],
    time: { released: 0 },
    cost: [
      {
        input: 0,
        output: 0,
        cache: { read: 0, write: 0 },
      },
    ],
    status: "active",
    enabled: true,
    limit: {
      context: model.context,
      output: model.output,
    },
  }
}
