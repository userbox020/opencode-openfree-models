import assert from "node:assert/strict"
import test from "node:test"
import { discoverCloudflare, normalizeCloudflareModel, cloudflareSpec } from "../src/adapters/cloudflare.js"
import fixture from "../fixtures/cloudflare-models.json" with { type: "json" }

function config(account = {}) {
  return {
    providers: { cloudflare: { enabled: true } },
    credentials: { cloudflare: { key: "fixture-token" }, ...account },
    catalog: { timeoutMs: 1000 },
    fetch: async () => Response.json(fixture),
  }
}

test("normalizes Cloudflare free-tier models and defaults", () => {
  for (const item of fixture.result.slice(0, -1)) {
    const model = normalizeCloudflareModel(item)
    assert.equal(model.id, item.name)
    assert.equal(model.context, item.name.includes("llama-3.3") ? 24000 : 131072)
    assert.equal(model.output, 32768)
    assert.equal(model.tools, false)
    assert.equal(model.freeClass, "free-tier")
    assert.equal(model.privacy.trainsOnPrompts, false)
  }
  assert.equal(normalizeCloudflareModel(fixture.result.at(-1)), null)
})

test("discovers Cloudflare with credential account ID preferred over provider config", async () => {
  const options = config({ cloudflareAccountId: "fixture-account" })
  options.providers.cloudflare.accountId = "other-account"
  let calls = 0
  options.fetch = async (url, init) => {
    calls++
    assert.equal(String(url), "https://api.cloudflare.com/client/v4/accounts/fixture-account/ai/models/search?per_page=100")
    assert.equal(new Headers(init.headers).get("authorization"), "Bearer fixture-token")
    return Response.json(fixture)
  }
  const result = await discoverCloudflare(options)
  assert.equal(calls, 1)
  assert.equal(result.providerId, "free-cloudflare")
  assert.equal(result.name, "OPENFREE Cloudflare")
  assert.equal(result.baseURL, "https://api.cloudflare.com/client/v4/accounts/fixture-account/ai/v1")
  assert.equal(result.integration.id, "cloudflare-workers-ai")
  assert.equal(result.integration.register, false)
  assert.equal(result.package, "@opencode/ai/providers/cloudflare-workers-ai")
  assert.deepEqual(result.settings, { accountId: "fixture-account" })
  assert.deepEqual(result.allModels.map((model) => model.id), cloudflareSpec.allowlist)
  assert.deepEqual(result.diagnostics, [])
})

test("supports Cloudflare provider account ID and data/models catalog envelopes", async () => {
  for (const envelope of ["data", "models"]) {
    const options = config()
    options.providers.cloudflare.accountId = "provider-account"
    options.fetch = async (url) => {
      assert.equal(String(url), "https://api.cloudflare.com/client/v4/accounts/provider-account/ai/models/search?per_page=100")
      return Response.json({ [envelope]: fixture.result })
    }
    assert.equal((await discoverCloudflare(options)).allModels.length, 7)
  }
})

test("supports Cloudflare environment account ID and skips without an account", async () => {
  const originalEnv = process.env
  process.env = { CLOUDFLARE_ACCOUNT_ID: "environment-account" }
  try {
    const options = config()
    options.fetch = async (url) => {
      assert.equal(String(url), "https://api.cloudflare.com/client/v4/accounts/environment-account/ai/models/search?per_page=100")
      return Response.json(fixture)
    }
    assert.equal((await discoverCloudflare(options)).allModels.length, 7)

    delete process.env.CLOUDFLARE_ACCOUNT_ID
    options.fetch = async () => assert.fail("Missing account ID must not fetch")
    const result = await discoverCloudflare(options)
    assert.equal(result.providerId, "free-cloudflare")
    assert.deepEqual(result.allModels, [])
    assert.deepEqual(result.diagnostics, ["CLOUDFLARE_ACCOUNT_ID is not set; OPENFREE Cloudflare was skipped"])
  } finally {
    process.env = originalEnv
  }
})


