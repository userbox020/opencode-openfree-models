import assert from "node:assert/strict"
import test from "node:test"
import { discoverGroq, normalizeGroqModel } from "../src/adapters/groq.js"
import fixture from "../fixtures/groq-models.json" with { type: "json" }

const expectedIDs = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]

test("normalizes only allowlisted Groq free models", () => {
  const models = fixture.data.map(normalizeGroqModel).filter(Boolean)
  assert.deepEqual(models.map((model) => model.id), expectedIDs)
  assert.equal(normalizeGroqModel(fixture.data.at(-1)), null)
  for (const model of models) {
    assert.equal(model.context, 131072)
    assert.equal(model.output, 32768)
    assert.equal(model.tools, false)
    assert.equal(model.freeClass, "free-tier")
    assert.deepEqual(model.privacy, { trainsOnPrompts: false, source: "https://console.groq.com/docs/your-data" })
  }
})

test("discovers Groq models using only the fixture", async () => {
  let calls = 0
  const result = await discoverGroq({
    providers: { groq: { enabled: true, env: "GROQ_API_KEY" } },
    credentials: { groq: { key: "test-key" } },
    catalog: { timeoutMs: 1000 },
    fetch: async (url, options) => {
      calls++
      assert.equal(url, "https://api.groq.com/openai/v1/models")
      assert.equal(options.headers.authorization, "Bearer test-key")
      return new Response(JSON.stringify(fixture), { status: 200, headers: { "content-type": "application/json" } })
    },
  })
  assert.equal(calls, 1)
  assert.equal(result.providerId, "free-groq")
  assert.equal(result.name, "OPENFREE Groq")
  assert.equal(result.baseURL, "https://api.groq.com/openai/v1")
  assert.equal(result.integration.id, "groq")
  assert.equal(result.integration.register, false)
  assert.deepEqual(result.allModels.map((model) => model.id), expectedIDs)
  assert.ok(result.allModels.every((model) => !model.tools))
  assert.deepEqual(result.diagnostics, [])
})

