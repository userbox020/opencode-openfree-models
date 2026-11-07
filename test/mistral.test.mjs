import assert from "node:assert/strict"
import test from "node:test"
import { discoverMistral, normalizeMistralModel, mistralSpec } from "../src/adapters/mistral.js"
import fixture from "../fixtures/mistral-models.json" with { type: "json" }

test("normalizes only allowlisted Mistral models with free-tier defaults", () => {
  for (const item of fixture.data.slice(0, -1)) {
    const model = normalizeMistralModel(item)
    assert.equal(model.id, item.id)
    assert.equal(model.context, 131072)
    assert.equal(model.output, 32768)
    assert.equal(model.tools, true)
    assert.equal(model.freeClass, "free-tier")
    assert.equal(model.privacy.trainsOnPrompts, true)
  }
  assert.equal(normalizeMistralModel(fixture.data.at(-1)), null)
})

test("discovers Mistral fixture models using bearer authentication", async () => {
  let calls = 0
  const result = await discoverMistral({
    providers: { mistral: { enabled: true } },
    credentials: { mistral: { key: "fixture-key" } },
    catalog: { timeoutMs: 1000 },
    fetch: async (url, options) => {
      calls++
      assert.equal(String(url), "https://api.mistral.ai/v1/models")
      assert.equal(new Headers(options.headers).get("authorization"), "Bearer fixture-key")
      return Response.json(fixture)
    },
  })
  assert.equal(calls, 1)
  assert.equal(result.providerId, "free-mistral")
  assert.equal(result.name, "OPENFREE Mistral")
  assert.equal(result.baseURL, "https://api.mistral.ai/v1")
  assert.equal(result.integration.id, "mistral")
  assert.equal(result.integration.register, false)
  assert.deepEqual(result.allModels.map((model) => model.id), mistralSpec.allowlist)
  assert.deepEqual(result.diagnostics, [])
})
