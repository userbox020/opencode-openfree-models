import assert from "node:assert/strict"
import test from "node:test"
import { discoverSambaNova, normalizeSambaNovaModel } from "../src/adapters/sambanova.js"
import fixture from "../fixtures/sambanova-models.json" with { type: "json" }

const expectedIDs = ["DeepSeek-V3.1", "Meta-Llama-3.3-70B-Instruct", "gpt-oss-120b", "DeepSeek-V3.2", "gemma-4-31B-it"]

test("normalizes only allowlisted SambaNova free models", () => {
  const models = fixture.data.map(normalizeSambaNovaModel).filter(Boolean)
  assert.deepEqual(models.map((model) => model.id), expectedIDs)
  assert.equal(normalizeSambaNovaModel(fixture.data.at(-1)), null)
  for (const model of models) {
    assert.equal(model.context, 131072)
    assert.equal(model.output, 32768)
    assert.equal(model.tools, true)
    assert.equal(model.freeClass, "free-tier")
    assert.deepEqual(model.privacy, { trainsOnPrompts: "unknown", source: "https://docs.sambanova.ai/docs/en/models/rate-limits" })
  }
})

test("discovers SambaNova models using only the fixture", async () => {
  let calls = 0
  const result = await discoverSambaNova({
    providers: { sambanova: { enabled: true, env: "SAMBANOVA_API_KEY" } },
    credentials: { sambanova: { key: "test-key" } },
    catalog: { timeoutMs: 1000 },
    fetch: async (url, options) => {
      calls++
      assert.equal(url, "https://api.sambanova.ai/v1/models")
      assert.equal(options.headers.authorization, "Bearer test-key")
      return new Response(JSON.stringify(fixture), { status: 200, headers: { "content-type": "application/json" } })
    },
  })
  assert.equal(calls, 1)
  assert.equal(result.providerId, "free-sambanova")
  assert.equal(result.name, "OPENFREE SambaNova")
  assert.equal(result.baseURL, "https://api.sambanova.ai/v1")
  assert.equal(result.integration.id, "sambanova")
  assert.equal(result.integration.register, false)
  assert.deepEqual(result.allModels.map((model) => model.id), expectedIDs)
  assert.ok(result.allModels.every((model) => model.tools))
  assert.deepEqual(result.diagnostics, [])
})
