import assert from "node:assert/strict"
import test from "node:test"
import { discoverNvidia, normalizeNvidiaModel } from "../src/adapters/nvidia.js"
import { filterModels } from "../src/policy.js"
import fixture from "../fixtures/nvidia-models.json" with { type: "json" }

const config = {
  providers: { nvidia: { enabled: true, env: "NVIDIA_API_KEY" } },
  credentials: { nvidia: { key: "test-key" } },
  catalog: { timeoutMs: 1000 },
  fetch: async (url, options) => {
    assert.equal(url, "https://integrate.api.nvidia.com/v1/models")
    assert.equal(options.headers.authorization, "Bearer test-key")
    return new Response(JSON.stringify(fixture), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  },
}

test("normalizes NVIDIA models as trial-credit with defaults and privacy", () => {
  const model = normalizeNvidiaModel(fixture.data[0])
  assert.equal(model.id, "meta/llama-3.3-70b-instruct")
  assert.equal(model.context, 131072)
  assert.equal(model.output, 8192)
  assert.equal(model.tools, true)
  assert.equal(model.freeClass, "trial-credit")
  assert.deepEqual(model.privacy, { trainsOnPrompts: true, source: "https://build.nvidia.com/" })
  const explicit = normalizeNvidiaModel(fixture.data[1])
  assert.equal(explicit.context, 65536)
  assert.equal(explicit.output, 4096)
})

test("discovers all NVIDIA fixture models without an allowlist", async () => {
  const result = await discoverNvidia(config)
  assert.equal(result.providerId, "free-nvidia")
  assert.equal(result.name, "OPENFREE NVIDIA NIM")
  assert.equal(result.baseURL, "https://integrate.api.nvidia.com/v1")
  assert.equal(result.integration.id, "nvidia")
  assert.equal(result.integration.register, false)
  assert.deepEqual(result.diagnostics, [])
  assert.deepEqual(result.allModels.map((model) => model.id), fixture.data.map((model) => model.id))
  assert.ok(result.allModels.every((model) => model.tools && model.freeClass === "trial-credit"))
})

test("NVIDIA trial credits require explicit policy opt-in", async () => {
  const { allModels } = await discoverNvidia(config)
  const policy = { allowTraining: true, allowUnknownPrivacy: true }
  assert.deepEqual(filterModels(allModels, policy), [])
  assert.deepEqual(filterModels(allModels, { ...policy, allowTrialCredits: false }), [])
  assert.deepEqual(filterModels(allModels, { ...policy, allowTrialCredits: true }), allModels)
})
