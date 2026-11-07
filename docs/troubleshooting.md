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

Groq’s free tier has a low TPM ceiling. The full `build` agent prompt plus tool schemas can exceed it. The plugin registers Groq models tool-less to reduce request size. Use the `general` or `explorer` agent, or a clean project. A Groq Dev Tier raises the limit.

## `429`

The provider is rate-limiting. Wait for the reset window and avoid high concurrency. The MVP does not retry across providers.

## Stale model list

The inventory is cached. Try:

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

## OpenRouter shows no models

Confirm the OpenRouter connection is active. The plugin reuses the `openrouter` integration; a `free-openrouter` env-only method is a fallback.

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

## Cloudflare inference returns `Bad input: content array`

Cloudflare Workers AI’s OpenAI-compatible endpoint rejects the array-form message content that OpenCode sends. Authentication and model discovery can succeed, but inference fails with:

```text
Type mismatch of '/messages/0/content', 'array' not in 'string'
```

This is a protocol incompatibility, not an account-ID or token-policy problem. The built-in `@opencode/ai/providers/cloudflare-workers-ai` package also uses the OpenAI-compatible protocol and fails the same way. Cloudflare is currently discovery-only in this plugin. A dedicated native Cloudflare `/ai/run/{model}` provider package is required for inference.

## SambaNova says a payment method is required

SambaNova model discovery works with a valid API key, but inference can return:

```text
A payment method is required. Add one at https://cloud.sambanova.ai/plans/billing to continue.
```

This is an account-level requirement. Add a payment method in the SambaNova console or use an account that already has one. The plugin cannot bypass it.

## Model list includes media models

The OpenRouter adapter excludes models whose output is not text-only. If a new media model appears, open an issue with the model ID.
