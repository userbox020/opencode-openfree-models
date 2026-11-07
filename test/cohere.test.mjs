import assert from "node:assert/strict"
import test from "node:test"
import { discoverCohere, normalizeCohereModel, cohereSpec } from "../src/adapters/cohere.js"
import fixture from "../fixtures/cohere-models.json" with { type: "json" }

test("normalizes Cohere names, context, output, tools and privacy", () => {
  const model = normalizeCohereModel(fixture.models[0])
  assert.equal(model.id, "command-a-03-2025")
  assert.equal(model.context, 256000)
  assert.equal(model.output, 4096)
  assert.equal(model.tools, true)
  assert.equal(model.freeClass, "free-tier")
  assert.equal(model.privacy.trainsOnPrompts, "unknown")
  assert.equal(normalizeCohereModel(fixture.models[4]).context, 128000)
  assert.equal(normalizeCohereModel(fixture.models.at(-1)), null)
})

test("Cohere uses name as ID and a fixed output limit", () => {
  const model = normalizeCohereModel({ ...fixture.models[0], id: "other-id", max_completion_tokens: 9000 })
  assert.equal(model.id, "command-a-03-2025")
  assert.equal(model.output, 4096)
})

test("discovers Cohere native catalog with compatibility inference URL", async () => {
  let calls = 0
  const result = await discoverCohere({
    providers: { cohere: { enabled: true } },
    credentials: { cohere: { key: "fixture-key" } },
    catalog: { timeoutMs: 1000 },
    fetch: async (url, options) => {
      calls++
      assert.equal(String(url), "https://api.cohere.ai/v1/models?page_size=100")
      assert.equal(new Headers(options.headers).get("authorization"), "Bearer fixture-key")
      return Response.json(fixture)
    },
  })
  assert.equal(calls, 1)
  assert.equal(result.providerId, "free-cohere")
  assert.equal(result.name, "OPENFREE Cohere")
  assert.equal(result.baseURL, "https://api.cohere.ai/compatibility/v1")
  assert.equal(result.integration.id, "cohere")
  assert.equal(result.integration.register, false)
  assert.deepEqual(result.allModels.map((model) => model.id), cohereSpec.allowlist)
  assert.ok(result.allModels.every((model) => model.tools && model.output === 4096))
  assert.deepEqual(result.diagnostics, [])
})
