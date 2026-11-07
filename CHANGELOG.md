# Changelog

## 0.2.0

- Add experimental adapters: Gemini, Groq, Mistral, Cohere, Cloudflare, SambaNova, Z.ai, NVIDIA NIM, Alibaba Model Studio, Nebius, BazaarLink, BytePlus, and Kimchi.
- Add shared OpenAI-compatible adapter factory and normalization.
- Add per-provider fixtures and offline tests for every adapter.
- Add `trial-credit` classification and policy gating for NVIDIA, Alibaba, Nebius, and BytePlus.
- Add Cloudflare account-ID handling. Cloudflare model discovery works; inference is discovery-only until a native protocol adapter is added because its OpenAI-compatible endpoint rejects array-form message content.
- Add Gemini query-key catalog support; allowlist uses 3.x models because some 2.5 models are unavailable to new users.
- Register Groq free-tier models tool-less because the 8K TPM limit cannot fit OpenCode tool schemas.
- Add root `index.js` entrypoint for package-directory auto-discovery.
- Keep stable Kilo, OpenRouter, and Ollama Cloud adapters.

## 0.1.0

- Discover and register Kilo free models.
- Discover and register OpenRouter zero-price models.
- Discover and register Ollama Cloud free-tier models.
- Filter models by free-tier, training, privacy, and trial-credit policy.
- Add `/free-models` listing, refresh, doctor, and privacy commands.
