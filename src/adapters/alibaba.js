import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "alibaba",
  providerId: "free-alibaba",
  displayName: "OPENFREE Alibaba Model Studio",
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  catalogURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models",
  env: "DASHSCOPE_API_KEY",
  integrationID: "alibaba",
  registerIntegration: false,
  freeClass: "trial-credit",
  privacy: {
    trainsOnPrompts: "unknown",
    source: "https://www.alibabacloud.com/help/en/model-studio/new-free-quota",
  },
  defaultContext: 131072,
  defaultOutput: 8192,
  tools: true,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverAlibaba = adapter.discover
export const normalizeAlibabaModel = adapter.normalize
export { spec as alibabaSpec }
