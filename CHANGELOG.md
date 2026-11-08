# Changelog

## 0.2.0

- Preserve cached provider `package` and `settings`; bump the inventory cache key to `free-models:inventory:v18` so Cloudflare retains `@opencode/ai/providers/cloudflare-workers-ai` and per-model tool capability.
- Add a provider-scoped `ctx.session.hook("http.request")` for Cloudflare that flattens array/null message content to strings while preserving `tool_calls`, tool-result IDs, roles, and user images. Tool round-trips verified on llama-3.3-70b and glm-4.7-flash; Cloudflare models now derive tool capability from the catalog instead of forcing `tools: false`.
- Add exact-ID `providers.ollamaCloud.allowlist` and `denylist` filters. Empty/absent lists do not filter; denylist wins. Catalog discovery cannot determine plan entitlement.
- Add `npm run sync:workspace` to copy runtime files to `.opencode/plugins/free-models`, with a dry-run option.
- Add the native Windows PowerShell `npm run smoke` model check with `-All`, `-ModelsFile`, `-OutFile`, `-SummaryFile`, and `-TimeoutSec`.
- Record 2026-11-06 verification: 97/97 offline tests passing; 69 registered models across 7 providers. Kilo 12/12, Groq 3/3, Z.ai 2/2, OpenRouter 12/14, Gemini 4/7, Cloudflare 2/6 text plus tool round-trips on llama-3.3 and glm-4.7-flash, and Ollama Cloud 7/25 on the tested free plan. Document quota, upstream, protocol, and plan restrictions rather than treating catalog inclusion as working free access.
- Add experimental adapters: Gemini, Groq, Mistral, Cohere, Cloudflare, SambaNova, Z.ai, NVIDIA NIM, Alibaba Model Studio, Nebius, BazaarLink, BytePlus, and Kimchi.
- Add shared OpenAI-compatible adapter factory and normalization.
- Add per-provider fixtures and offline tests for every adapter.
- Add `trial-credit` classification and policy gating for NVIDIA, Alibaba, Nebius, and BytePlus.
- Add Cloudflare account-ID handling and model discovery. See the entries above for current plain-text inference support and agent/tool-call limitations.
- Add Gemini query-key catalog support; allowlist uses 3.x models because some 2.5 models are unavailable to new users.
- Register Groq free-tier models tool-less because the 8K TPM limit cannot fit OpenCode tool schemas.
- Add static Z.ai free models because the Z.ai catalog omits them; `glm-4.5-flash` and `glm-4.7-flash` are live-verified, while `glm-4.6v-flash` is excluded due tool-loop instability.
- Register plugin-only auth integrations (`free-bazaarlink`, `free-byteplus`, `free-kimchi`) during startup, before model discovery, so a key can be connected from the providers UI instead of requiring an environment variable.
- Add root `index.js` entrypoint for package-directory auto-discovery.
- Keep Kilo, OpenRouter, and Ollama Cloud adapters; see current verification for model availability and account-plan restrictions.

## 0.1.0

- Discover and register Kilo free models.
- Discover and register OpenRouter zero-price models.
- Discover and register Ollama Cloud catalog candidates; catalog inclusion does not establish free-plan entitlement.
- Filter models by free-tier, training, privacy, and trial-credit policy.
- Add `/free-models` listing, refresh, doctor, and privacy commands.
