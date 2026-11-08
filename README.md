# OPENFREE Models for OpenCode

One OpenCode v2 plugin. Free model providers with clear `OPENFREE` labels. No local models.

`opencode-openfree-models` discovers free-tier and zero-price model candidates through 16 provider adapters, applies an explicit free/privacy policy, and registers each provider as a separate namespace. Catalog inclusion does not guarantee account entitlement:

```text
OPENFREE Kilo Free
OPENFREE OpenRouter Free
OPENFREE Ollama Cloud
OPENFREE Gemini
OPENFREE Groq
OPENFREE Mistral
OPENFREE Cohere
OPENFREE Cloudflare
OPENFREE SambaNova
OPENFREE Z.ai
OPENFREE NVIDIA NIM
OPENFREE Alibaba Model Studio
OPENFREE Nebius
OPENFREE BazaarLink
OPENFREE BytePlus
OPENFREE Kimchi
```

The plugin does not impersonate clients, rotate accounts, bypass quotas, run a local gateway, or fall back to paid models.

**Status:** `0.2.0` · **97/97 offline tests passing** · **69 registered models across 7 providers** in the 2026-11-06 live check · Cloudflare tool calls verified on llama-3.3 and glm-4.7-flash.

## Live verification

Snapshot from **2026-11-06**, running OpenCode natively on Windows (no Docker/WSL). Results depend on the account, quota, and upstream availability; an OK smoke result is not a guarantee of tool support.

| Provider | Result |
|---|---|
| Kilo | **12/12 OK** |
| Groq | **3/3 OK** |
| Z.ai | **2/2 OK**: `glm-4.5-flash`, `glm-4.7-flash` |
| OpenRouter | **12/14 OK**; `google/gemma-4-26b-a4b-it:free` and `google/gemma-4-31b-it:free` return upstream errors after about 97 seconds |
| Gemini | **4/7 OK**: `gemini-3-flash-preview`, `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`, `gemini-3.6-flash`; `gemini-3.1-pro-preview` hits the daily free-tier quota, `gemini-3.8-flash` is rate-limited/times out, and `gemma-4-31b-it` ends without `finish_reason` |
| Cloudflare | **2/6 text OK**: `@cf/mistralai/mistral-small-3.1-24b-instruct`, `@cf/zai-org/glm-4.7-flash`; tool round-trip verified on `@cf/meta/llama-3.3-70b-instruct-fp8-fast` and `@cf/zai-org/glm-4.7-flash`. Other models fail, respond off-prompt, or require a paid plan |
| Ollama Cloud | **7/25 OK** on the current free plan; the other 18 return “not included in your free usage.” Use the optional allowlist below |

Mistral, Cohere, NVIDIA, Alibaba, Nebius, BazaarLink, BytePlus, and Kimchi had no credentials and no registered models in this check. SambaNova's stored connection is gone. These providers were not live-verified in this run; plugin-only auth entries can still appear before a key is configured.

## Providers

| Provider ID | Display name | Source | Auth | Free class | Privacy | Verification (2026-11-06) |
|---|---|---|---|---|---|---|
| `free-kilo` | `OPENFREE Kilo Free` | Kilo public gateway | none | free-tier | may train | 12/12 OK |
| `free-openrouter` | `OPENFREE OpenRouter Free` | OpenRouter zero-price models | OpenCode `openrouter` connection or `OPENROUTER_API_KEY` | zero-price | unknown | 12/14 OK; two Gemma upstream failures |
| `free-ollama-cloud` | `OPENFREE Ollama Cloud` | Ollama Cloud catalog | OpenCode `ollama-cloud` connection or `OLLAMA_API_KEY` | free-tier candidates | unknown | 7/25 OK; 18 plan-restricted |

OpenCode Zen free models are intentionally not duplicated. Use the native `opencode/<model-id>` provider directly.

No local Ollama, LM Studio, or other local provider is registered.

### Experimental adapters

These adapters are available in `0.2.0`. Live verification depends on the provider, account, and region:

| Provider ID | Display name | Free class | Auth | Verification |
|---|---|---|---|---|
| `free-gemini` | `OPENFREE Gemini` | free-tier | `GEMINI_API_KEY` or `google` connection | 4/7 OK; quota, rate-limit, and stream failures |
| `free-groq` | `OPENFREE Groq` | free-tier | `GROQ_API_KEY` or `groq` connection | 3/3 OK; registered tool-less due to TPM |
| `free-mistral` | `OPENFREE Mistral` | free-tier | `MISTRAL_API_KEY` or `mistral` connection | Fixture-tested; no credential/live check |
| `free-cohere` | `OPENFREE Cohere` | free-tier | `COHERE_API_KEY` or `cohere` connection | Fixture-tested; no credential/live check |
| `free-cloudflare` | `OPENFREE Cloudflare` | free-tier | `CLOUDFLARE_API_TOKEN` + account ID | 2/6 text OK; tool round-trip verified on llama-3.3 and glm-4.7-flash |
| `free-sambanova` | `OPENFREE SambaNova` | free-tier | `SAMBANOVA_API_KEY` or `sambanova` connection | Stored connection gone; not registered/live-verified in this run |
| `free-zai` | `OPENFREE Z.ai` | free-tier | `ZHIPU_API_KEY` or `zai` connection | Live-verified `glm-4.5-flash` and `glm-4.7-flash`; `glm-4.6v-flash` excluded due tool-loop instability |
| `free-nvidia` | `OPENFREE NVIDIA NIM` | trial-credit | `NVIDIA_API_KEY` or `nvidia` connection | Fixture-tested; no credential/live check |
| `free-alibaba` | `OPENFREE Alibaba Model Studio` | trial-credit | `DASHSCOPE_API_KEY` or `alibaba` connection | Fixture-tested; no credential/live check |
| `free-nebius` | `OPENFREE Nebius` | trial-credit | `NEBIUS_API_KEY` or `nebius` connection | Fixture-tested; no credential/live check |
| `free-bazaarlink` | `OPENFREE BazaarLink` | free-tier | `BAZAARLINK_API_KEY` or plugin connection | Fixture-tested; no credential/live check |
| `free-byteplus` | `OPENFREE BytePlus` | trial-credit | `BYTEPLUS_API_KEY` or plugin connection | Fixture-tested; no credential/live check |
| `free-kimchi` | `OPENFREE Kimchi` | free-tier | `KIMCHI_API_KEY` or plugin connection | Fixture-tested; no credential/live check |

Trial-credit providers require `allowTrialCredits: true`. Experimental adapters are enabled by default but skip immediately when no credential is present. Disable providers you do not use to reduce startup work.

Groq free-tier models are registered tool-less because of the 8K TPM limit. Prefer a small prompt with `general`/`explorer` or a clean project; the full `build` prompt may exceed the limit. Current OpenCode agents can expose tools regardless of `capabilities.tools = false`, so this flag alone does not guarantee a tool-free request.

## Install

GitHub (recommended; verified 2026-11-07):

```powershell
opencode plugin add github:userbox020/opencode-openfree-models
```

This installs from the public `main` branch. It was verified end-to-end in an isolated OpenCode config and registered 12 anonymous `free-kilo` models without credentials.

npm (not yet published):

```powershell
opencode plugin add opencode-openfree-models@0.2.0
```

From this checkout:

```powershell
opencode plugin add ./opencode-openfree-models
```

Or add an explicit entry:

```jsonc
{
  "plugins": [
    {
      "package": "github:userbox020/opencode-openfree-models",
      "options": {}
    }
  ]
}
```

Restart OpenCode or the service and start a new session.

## Authentication

### Kilo

No account or API key required for the public free pool.

### BazaarLink, BytePlus, and Kimchi

These providers have no built-in OpenCode integration. The plugin registers their auth integrations (`free-bazaarlink`, `free-byteplus`, `free-kimchi`) during startup, so they appear in the providers list even before a key exists.

After installing the plugin and restarting OpenCode:

1. Open the providers list.
2. Select **OPENFREE BazaarLink**, **OPENFREE BytePlus**, or **OPENFREE Kimchi**.
3. Choose **Manually enter API Key** and paste the key.

Alternatively, set the environment variable and restart:

```powershell
$env:BAZAARLINK_API_KEY = "..."
```

The plugin checks the environment variable first, then the stored connection. A key entered through the UI persists across restarts.

### OpenRouter

Use an existing OpenCode connection:

```powershell
opencode auth login
```

Select **OpenRouter**.

Or set:

```powershell
$env:OPENROUTER_API_KEY = "..."
```

The plugin reuses the existing `openrouter` integration connection when present.

### Ollama Cloud

Use an existing OpenCode connection:

```powershell
opencode auth login
```

Select **Ollama Cloud**.

Or set:

```powershell
$env:OLLAMA_API_KEY = "..."
```

The plugin reuses the existing `ollama-cloud` integration connection when present.

### Cloudflare Workers AI

Cloudflare needs two values: an **Account ID** and an **API token**.

#### Find your Account ID

Use either dashboard method:

1. Open [dash.cloudflare.com](https://dash.cloudflare.com/?to=/:account/home), press `Ctrl/Cmd + K`, type `Copy account ID`, and select the result.
2. Or open **Workers & Pages**, find **Account Details**, and copy **Account ID**.

The account ID is the hex string in the dashboard URL:

```text
https://dash.cloudflare.com/<ACCOUNT_ID>
```

#### Create the API token

1. Open [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Select **Create Token**.
3. Use **Create Workers AI API Token** if available, or create a custom token.
4. Add an **Account** policy:
   - Permission: **Workers AI → Read**
   - Account resources: **Include → your account**
5. Optionally set an expiration and IP restriction.
6. Create the token and copy it once.

No Zone permission is required for model discovery. Cloudflare tool calls are supported through a provider-scoped `ctx.session.hook("http.request")` that flattens array/null message content to strings while preserving `tool_calls`, tool-result IDs, roles, and user images.

Verified on 2026-11-08:

- `@cf/meta/llama-3.3-70b-instruct-fp8-fast` — tool round-trip OK.
- `@cf/zai-org/glm-4.7-flash` — tool round-trip OK.
- `@cf/mistralai/mistral-small-3.1-24b-instruct` — plain text OK.
- `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` — responds off-prompt.
- `@cf/qwen/qwen2.5-coder-32b-instruct` — stream error.
- `@cf/moonshotai/kimi-k2.6` — requires a paid Workers plan.

The hook fixes the wire-format mismatch, not model quality or plan entitlement. Model capability still varies.

#### Configure the plugin

```powershell
$env:CLOUDFLARE_API_TOKEN = "..."
$env:CLOUDFLARE_ACCOUNT_ID = "..."
```

Or keep the account ID in project config and the token in the environment:

```json
{
  "providers": {
    "cloudflare": {
      "enabled": true,
      "accountId": "YOUR_ACCOUNT_ID"
    }
  }
}
```

Never commit the API token.

## Where to get API keys

### Supported providers

| Provider | Key / account link | Notes |
|---|---|---|
| Kilo | [app.kilo.ai](https://app.kilo.ai) | No key is required for the public free pool. An account is optional. |
| OpenRouter | [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) | Use the `openrouter` OpenCode connection or `OPENROUTER_API_KEY`. |
| Ollama Cloud | [ollama.com/settings/keys](https://ollama.com/settings/keys) | Use the `ollama-cloud` OpenCode connection or `OLLAMA_API_KEY`. |
| OpenCode Console | [opencode.ai/auth](https://opencode.ai/auth) | Native `opencode/<id>` free models. This plugin does not register them. |

### Experimental provider key links

These providers are supported by `0.2.0`. Live verification depends on credentials and region.

| Provider | Key link | Notes |
|---|---|---|
| Google AI Studio / Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Free-tier quotas are model/project-specific. |
| Groq | [console.groq.com/keys](https://console.groq.com/keys) | Free plan has RPM/RPD/TPM limits; tool-less by default. |
| Cloudflare Workers AI | [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) | Also needs the account ID. Token policy: Account → Workers AI → Read. |
| SambaNova | [cloud.sambanova.ai/apis](https://cloud.sambanova.ai/apis) | Free tier limits apply. |
| Z.ai | [z.ai/manage-apikey/apikey-list](https://z.ai/manage-apikey/apikey-list) | Only specific flash models are free. |
| NVIDIA NIM | [build.nvidia.com/settings/api-keys](https://build.nvidia.com/settings/api-keys) | Trial/evaluation terms apply. |
| Mistral | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) | Free mode may train on requests. |
| Cohere | [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys) | Trial/evaluation limits apply. |
| Alibaba Model Studio | [alibabacloud.com Model Studio key guide](https://www.alibabacloud.com/help/en/model-studio/get-api-key) | New-user quotas are region-specific. |
| Nebius Token Factory | [studio.nebius.com/settings/api-keys](https://studio.nebius.com/settings/api-keys) | Credits expire; review data-use terms. |
| BazaarLink | [bazaarlink.ai](https://bazaarlink.ai) | `auto:free` is the free route. |
| BytePlus Ark | [console.byteplus.com/ark](https://console.byteplus.com/ark) | Free credits are account/region-specific. |
| Kimchi | [app.kimchi.dev](https://app.kimchi.dev) | Free-tier terms apply. |

## Configuration

Project config lives at `.opencode/free-models.json`.

Strict mode:

```json
{
  "providers": {
    "kilo": { "enabled": true },
    "openrouter": { "enabled": true, "env": "OPENROUTER_API_KEY" },
    "ollamaCloud": { "enabled": true, "env": "OLLAMA_API_KEY" }
  },
  "policy": {
    "allowFreeTier": true,
    "allowTraining": false,
    "allowUnknownPrivacy": false,
    "allowTrialCredits": false
  },
  "catalog": {
    "timeoutMs": 8000,
    "ttlSeconds": 21600
  }
}
```

Broad mode enables training-enabled and unknown-privacy providers:

```json
{
  "policy": {
    "allowFreeTier": true,
    "allowTraining": true,
    "allowUnknownPrivacy": true,
    "allowTrialCredits": false
  }
}
```

Strict mode may hide every model from a provider. That is intentional.

### Optional Ollama Cloud allowlist

The catalog does not expose plan entitlement, so the plugin lists models that may not be included in your free usage. These seven exact IDs worked on the tested free plan on 2026-11-06:

```json
{
  "providers": {
    "ollamaCloud": {
      "allowlist": [
        "beam",
        "gemma4:31b",
        "gpt-oss:120b",
        "gpt-oss:20b",
        "nemotron-3-nano:30b",
        "nemotron-3-super",
        "nemotron-3-ultra"
      ]
    }
  }
}
```

`providers.ollamaCloud.allowlist` and `denylist` accept exact model IDs. An absent or empty list applies no filtering for that list; denylist wins when an ID is in both. Privacy policy still applies (`allowUnknownPrivacy: true` is needed for Ollama Cloud). See [configuration](docs/configuration.md).

All other providers are enabled by default and skip immediately when no credential is present. Cloudflare additionally needs an account ID:

```json
{
  "providers": {
    "cloudflare": {
      "enabled": true,
      "accountId": "YOUR_ACCOUNT_ID"
    }
  }
}
```

## Commands

```text
/free-models            List eligible models
/free-models refresh    Fetch catalogs and reload transforms
/free-models doctor     Show cache, auth presence, policy, diagnostics
/free-models privacy    Show training/privacy labels
```

## Privacy

- Kilo free entries advertise `mayTrainOnYourPrompts: true`.
- OpenRouter free-model upstream policies are not uniform; they are labeled `unknown`.
- Ollama Cloud free-tier privacy terms are labeled `unknown`.
- Gemini free-tier data may be used for product improvement; labeled `may-train`.
- Groq free-tier inference is labeled no-training by default.
- Cloudflare supports plain-text and tool-call inference; prompts are sent to Cloudflare. Model capability and plan entitlement vary.
- Other experimental providers carry per-provider labels; run `/free-models privacy`.
- Discovery sends no prompts, repository contents, file paths, or session titles.
- No telemetry and no prompt logging.
- Do not send secrets or private repository content to training-enabled or unknown-privacy providers.

See [docs/privacy.md](docs/privacy.md) and [docs/faq.md](docs/faq.md).

## Security

- Credentials come from OpenCode connections or environment variables.
- No secrets in project config.
- No client impersonation.
- No account rotation or quota evasion.
- No paid fallback.
- No local gateway in the MVP.
- Remote catalogs are treated as untrusted data.

See [docs/security.md](docs/security.md).

## Development

```powershell
cd opencode-openfree-models
npm test
npm run check
npm run pack:check
```

The test suite uses fixtures and makes no network requests. Verified suite: **97/97 passing** (2026-11-08).

## Scripts

Run from this checkout on native Windows with PowerShell:

| Command | Purpose |
|---|---|
| `npm test` | Run offline tests |
| `npm run check` | Syntax checks and offline tests |
| `npm run pack:check` | Preview package contents |
| `npm run sync:workspace` | Copy runtime files to the configured workspace `.opencode/plugins/free-models`; replaces its `src` directory |
| `npm run smoke` | Run live model smoke tests through `opencode.cmd`; consumes provider quota |

Preview a workspace sync without writing: `npm run sync:workspace -- -DryRun`. See [configuration](docs/configuration.md#scripts) for destination overrides.

```powershell
npm run smoke -- -All -OutFile smoke.jsonl -SummaryFile smoke-summary.json -TimeoutSec 120
# Or use a file containing one provider/model ID per line:
npm run smoke -- -ModelsFile models.txt -OutFile smoke.jsonl -SummaryFile smoke-summary.json
```

Choose `-All` or `-ModelsFile`; `-OutFile` and `-SummaryFile` are required and overwrite their outputs. `-TimeoutSec` defaults to 60 seconds per model. Smoke results test a short `general` agent prompt, not complete agent compatibility.

## Repository layout

```text
index.js                Package-directory entrypoint
src/
  index.js              Plugin entry and registration
  config.js             Config loading and merging
  credentials.js        OpenCode/env credential resolution
  discovery.js          Provider discovery orchestration
  policy.js             Free/privacy filtering
  cache.js              Versioned inventory cache
  opencode.js           Provider/model projection
  commands.js           /free-models commands
  format.js             Human-readable output
  providers/registry.js Provider metadata
  adapters/             Kilo, OpenRouter, Ollama Cloud, and experimental providers
  adapters/openai-compatible.js  Shared OpenAI-compatible adapter factory
test/                   Offline tests
fixtures/               Catalog snapshots
docs/                   Architecture, config, providers, privacy, security
```

## Release

```powershell
npm test
npm run check
npm run pack:check
```

Tag the release and attach the tarball to a GitHub release. npm publication is optional and not required for local use.

## License

MIT

