import assert from "node:assert/strict"
import test from "node:test"
import { discoverBazaarLink, normalizeBazaarLinkModel } from "../src/adapters/bazaarlink.js"
import fixture from "../fixtures/bazaarlink-models.json" with { type: "json" }

const expectedIDs = ["auto:free"]

test("normalizes only allowlisted BazaarLink free models", () => {
  const models = fixture.data.map(normalizeBazaarLinkModel).filter(Boolean)
  assert.deepEqual(models.map((model) => model.id), expectedIDs)
  assert.equal(normalizeBazaarLinkModel(fixture.data.at(-1)), null)
  for (const model of models) {
    assert.equal(model.context, 200000)
    assert.equal(model.output, 32768)
    assert.equal(model.tools, true)
    assert.equal(model.freeClass, "free-tier")
    assert.deepEqual(model.privacy, { trainsOnPrompts: "unknown", source: "https://bazaarlink.ai" })
  }
})

test("discovers BazaarLink models using only the fixture", async () => {
  let calls = 0
  const result = await discoverBazaarLink({
    providers: { bazaarlink: { enabled: true, env: "BAZAARLINK_API_KEY" } },
    credentials: { bazaarlink: { key: "test-key" } },
    catalog: { timeoutMs: 1000 },
    fetch: async (url, options) => {
      calls++
      assert.equal(url, "https://bazaarlink.ai/api/v1/models")
      assert.equal(options.headers.authorization, "Bearer test-key")
      return new Response(JSON.stringify(fixture), { status: 200, headers: { "content-type": "application/json" } })
    },
  })
  assert.equal(calls, 1)
  assert.equal(result.providerId, "free-bazaarlink")
  assert.equal(result.name, "OPENFREE BazaarLink")
  assert.equal(result.baseURL, "https://bazaarlink.ai/api/v1")
  assert.equal(result.integration.id, "free-bazaarlink")
  assert.equal(result.integration.register, true)
  assert.deepEqual(result.allModels.map((model) => model.id), expectedIDs)
  assert.ok(result.allModels.every((model) => model.tools))
  assert.deepEqual(result.diagnostics, [])
})
