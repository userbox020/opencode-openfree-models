# Providers

## Support matrix

Live snapshot: **2026-11-06**, native Windows OpenCode (no Docker/WSL), **69 registered models across 7 providers**. Results are account/quota-specific, not guarantees of agent compatibility.

| Provider ID | Display name | Base URL | Catalog | Auth | Free class | Privacy | Status |
|---|---|---|---|---|---|---|---|
| `free-kilo` | `OPENFREE Kilo Free` | `https://ai-gateway.kilo.ai/api/v1` | `/models` | none | free-tier | may train | 12/12 OK |
| `free-openrouter` | `OPENFREE OpenRouter Free` | `https://openrouter.ai/api/v1` | `/models` | host connection or `OPENROUTER_API_KEY` | zero-price | unknown | 12/14 OK; two Gemma upstream errors |
| `free-ollama-cloud` | `OPENFREE Ollama Cloud` | `https://ollama.com/v1` | `/models` + `/api/tags` | host connection or `OLLAMA_API_KEY` | free-tier candidates | unknown | 7/25 OK; 18 plan-restricted |

No local provider is included.

## Key links

### Supported

| Provider | Key / account link |
|---|---|
| Kilo | [app.kilo.ai](https://app.kilo.ai) — optional; anonymous free pool |
| OpenRouter | [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) |
| Ollama Cloud | [ollama.com/settings/keys](https://ollama.com/settings/keys) |
| OpenCode Console | [opencode.ai/auth](https://opencode.ai/auth) — native free models |

### Experimental adapters

| Provider | Key link |
|---|---|
| Google AI Studio / Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Groq | [console.groq.com/keys](https://console.groq.com/keys) |
| Cloudflare Workers AI | [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) |
| SambaNova | [cloud.sambanova.ai/apis](https://cloud.sambanova.ai/apis) |
| Z.ai | [z.ai/manage-apikey/apikey-list](https://z.ai/manage-apikey/apikey-list) |
| NVIDIA NIM | [build.nvidia.com/settings/api-keys](https://build.nvidia.com/settings/api-keys) |
| Mistral | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| Cohere | [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys) |
| Alibaba Model Studio | [Model Studio key guide](https://www.alibabacloud.com/help/en/model-studio/get-api-key) |
| Nebius Token Factory | [studio.nebius.com/settings/api-keys](https://studio.nebius.com/settings/api-keys) |
| BazaarLink | [bazaarlink.ai](https://bazaarlink.ai) |
| BytePlus Ark | [console.byteplus.com/ark](https://console.byteplus.com/ark) |
| Kimchi | [app.kimchi.dev](https://app.kimchi.dev) |

## `free-kilo`

- Source: Kilo public gateway.
- Free detection: live catalog `isFree === true`.
- Auth: anonymous.
- Privacy: Kilo advertises `mayTrainOnYourPrompts: true` for the free pool.
- Typical models: `kilo-auto/free`, Nemotron 3.5 variants, Beam, Crouton Alpha, Glyph Cluster, Dots3-Note, Cohere North Mini Code, OpenRouter Free router.
- Limit: Kilo documents anonymous usage limits; do not assume “unlimited.”

## `free-openrouter`

- Source: OpenRouter public model catalog.
- Free detection: `pricing.prompt === 0` and `pricing.completion === 0`, with text-only output.
- Auth: OpenCode `openrouter` connection or `OPENROUTER_API_KEY`.
- Privacy: upstream policies vary; labeled `unknown`.
- Typical models: Cohere North Mini Code, Dots3-Note, Gemma 4, Liquid LFM, Nemotron variants, OpenRouter Free router, Flint, Crouton Alpha, XingChen.
- Media-only models such as Lyria are excluded.
- Live result: **12/14 OK**. `google/gemma-4-26b-a4b-it:free` and `google/gemma-4-31b-it:free` return upstream errors after about 97 seconds. Zero catalog pricing does not guarantee upstream availability.

## `free-ollama-cloud`

- Source: Ollama Cloud catalog.
- Catalog eligibility: models with `supported_in_api !== false`, `visibility !== "hide"`, and completion support where capabilities are declared. This is not a plan-entitlement check; the catalog does not expose entitlement.
- Auth: OpenCode `ollama-cloud` connection or `OLLAMA_API_KEY`.
- Privacy: labeled `unknown`.
- Metadata: context from `/v1/models`; tool capability from `/api/tags` where available.
- Live result: **7/25 OK** on the current free plan: `beam`, `gemma4:31b`, `gpt-oss:120b`, `gpt-oss:20b`, `nemotron-3-nano:30b`, `nemotron-3-super`, `nemotron-3-ultra`. The other 18 return “not included in your free usage.”
- Optional `providers.ollamaCloud.allowlist` / `denylist` filter exact model IDs. Absent/empty lists add no restriction; denylist wins. See the [allowlist example](../README.md#optional-ollama-cloud-allowlist). The plugin otherwise keeps listing eligible catalog models, including plan-restricted ones.
- Decision-only models such as `clef:27b` are excluded.

## Experimental adapters

These adapters are fixture-tested but not live-verified for every account or region. Trial-credit and unknown-privacy models require the corresponding policy opt-ins. In the 2026-11-06 run, Mistral, Cohere, NVIDIA, Alibaba, Nebius, BazaarLink, BytePlus, and Kimchi had no credentials and no registered models. SambaNova's stored connection is gone; it was also not registered or live-tested.

| Provider ID | Display name | Free class | Auth | Notes |
|---|---|---|---|---|
| `free-gemini` | `OPENFREE Gemini` | free-tier | `GEMINI_API_KEY` / `google` connection | 4/7 OK; quota, rate-limit, and stream failures detailed below |
| `free-groq` | `OPENFREE Groq` | free-tier | `GROQ_API_KEY` / `groq` connection | 3/3 OK; registered tool-less due to TPM. Prefer small prompts with `general`/`explorer` or a clean project; the flag does not ensure agents omit tools. |
| `free-mistral` | `OPENFREE Mistral` | free-tier | `MISTRAL_API_KEY` / `mistral` connection | Free mode may train |
| `free-cohere` | `OPENFREE Cohere` | free-tier | `COHERE_API_KEY` / `cohere` connection | Trial/evaluation limits |
| `free-cloudflare` | `OPENFREE Cloudflare` | free-tier | `CLOUDFLARE_API_TOKEN` + account ID | 2/6 work for plain text; not agent-compatible; details below |
| `free-sambanova` | `OPENFREE SambaNova` | free-tier | `SAMBANOVA_API_KEY` / `sambanova` connection | Stored connection gone; not registered/live-tested in this run |
| `free-zai` | `OPENFREE Z.ai` | free-tier | `ZHIPU_API_KEY` / `zai` connection | Catalog omits free flash models; plugin adds static entries. `glm-4.5-flash` and `glm-4.7-flash` live-verified. `glm-4.6v-flash` excluded due tool-loop instability. |
| `free-nvidia` | `OPENFREE NVIDIA NIM` | trial-credit | `NVIDIA_API_KEY` / `nvidia` connection | Requires `allowTrialCredits` |
| `free-alibaba` | `OPENFREE Alibaba Model Studio` | trial-credit | `DASHSCOPE_API_KEY` / `alibaba` connection | New-user quota |
| `free-nebius` | `OPENFREE Nebius` | trial-credit | `NEBIUS_API_KEY` / `nebius` connection | Credits + data-use terms |
| `free-bazaarlink` | `OPENFREE BazaarLink` | free-tier | `BAZAARLINK_API_KEY` | `auto:free` route |
| `free-byteplus` | `OPENFREE BytePlus` | trial-credit | `BYTEPLUS_API_KEY` | Account/region credits |
| `free-kimchi` | `OPENFREE Kimchi` | free-tier | `KIMCHI_API_KEY` | Free-tier terms apply |

BazaarLink, BytePlus, and Kimchi auth integrations are registered **before discovery**, even without credentials. Select the provider in OpenCode's providers UI, then **Manually enter API Key**. This exposes an auth entry, not proof of working inference.

### `free-gemini`

Free-tier quotas are project/model-specific. The 2026-11-06 results were:

- OK: `gemini-3-flash-preview`, `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`, `gemini-3.6-flash`.
- `gemini-3.1-pro-preview`: free-tier daily quota exhausted.
- `gemini-3.8-flash`: rate-limited/timed out.
- `gemma-4-31b-it`: stream ended without `finish_reason`.

### `free-cloudflare`

Uses `@opencode/ai/providers/cloudflare-workers-ai`; cached provider `package` and `settings` are preserved. Models are marked `tools: false`, but current OpenCode agents expose tools regardless of `capabilities.tools = false`. Tool calls still fail with `Type mismatch of '/messages/0/content', 'array' not in 'string'`. **Text-only in practice; not agent-compatible.**

| Model | Live result (2026-11-06) |
|---|---|
| `@cf/mistralai/mistral-small-3.1-24b-instruct` | Plain text works |
| `@cf/zai-org/glm-4.7-flash` | Plain text works |
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Tends to call tools, then fails |
| `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | Responds off-prompt |
| `@cf/qwen/qwen2.5-coder-32b-instruct` | Stream error |
| `@cf/moonshotai/kimi-k2.6` | Requires a paid Workers plan |

## Adding a provider

1. Add metadata to `src/providers/registry.js`.
2. Add an adapter under `src/adapters/`.
3. Add fixtures under `fixtures/`.
4. Add normalization and policy tests.
5. Document auth, privacy, free detection, and limits here.
6. Verify with `npm test` and a manual live smoke test.

Adapters must not:

- invent free status from a model name,
- define arbitrary endpoints from catalog data,
- send prompts during discovery,
- impersonate an official client,
- rotate accounts or keys to evade limits.
