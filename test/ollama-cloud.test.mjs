import assert from "node:assert/strict"
import test from "node:test"
import { discoverOllamaCloud } from "../src/adapters/ollama-cloud.js"
import { mergeConfig } from "../src/config.js"

const fixture = {
  models: [
    { slug: " model-a ", display_name: "Model A" },
    { slug: "model-b", display_name: "Model B" },
    { slug: "hidden-model", visibility: "hide" },
  ],
  data: [{ id: "model-c" }],
}

function config(filters = {}) {
  return mergeConfig({
    providers: { ollamaCloud: filters },
    credentials: { ollamaCloud: { key: "fixture-token" } },
    catalog: { timeoutMs: 1000 },
    fetch: async (url) => Response.json(String(url).endsWith("/api/tags") ? { models: [] } : fixture),
  })
}

test("Ollama Cloud allowlist restricts discovered models by exact normalized ID", async () => {
  const result = await discoverOllamaCloud(config({
    allowlist: ["model-a", "model-c", "hidden-model", "missing-model"],
  }))
  assert.deepEqual(result.allModels.map((model) => model.id), ["model-a", "model-c"])

  const unmatched = await discoverOllamaCloud(config({ allowlist: ["model", "MODEL-B", "Model B"] }))
  assert.deepEqual(unmatched.allModels, [])
})

test("Ollama Cloud denylist removes only exact normalized IDs", async () => {
  const result = await discoverOllamaCloud(config({
    denylist: ["model-a", "model", "MODEL-B", "Model B", "missing-model"],
  }))
  assert.deepEqual(result.allModels.map((model) => model.id), ["model-b", "model-c"])
})

test("Ollama Cloud without filters returns the full normalized fixture set", async () => {
  const result = await discoverOllamaCloud(config())
  assert.deepEqual(result.allModels.map((model) => model.id), ["model-a", "model-b", "model-c"])
})

test("Ollama Cloud empty filter arrays preserve the full normalized fixture set", async () => {
  const result = await discoverOllamaCloud(config({ allowlist: [], denylist: [] }))
  assert.deepEqual(result.allModels.map((model) => model.id), ["model-a", "model-b", "model-c"])
})

test("Ollama Cloud denylist takes precedence over allowlist", async () => {
  const result = await discoverOllamaCloud(config({
    allowlist: ["model-a", "model-b"],
    denylist: ["model-b"],
  }))
  assert.deepEqual(result.allModels.map((model) => model.id), ["model-a"])
})
