# OPENFREE Models for OpenCode

One OpenCode v2 plugin. Free model providers with clear `OPENFREE` labels. No local models.

`opencode-openfree-models` discovers free models from 16 providers, applies an explicit free/privacy policy, and registers each provider as a separate namespace:

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

**Status:** `0.2.0` · **45 offline tests** · stable Kilo/OpenRouter/Ollama Cloud · live-verified Gemini and Groq · Cloudflare discovery-only.

## Providers

| Provider ID | Display name | Source | Auth | Free class | Privacy |
|---|---|---|---|---|---|
| `free-kilo` | `OPENFREE Kilo Free` | Kilo public gateway | none | free-tier | may train |
| `free-openrouter` | `OPENFREE OpenRouter Free` | OpenRouter zero-price models | OpenCode `openrouter` connection or `OPENROUTER_API_KEY` | zero-price | unknown |
| `free-ollama-cloud` | `OPENFREE Ollama Cloud` | Ollama Cloud catalog | OpenCode `ollama-cloud` connection or `OLLAMA_API_KEY` | free-tier | unknown |

OpenCode Zen free models are intentionally not duplicated. Use the native `opencode/<model-id>` provider directly.

No local Ollama, LM Studio, or other local provider is registered.

### Experimental adapters

These adapters are available in `0.2.0`. Live verification depends on the provider, account, and region:

| Provider ID | Display name | Free class | Auth | Verification |
|---|---|---|---|---|
| `free-gemini` | `OPENFREE Gemini` | free-tier | `GEMINI_API_KEY` or `google` connection | Live-verified with Gemini 3.8/3.6 Flash |
| `free-groq` | `OPENFREE Groq` | free-tier | `GROQ_API_KEY` or `groq` connection | Live-verified; tool-less due to TPM |
| `free-mistral` | `OPENFREE Mistral` | free-tier | `MISTRAL_API_KEY` or `mistral` connection | Fixture-tested |
| `free-cohere` | `OPENFREE Cohere` | free-tier | `COHERE_API_KEY` or `cohere` connection | Fixture-tested |
| `free-cloudflare` | `OPENFREE Cloudflare` | free-tier | `CLOUDFLARE_API_TOKEN` + account ID | Discovery-only; inference blocked by protocol mismatch |
| `free-sambanova` | `OPENFREE SambaNova` | free-tier | `SAMBANOVA_API_KEY` or `sambanova` connection | Catalog verified; inference requires a SambaNova payment method |
| `free-zai` | `OPENFREE Z.ai` | free-tier | `ZHIPU_API_KEY` or `zai` connection | Live-verified `glm-4.5-flash` and `glm-4.7-flash`; `glm-4.6v-flash` excluded due tool-loop instability |
| `free-nvidia` | `OPENFREE NVIDIA NIM` | trial-credit | `NVIDIA_API_KEY` or `nvidia` connection | Fixture-tested |
| `free-alibaba` | `OPENFREE Alibaba Model Studio` | trial-credit | `DASHSCOPE_API_KEY` or `alibaba` connection | Fixture-tested |
| `free-nebius` | `OPENFREE Nebius` | trial-credit | `NEBIUS_API_KEY` or `nebius` connection | Fixture-tested |
| `free-bazaarlink` | `OPENFREE BazaarLink` | free-tier | `BAZAARLINK_API_KEY` | Fixture-tested |
| `free-byteplus` | `OPENFREE BytePlus` | trial-credit | `BYTEPLUS_API_KEY` | Fixture-tested |
| `free-kimchi` | `OPENFREE Kimchi` | free-tier | `KIMCHI_API_KEY` | Fixture-tested |

Trial-credit providers require `allowTrialCredits: true`. Experimental adapters are enabled by default but skip immediately when no credential is present. Disable providers you do not use to reduce startup work.

Groq free-tier models are registered tool-less because the 8K TPM limit cannot fit OpenCode's tool schemas. They work with the `general` or `explorer` agent, or in a clean project; the full `build` agent prompt may exceed the limit.

## Install

The package is not published to npm yet. Install from this checkout:

```powershell
opencode plugin add ./opencode-openfree-models
```

When published, the package command will be:

```powershell
opencode plugin add opencode-openfree-models@0.2.0
```

Or add an explicit entry:

```jsonc
{
  "plugins": [
    {
      "package": "./opencode-openfree-models",
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

The plugin checks the stored connection first, then the environment variable. A key entered through the UI persists across restarts.

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

No Zone permission is required for model discovery. Cloudflare inference is currently blocked by a protocol mismatch between OpenCode’s message format and Cloudflare’s OpenAI-compatible endpoint, so Cloudflare models are discovery-only in `0.2.0`.

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
- Cloudflare is discovery-only; no prompts are sent to it by this plugin yet.
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

The test suite uses fixtures and makes no network requests. Current suite: **45 tests**.

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
npm publish --access public
```

## License

MIT

