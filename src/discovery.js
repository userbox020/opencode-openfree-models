import { discoverAlibaba } from "./adapters/alibaba.js"
import { discoverBazaarLink } from "./adapters/bazaarlink.js"
import { discoverByteplus } from "./adapters/byteplus.js"
import { discoverCloudflare } from "./adapters/cloudflare.js"
import { discoverCohere } from "./adapters/cohere.js"
import { discoverGemini } from "./adapters/gemini.js"
import { discoverGroq } from "./adapters/groq.js"
import { discoverKilo } from "./adapters/kilo.js"
import { discoverKimchi } from "./adapters/kimchi.js"
import { discoverMistral } from "./adapters/mistral.js"
import { discoverNebius } from "./adapters/nebius.js"
import { discoverNvidia } from "./adapters/nvidia.js"
import { discoverOllamaCloud } from "./adapters/ollama-cloud.js"
import { discoverOpenRouter } from "./adapters/openrouter.js"
import { discoverSambaNova } from "./adapters/sambanova.js"
import { discoverZai } from "./adapters/zai.js"

const ADAPTERS = [
  ["kilo", discoverKilo],
  ["openrouter", discoverOpenRouter],
  ["ollamaCloud", discoverOllamaCloud],
  ["gemini", discoverGemini],
  ["groq", discoverGroq],
  ["mistral", discoverMistral],
  ["cohere", discoverCohere],
  ["cloudflare", discoverCloudflare],
  ["sambanova", discoverSambaNova],
  ["zai", discoverZai],
  ["nvidia", discoverNvidia],
  ["alibaba", discoverAlibaba],
  ["nebius", discoverNebius],
  ["bazaarlink", discoverBazaarLink],
  ["byteplus", discoverByteplus],
  ["kimchi", discoverKimchi],
]

export async function discoverAll(config) {
  const tasks = []

  for (const [key, discover] of ADAPTERS) {
    if (config.providers[key]?.enabled) {
      tasks.push(discover(config))
    }
  }

  const results = await Promise.allSettled(tasks)
  const providers = []
  const diagnostics = []

  for (const result of results) {
    if (result.status === "fulfilled") {
      providers.push(result.value)
      diagnostics.push(...(result.value.diagnostics || []))
    } else {
      diagnostics.push(String(result.reason?.message || result.reason))
    }
  }

  return {
    version: 1,
    fetchedAt: Date.now(),
    providers,
    diagnostics,
  }
}
