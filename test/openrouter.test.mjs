import assert from "node:assert/strict"
import test from "node:test"

import { discoverOpenRouter } from "../src/adapters/openrouter.js"

const cases = [
  ["string zero token prices", { prompt: "0", completion: "0" }, true],
  ["numeric zero token prices", { prompt: 0, completion: 0 }, true],
  ["positive request price", { prompt: 0, completion: 0, request: 0.001 }, false],
  ["positive image price", { prompt: 0, completion: 0, image: 0.01 }, false],
  ["positive web search price", { prompt: 0, completion: 0, web_search: "0.01" }, false],
  ["positive reasoning price", { prompt: 0, completion: 0, internal_reasoning: "0.001" }, false],
  ["unknown positive price", { prompt: 0, completion: 0, unknown: "0.001" }, false],
  ["null token prices", { prompt: null, completion: null }, false],
  ["empty token prices", { prompt: "", completion: "" }, false],
  ["whitespace token price", { prompt: "  ", completion: 0 }, false],
  ["tiny positive token price", { prompt: "0.0000001", completion: 0 }, false],
  ["underflowing token price", { prompt: "1e-999", completion: 0 }, false],
  ["underflowing optional price", { prompt: 0, completion: 0, request: "1e-999" }, false],
  ["exponential zero prices", { prompt: "0e-999", completion: "0.000e+10" }, true],
  ["positive completion price", { prompt: 0, completion: "0.0000001" }, false],
  ["missing pricing", undefined, false],
  ["null pricing", null, false],
  ["non-object pricing", "0", false],
  ["array pricing", [], false],
  ["missing prompt price", { completion: 0 }, false],
  ["missing completion price", { prompt: 0 }, false],
  ["negative token price", { prompt: -1, completion: 0 }, false],
  ["NaN token price", { prompt: "NaN", completion: 0 }, false],
  ["infinite token price", { prompt: "Infinity", completion: 0 }, false],
  ["non-numeric token price", { prompt: "free", completion: 0 }, false],
  ["boolean token price", { prompt: false, completion: 0 }, false],
  ["array token price", { prompt: [], completion: 0 }, false],
  ["object token price", { prompt: {}, completion: 0 }, false],
  ["unknown null price", { prompt: 0, completion: 0, unknown: null }, true],
  ["optional zero prices", { prompt: 0, completion: 0, request: 0, image: "0" }, true],
  ["non-text output", { prompt: 0, completion: 0 }, false, ["image"]],
  ["mixed output", { prompt: 0, completion: 0 }, false, ["text", "image"]],
]

for (const [name, pricing, accepted, outputModalities = ["text"]] of cases) {
  test(`OpenRouter discovery: ${name}`, async () => {
    const model = {
      id: "fixture/model",
      name: "Fixture model",
      architecture: { input_modalities: ["text"], output_modalities: outputModalities },
      pricing,
    }
    let fetchCalls = 0
    const result = await discoverOpenRouter({
      providers: { openrouter: {} },
      credentials: { openrouter: { key: "test-key", source: "openrouter" } },
      catalog: { timeoutMs: 1000 },
      fetch: async (url, options) => {
        fetchCalls += 1
        assert.equal(url, "https://openrouter.ai/api/v1/models")
        assert.equal(options.headers.authorization, "Bearer test-key")
        return new Response(JSON.stringify({ data: [model] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      },
    })

    assert.equal(fetchCalls, 1)
    assert.deepEqual(result.allModels.map((entry) => entry.id), accepted ? [model.id] : [])
    assert.deepEqual(result.diagnostics, [])
  })
}
