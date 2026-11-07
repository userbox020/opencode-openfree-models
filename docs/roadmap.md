# Roadmap

## 0.1.0

- Kilo adapter
- OpenRouter adapter
- Ollama Cloud adapter
- Free/privacy policy filtering
- Versioned inventory cache
- `/free-models` list/refresh/doctor/privacy
- Offline fixture tests

## 0.2.0

- Gemini adapter
- Groq adapter
- Mistral adapter
- Cohere adapter
- Cloudflare Workers AI adapter
- SambaNova adapter
- Z.ai adapter
- NVIDIA NIM adapter
- Alibaba Model Studio adapter
- Nebius adapter
- BazaarLink adapter
- BytePlus adapter
- Kimchi adapter
- Shared OpenAI-compatible adapter factory
- Per-provider fixtures and tests

## 0.3.0

- Extend live verification to remaining providers/accounts; the 2026-11-06 check covered 7 providers, with documented quota, plan, and protocol limitations
- Per-provider cooldown state
- `doctor` rate-limit diagnostics
- Credential-aware cache invalidation
- Improved retry ownership tests

## 0.4.0

- `free-models export slim`
- Suggested `free-reviewed` preset for low-risk agents
- Provider quality benchmarks
- Manual live-check workflow improvements

## 1.0.0

- Stable config schema
- Stable adapter contract
- Stable provider IDs
- Documented migration policy
- Optional loopback gateway design review

## Explicit non-goals

- Local model providers
- Client impersonation
- Account rotation
- Quota evasion
- Paid fallback
- Public gateway
- “Unlimited” claims
- Automatic updates
