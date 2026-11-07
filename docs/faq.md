# FAQ

## Does this provide unlimited free models?

No. Each provider has its own quotas, rate limits, regional restrictions, and availability windows. The plugin only discovers and registers models that currently qualify under its policy.

## Does it use local models?

No. Local Ollama, LM Studio, and other local providers are intentionally excluded. Ollama Cloud is a remote provider.

## Why are some models missing?

Check the policy. Strict mode hides:

- providers that may train on prompts,
- providers with unknown privacy.

Run `/free-models doctor` for the current policy and diagnostics.

## Does it store API keys?

No. It resolves credentials from OpenCode integration connections or environment variables. Project config contains only environment-variable names.

## Does it impersonate the OpenCode client?

No. It uses documented provider connections and anonymous access only where the provider documents it.

## Does it fall back to paid models?

No. There is no paid fallback and no cross-provider fallback in the MVP.

## Does it run a local gateway?

No. OpenCode calls the registered providers directly.

## Does it work with OpenCode v1?

No. It targets OpenCode v2 provider/model transforms.

## Can I add another provider?

Yes. Add an adapter, registry metadata, fixtures, tests, and docs. See [CONTRIBUTING.md](../CONTRIBUTING.md).

## Why does the model list look stale?

The inventory is cached. Run `/free-models refresh` or restart the service after code changes.

## Is “free-tier” the same as “zero-price”?

No. `zero-price` means the relevant inference meters are explicitly zero. `free-tier` means an account entitlement covers limited usage and may change.
