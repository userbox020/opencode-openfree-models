import assert from "node:assert/strict"
import test from "node:test"
import { discoverGemini, normalizeGeminiModel } from "../src/adapters/gemini.js"
import fixture from "../fixtures/gemini-models.json" with { type: "json" }

test("normalizes Gemini native names, limits, tools and privacy", () => {
  const model = normalizeGeminiModel(fixture.models[0])
  assert.equal(model.id, "gemini-3.8-flash")
  assert.equal(model.name, "Gemini 3.8 Flash")
  assert.equal(model.context, 1048576)
  assert.equal(model.output, 65536)
  assert.equal(model.tools, true)
  assert.equal(model.freeClass, "free-tier")
  assert.equal(model.privacy.trainsOnPrompts, true)
})

test("excludes Gemini embeddings, non-generating and unlisted models", () => {
  assert.ok(normalizeGeminiModel(fixture.models[1]))
  for (const model of fixture.models.slice(2)) assert.equal(normalizeGeminiModel(model), null)
})

test("discovers Gemini using query authentication and the native catalog", async () => {
  let calls = 0
  const result = await discoverGemini({
    providers: { gemini: { enabled: true } },
    credentials: { gemini: { key: "fixture-key +&" } },
    catalog: { timeoutMs: 1000 },
    fetch: async (url, options) => {
      calls++
      assert.equal(String(url), "https://generativelanguage.googleapis.com/v1beta/models?key=fixture-key%20%2B%26")
      assert.equal(new Headers(options.headers).has("authorization"), false)
      return Response.json(fixture)
    },
  })
  assert.equal(calls, 1)
  assert.equal(result.providerId, "free-gemini")
  assert.equal(result.name, "OPENFREE Gemini")
  assert.equal(result.baseURL, "https://generativelanguage.googleapis.com/v1beta/openai")
  assert.equal(result.integration.id, "google")
  assert.equal(result.integration.register, false)
  assert.deepEqual(result.allModels.map((model) => model.id), ["gemini-3.8-flash", "gemini-3.6-flash"])
  assert.deepEqual(result.diagnostics, [])
})
