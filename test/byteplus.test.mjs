import assert from "node:assert/strict"
import test from "node:test"
import { discoverByteplus, normalizeByteplusModel } from "../src/adapters/byteplus.js"
import { filterModels } from "../src/policy.js"
import fixture from "../fixtures/byteplus-models.json" with { type: "json" }

const config = {
  providers: { byteplus: { enabled: true, env: "BYTEPLUS_API_KEY" } },
  credentials: { byteplus: { key: "test-key" } },
  catalog: { timeoutMs: 1000 },
  fetch: async (url, options) => {
    assert.equal(url, "https://ark.ap-southeast.bytepluses.com/api/coding/v3/models")
    assert.equal(options.headers.authorization, "Bearer test-key")
    return new Response(JSON.stringify(fixture), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  },
}

test("normalizes BytePlus models as trial-credit with defaults and privacy", () => {
  const model = normalizeByteplusModel(fixture.data[0])
  assert.equal(model.id, "seed-2-0-pro-260328")
  assert.equal(model.context, 131072)
  assert.equal(model.output, 8192)
  assert.equal(model.tools, true)
  assert.equal(model.freeClass, "trial-credit")
  assert.deepEqual(model.privacy, {
    trainsOnPrompts: "unknown",
    source: "https://console.byteplus.com/ark",
  })
  const explicit = normalizeByteplusModel(fixture.data[1])
  assert.equal(explicit.context, 65536)
  assert.equal(explicit.output, 4096)
  assert.equal(normalizeByteplusModel(fixture.data.at(-1)), null)
})

test("discovers only allowlisted BytePlus fixture models", async () => {
  const result = await discoverByteplus(config)
  assert.equal(result.providerId, "free-byteplus")
  assert.equal(result.name, "OPENFREE BytePlus")
  assert.equal(result.baseURL, "https://ark.ap-southeast.bytepluses.com/api/coding/v3")
  assert.equal(result.integration.id, "free-byteplus")
  assert.equal(result.integration.register, true)
  assert.deepEqual(result.diagnostics, [])
  assert.deepEqual(result.allModels.map((model) => model.id), [
    "seed-2-0-pro-260328",
    "seed-2-0-code-preview-260328",
    "seed-2-0-mini-260215",
    "seed-2-0-lite-260228",
    "kimi-k2-thinking-251104",
    "glm-4-7-251222",
    "gpt-oss-120b-250805",
  ])
  assert.ok(result.allModels.every((model) => model.tools && model.freeClass === "trial-credit"))
})

test("BytePlus trial credits require explicit policy opt-in", async () => {
  const { allModels } = await discoverByteplus(config)
  const policy = { allowTraining: true, allowUnknownPrivacy: true }
  assert.deepEqual(filterModels(allModels, policy), [])
  assert.deepEqual(filterModels(allModels, { ...policy, allowTrialCredits: false }), [])
  assert.deepEqual(filterModels(allModels, { ...policy, allowTrialCredits: true }), allModels)
})
