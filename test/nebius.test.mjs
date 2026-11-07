import assert from "node:assert/strict"
import test from "node:test"
import { discoverNebius, normalizeNebiusModel } from "../src/adapters/nebius.js"
import { filterModels } from "../src/policy.js"
import fixture from "../fixtures/nebius-models.json" with { type: "json" }

const config = {
  providers: { nebius: { enabled: true, env: "NEBIUS_API_KEY" } },
  credentials: { nebius: { key: "test-key" } },
  catalog: { timeoutMs: 1000 },
  fetch: async (url, options) => {
    assert.equal(url, "https://api.tokenfactory.nebius.com/v1/models")
    assert.equal(options.headers.authorization, "Bearer test-key")
    return new Response(JSON.stringify(fixture), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  },
}

test("normalizes Nebius models as trial-credit with defaults and privacy", () => {
  const model = normalizeNebiusModel(fixture.data[0])
  assert.equal(model.id, "meta-llama/Llama-3.3-70B-Instruct")
  assert.equal(model.context, 131072)
  assert.equal(model.output, 8192)
  assert.equal(model.tools, true)
  assert.equal(model.freeClass, "trial-credit")
  assert.deepEqual(model.privacy, {
    trainsOnPrompts: true,
    source: "https://docs.nebius.com/legal/token-factory",
  })
  const explicit = normalizeNebiusModel(fixture.data[1])
  assert.equal(explicit.context, 65536)
  assert.equal(explicit.output, 4096)
})

test("discovers all Nebius fixture models without an allowlist", async () => {
  const result = await discoverNebius(config)
  assert.equal(result.providerId, "free-nebius")
  assert.equal(result.name, "OPENFREE Nebius")
  assert.equal(result.baseURL, "https://api.tokenfactory.nebius.com/v1")
  assert.equal(result.integration.id, "nebius")
  assert.equal(result.integration.register, false)
  assert.deepEqual(result.diagnostics, [])
  assert.deepEqual(result.allModels.map((model) => model.id), fixture.data.map((model) => model.id))
  assert.ok(result.allModels.every((model) => model.tools && model.freeClass === "trial-credit"))
})

test("Nebius trial credits require explicit policy opt-in", async () => {
  const { allModels } = await discoverNebius(config)
  const policy = { allowTraining: true, allowUnknownPrivacy: true }
  assert.deepEqual(filterModels(allModels, policy), [])
  assert.deepEqual(filterModels(allModels, { ...policy, allowTrialCredits: false }), [])
  assert.deepEqual(filterModels(allModels, { ...policy, allowTrialCredits: true }), allModels)
})
