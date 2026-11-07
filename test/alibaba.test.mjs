import assert from "node:assert/strict"
import test from "node:test"
import { discoverAlibaba, normalizeAlibabaModel } from "../src/adapters/alibaba.js"
import { filterModels } from "../src/policy.js"
import fixture from "../fixtures/alibaba-models.json" with { type: "json" }

const config = {
  providers: { alibaba: { enabled: true, env: "DASHSCOPE_API_KEY" } },
  credentials: { alibaba: { key: "test-key" } },
  catalog: { timeoutMs: 1000 },
  fetch: async (url, options) => {
    assert.equal(url, "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models")
    assert.equal(options.headers.authorization, "Bearer test-key")
    return new Response(JSON.stringify(fixture), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  },
}

test("normalizes Alibaba models as trial-credit with defaults and privacy", () => {
  const model = normalizeAlibabaModel(fixture.data[0])
  assert.equal(model.id, "qwen-plus")
  assert.equal(model.context, 131072)
  assert.equal(model.output, 8192)
  assert.equal(model.tools, true)
  assert.equal(model.freeClass, "trial-credit")
  assert.deepEqual(model.privacy, {
    trainsOnPrompts: "unknown",
    source: "https://www.alibabacloud.com/help/en/model-studio/new-free-quota",
  })
  const explicit = normalizeAlibabaModel(fixture.data[1])
  assert.equal(explicit.context, 65536)
  assert.equal(explicit.output, 4096)
})

test("discovers all Alibaba fixture models without an allowlist", async () => {
  const result = await discoverAlibaba(config)
  assert.equal(result.providerId, "free-alibaba")
  assert.equal(result.name, "OPENFREE Alibaba Model Studio")
  assert.equal(result.baseURL, "https://dashscope-intl.aliyuncs.com/compatible-mode/v1")
  assert.equal(result.integration.id, "alibaba")
  assert.equal(result.integration.register, false)
  assert.deepEqual(result.diagnostics, [])
  assert.deepEqual(result.allModels.map((model) => model.id), fixture.data.map((model) => model.id))
  assert.ok(result.allModels.every((model) => model.tools && model.freeClass === "trial-credit"))
})

test("Alibaba trial credits require explicit policy opt-in", async () => {
  const { allModels } = await discoverAlibaba(config)
  const policy = { allowTraining: true, allowUnknownPrivacy: true }
  assert.deepEqual(filterModels(allModels, policy), [])
  assert.deepEqual(filterModels(allModels, { ...policy, allowTrialCredits: false }), [])
  assert.deepEqual(filterModels(allModels, { ...policy, allowTrialCredits: true }), allModels)
})
