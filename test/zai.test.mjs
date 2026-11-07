import assert from "node:assert/strict"
import test from "node:test"
import { discoverZai, normalizeZaiModel } from "../src/adapters/zai.js"
import fixture from "../fixtures/zai-models.json" with { type: "json" }

const expectedIDs = ["glm-4.7-flash", "glm-4.5-flash"]

test("normalizes only allowlisted Z.ai free models", () => {
  const models = fixture.data.map(normalizeZaiModel).filter(Boolean)
  assert.deepEqual(models.map((model) => model.id), expectedIDs)
  assert.equal(normalizeZaiModel(fixture.data.at(-1)), null)
  for (const model of models) {
    assert.equal(model.context, 200000)
    assert.equal(model.output, 32768)
    assert.equal(model.tools, true)
    assert.equal(model.freeClass, "free-tier")
    assert.deepEqual(model.privacy, { trainsOnPrompts: "unknown", source: "https://docs.z.ai/guides/overview/pricing" })
  }
})

test("adds static free Z.ai models when the catalog omits them", async () => {
  const result = await discoverZai({
    providers: { zai: { enabled: true, env: "ZHIPU_API_KEY" } },
    credentials: { zai: { key: "test-key" } },
    catalog: { timeoutMs: 1000 },
    fetch: async () =>
      new Response(JSON.stringify({ data: [{ id: "glm-5" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  })

  assert.deepEqual(result.allModels.map((model) => model.id), expectedIDs)
  assert.equal(result.allModels.find((model) => model.id === "glm-4.5-flash").context, 131072)
})

test("discovers Z.ai models using only the fixture", async () => {
  let calls = 0
  const result = await discoverZai({
    providers: { zai: { enabled: true, env: "ZHIPU_API_KEY" } },
    credentials: { zai: { key: "test-key" } },
    catalog: { timeoutMs: 1000 },
    fetch: async (url, options) => {
      calls++
      assert.equal(url, "https://api.z.ai/api/paas/v4/models")
      assert.equal(options.headers.authorization, "Bearer test-key")
      return new Response(JSON.stringify(fixture), { status: 200, headers: { "content-type": "application/json" } })
    },
  })
  assert.equal(calls, 1)
  assert.equal(result.providerId, "free-zai")
  assert.equal(result.name, "OPENFREE Z.ai")
  assert.equal(result.baseURL, "https://api.z.ai/api/paas/v4")
  assert.equal(result.integration.id, "zai")
  assert.equal(result.integration.register, false)
  assert.deepEqual(result.allModels.map((model) => model.id), expectedIDs)
  assert.ok(result.allModels.every((model) => model.tools))
  assert.deepEqual(result.diagnostics, [])
})

