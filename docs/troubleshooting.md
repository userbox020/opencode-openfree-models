# Troubleshooting

## No models appear

Check policy first:

```json
{
  "allowTraining": true,
  "allowUnknownPrivacy": true
}
```

Strict mode hides Kilo and unknown-privacy models by design.

Then run:

```text
/free-models doctor
```

## Provider missing entirely

- Kilo: catalog request may have failed.
- OpenRouter: no active `openrouter` connection and no `OPENROUTER_API_KEY`.
- Ollama Cloud: no active `ollama-cloud` connection and no `OLLAMA_API_KEY`.

Verify credentials:

```powershell
opencode auth list
```

## `401` / `403`

- OpenRouter: reconnect the OpenRouter integration.
- Ollama Cloud: reconnect the Ollama Cloud integration.
- Kilo: anonymous access may be rate-limited or region-restricted.

## Groq `Request too large` / TPM error

Groq’s free tier has a low TPM ceiling. The full `build` agent prompt plus tool schemas can exceed it. The plugin marks Groq models tool-less, but current OpenCode agents can still expose tools despite that flag. Prefer a small prompt with the `general` or `explorer` agent, or a clean project. The 2026-11-06 smoke check returned 3/3 OK, not a guarantee that larger agent requests fit the quota.

## `429`

The provider is rate-limiting. Wait for the reset window and avoid high concurrency. The MVP does not retry across providers.

## Gemini daily quota or incomplete streams

On 2026-11-06, `gemini-3.1-pro-preview` hit the free-tier **daily** quota. Repeated immediate retries will not restore it; wait for the quota reset or select another eligible model. Quotas depend on the model and project.

`gemini-3.8-flash` was rate-limited/timed out, while `gemma-4-31b-it` ended its stream without `finish_reason`. That stream failure is distinct from a daily-quota error. The successful models in this check were `gemini-3-flash-preview`, `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`, and `gemini-3.6-flash`.

## Stale model list

The inventory is cached under `free-models:inventory:v17`. Cached providers preserve `package` and `settings`, including Cloudflare's `@opencode/ai/providers/cloudflare-workers-ai` package. Try:

```text
/free-models refresh
```

If code changed, restart the service:

```powershell
opencode service restart
```

## Provider names show old values

Local plugin code changes may not reload with `opencode reload`. Restart the service and start a new session.

## Ollama Cloud shows no models

Confirm the credential is active:

```powershell
opencode auth list
```

The catalog is public, but inference requires a valid Ollama Cloud credential.

## Ollama Cloud `PLAN_LIMIT` / “not included in your free usage”

This means the model is not included in the current plan, not that the API key is necessarily invalid. The catalog does not expose plan entitlement, so the plugin can list a model that the account cannot use for free. On 2026-11-06, 18 of 25 listed models returned this error; the smoke script labels it `PLAN_LIMIT`.

The seven working IDs on the tested free plan were `beam`, `gemma4:31b`, `gpt-oss:120b`, `gpt-oss:20b`, `nemotron-3-nano:30b`, `nemotron-3-super`, and `nemotron-3-ultra`. Set an optional `providers.ollamaCloud.allowlist` to these exact IDs, or exclude unwanted IDs with `denylist`; see the [example](../README.md#optional-ollama-cloud-allowlist). Absent/empty lists do not filter; denylist wins. Refresh the catalog after changing filters. The plugin does not upgrade plans or fall back to paid models.

## OpenRouter shows no models

Confirm the OpenRouter connection is active. The plugin reuses the `openrouter` integration; a `free-openrouter` env-only method is a fallback.

## OpenRouter Gemma upstream errors

On 2026-11-06, `google/gemma-4-26b-a4b-it:free` and `google/gemma-4-31b-it:free` returned upstream errors after about **97 seconds**; the other 12 of 14 registered models passed. A zero-price catalog entry does not establish upstream availability.

Select another eligible model or retry later. A smoke timeout shorter than the observed delay may report `TIMEOUT` instead of the upstream error; `-TimeoutSec 120` allows more time to observe it, but does not fix it. Do not treat this result alone as an invalid-credential error.

## Cloudflare shows no models

Confirm both values are set:

```powershell
$env:CLOUDFLARE_API_TOKEN
$env:CLOUDFLARE_ACCOUNT_ID
```

Or set `providers.cloudflare.accountId` in `.opencode/free-models.json`.

The token must be account-scoped with **Workers AI → Read**. A token with only Zone permissions will not work for Workers AI inference.

Find the account ID at:

- Account home → `Ctrl/Cmd + K` → `Copy account ID`
- Workers & Pages → Account Details → Account ID
- Dashboard URL: `https://dash.cloudflare.com/<ACCOUNT_ID>`

## Cloudflare tool-call failure: `Bad input: content array`

Cloudflare is **text-only in practice, not agent-compatible**. Plain-text requests worked with `@cf/mistralai/mistral-small-3.1-24b-instruct` and `@cf/zai-org/glm-4.7-flash` on 2026-11-06, but tool calls still fail with:

```text
Type mismatch of '/messages/0/content', 'array' not in 'string'
```

This is a message-format incompatibility, not an account-ID or token-policy problem. The plugin uses `@opencode/ai/providers/cloudflare-workers-ai` and marks Cloudflare models `tools: false`, but current OpenCode agents expose tools regardless of `capabilities.tools = false`. The flag is not a workaround; use another provider for agent workflows.

Other observed Cloudflare failures are model-specific: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` tends to call tools and then fails, `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` responds off-prompt, `@cf/qwen/qwen2.5-coder-32b-instruct` returns a stream error, and `@cf/moonshotai/kimi-k2.6` requires a paid Workers plan.

## SambaNova says a payment method is required

SambaNova's stored connection was gone in the 2026-11-06 check, so it was not registered or live-tested. Previously, inference could return:

```text
A payment method is required. Add one at https://cloud.sambanova.ai/plans/billing to continue.
```

This is an account-level requirement. Add a payment method in the SambaNova console or use an account that already has one. The plugin cannot bypass it.

## Model list includes media models

The OpenRouter adapter excludes models whose output is not text-only. If a new media model appears, open an issue with the model ID.
