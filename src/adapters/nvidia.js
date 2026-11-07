import { createOpenAICompatibleAdapter } from "./openai-compatible.js"

const spec = {
  configKey: "nvidia",
  providerId: "free-nvidia",
  displayName: "OPENFREE NVIDIA NIM",
  baseURL: "https://integrate.api.nvidia.com/v1",
  catalogURL: "https://integrate.api.nvidia.com/v1/models",
  env: "NVIDIA_API_KEY",
  integrationID: "nvidia",
  registerIntegration: false,
  freeClass: "trial-credit",
  privacy: { trainsOnPrompts: true, source: "https://build.nvidia.com/" },
  defaultContext: 131072,
  defaultOutput: 8192,
  tools: true,
}

const adapter = createOpenAICompatibleAdapter(spec)

export const discoverNvidia = adapter.discover
export const normalizeNvidiaModel = adapter.normalize
export { spec as nvidiaSpec }
