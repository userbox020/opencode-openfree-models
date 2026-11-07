# Providers

## Support matrix

| Provider ID | Display name | Base URL | Catalog | Auth | Free class | Privacy | Status |
|---|---|---|---|---|---|---|---|
| `free-kilo` | `OPENFREE Kilo Free` | `https://ai-gateway.kilo.ai/api/v1` | `/models` | none | free-tier | may train | stable |
| `free-openrouter` | `OPENFREE OpenRouter Free` | `https://openrouter.ai/api/v1` | `/models` | host connection or `OPENROUTER_API_KEY` | zero-price | unknown | stable |
| `free-ollama-cloud` | `OPENFREE Ollama Cloud` | `https://ollama.com/v1` | `/models` + `/api/tags` | host connection or `OLLAMA_API_KEY` | free-tier | unknown | stable |

No local provider is included.

## Key links

### Supported

| Provider | Key / account link |
|---|---|
| Kilo | [app.kilo.ai](https://app.kilo.ai) — optional; anonymous free pool |
| OpenRouter | [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) |
| Ollama Cloud | [ollama.com/settings/keys](https://ollama.com/settings/keys) |
| OpenCode Console | [opencode.ai/auth](https://opencode.ai/auth) — native free models |

### Roadmap

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

## `free-ollama-cloud`

- Source: Ollama Cloud catalog.
- Free detection: models with `supported_in_api !== false`, `visibility !== "hide"`, and a completion capability.
- Auth: OpenCode `ollama-cloud` connection or `OLLAMA_API_KEY`.
- Privacy: labeled `unknown`.
- Metadata: context from `/v1/models`; tool capability from `/api/tags` where available.
- Typical models: `gpt-oss:20b`, `gpt-oss:120b`, DeepSeek V4.1 Flash, GLM 5.x, Kimi K3, MiniMax M3, Mistral Large 4, Nemotron 3 variants.
- Decision-only models such as `clef:27b` are excluded.

## Experimental adapters

These adapters are fixture-tested but not live-verified for every account or region. They are disabled from selection by policy when their free class is `trial-credit` or their privacy is `unknown`.

| Provider ID | Display name | Free class | Auth | Notes |
|---|---|---|---|---|
| `free-gemini` | `OPENFREE Gemini` | free-tier | `GEMINI_API_KEY` / `google` connection | Free quotas are project/model-specific; the allowlist uses 3.x models because some 2.5 models are unavailable to new users |
| `free-groq` | `OPENFREE Groq` | free-tier | `GROQ_API_KEY` / `groq` connection | Free plan TPM is below OpenCode tool-schema overhead; registered tool-less. Use `general`/`explorer` or a clean project. |
| `free-mistral` | `OPENFREE Mistral` | free-tier | `MISTRAL_API_KEY` / `mistral` connection | Free mode may train |
| `free-cohere` | `OPENFREE Cohere` | free-tier | `COHERE_API_KEY` / `cohere` connection | Trial/evaluation limits |
| `free-cloudflare` | `OPENFREE Cloudflare` | free-tier | `CLOUDFLARE_API_TOKEN` + account ID | Discovery works; inference currently blocked by OpenCode content-array incompatibility; native protocol adapter required |
| `free-sambanova` | `OPENFREE SambaNova` | free-tier | `SAMBANOVA_API_KEY` / `sambanova` connection | Free-tier rate limits |
| `free-zai` | `OPENFREE Z.ai` | free-tier | `ZHIPU_API_KEY` / `zai` connection | Only selected flash models |
| `free-nvidia` | `OPENFREE NVIDIA NIM` | trial-credit | `NVIDIA_API_KEY` / `nvidia` connection | Requires `allowTrialCredits` |
| `free-alibaba` | `OPENFREE Alibaba Model Studio` | trial-credit | `DASHSCOPE_API_KEY` / `alibaba` connection | New-user quota |
| `free-nebius` | `OPENFREE Nebius` | trial-credit | `NEBIUS_API_KEY` / `nebius` connection | Credits + data-use terms |
| `free-bazaarlink` | `OPENFREE BazaarLink` | free-tier | `BAZAARLINK_API_KEY` | `auto:free` route |
| `free-byteplus` | `OPENFREE BytePlus` | trial-credit | `BYTEPLUS_API_KEY` | Account/region credits |
| `free-kimchi` | `OPENFREE Kimchi` | free-tier | `KIMCHI_API_KEY` | Free-tier terms apply |

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
