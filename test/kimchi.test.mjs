import assert from "node:assert/strict"
import test from "node:test"
import { discoverKimchi, normalizeKimchiModel } from "../src/adapters/kimchi.js"
import fixture from "../fixtures/kimchi-models.json" with { type: "json" }

const expectedIDs = ["minimax-m3", "kimi-k2.7", "kimi-k2.6", "kimi-k2.5", "nemotron-3-ultra-fp4", "minimax-m2.7", "claude-opus-4-6", "claude-sonnet-4-6"]

test("normalizes only allowlisted Kimchi free models", () => {
  const models = fixture.data.map(normalizeKimchiModel).filter(Boolean)
  assert.deepEqual(models.map((model) => model.id), expectedIDs)
  assert.equal(normalizeKimchiModel(fixture.data.at(-1)), null)
  for (const model of models) {
    assert.equal(model.context, 131072)
    assert.equal(model.output, 32768)
    assert.equal(model.tools, true)
    assert.equal(model.freeClass, "free-tier")
    assert.deepEqual(model.privacy, { trainsOnPrompts: "unknown", source: "https://kimchi.dev" })
  }
})

test("discovers Kimchi models using only the fixture", async () => {
  let calls = 0
  const result = await discoverKimchi({
    providers: { kimchi: { enabled: true, env: "KIMCHI_API_KEY" } },
    credentials: { kimchi: { key: "test-key" } },
    catalog: { timeoutMs: 1000 },
    fetch: async (url, options) => {
      calls++
      assert.equal(url, "https://llm.kimchi.dev/openai/v1/models")
      assert.equal(options.headers.authorization, "Bearer test-key")
      return new Response(JSON.stringify(fixture), { status: 200, headers: { "content-type": "application/json" } })
    },
  })
  assert.equal(calls, 1)
  assert.equal(result.providerId, "free-kimchi")
  assert.equal(result.name, "OPENFREE Kimchi")
  assert.equal(result.baseURL, "https://llm.kimchi.dev/openai/v1")
  assert.equal(result.integration.id, "free-kimchi")
  assert.equal(result.integration.register, true)
  assert.deepEqual(result.allModels.map((model) => model.id), expectedIDs)
  assert.ok(result.allModels.every((model) => model.tools))
  assert.deepEqual(result.diagnostics, [])
})
