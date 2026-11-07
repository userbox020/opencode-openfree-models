# Architecture

`opencode-openfree-models` is a local OpenCode v2 plugin. It uses runtime transforms rather than modifying OpenCode configuration files.

## Registration flow

```text
setup(ctx)
  ├─ load config
  ├─ resolve credentials from OpenCode connections / env
  ├─ load inventory from cache or provider catalogs
  ├─ apply free/privacy policy
  ├─ register OpenCode integrations
  ├─ register providers with ctx.provider.transform
  ├─ enforce model allowlists with ctx.model.transform
  └─ register /free-models commands
```

## Modules

| Module | Responsibility |
|---|---|
| `src/index.js` | Plugin entry, setup, provider/model registration |
| `src/config.js` | Defaults, project config, plugin options, merge rules |
| `src/credentials.js` | Resolve env vars or active OpenCode integration connections |
| `src/discovery.js` | Run enabled provider adapters with bounded concurrency |
| `src/policy.js` | Filter by free class and privacy policy |
| `src/cache.js` | Versioned inventory snapshots in `ctx.storage` |
| `src/opencode.js` | Map normalized models to `Provider.Info` / `Model.Info` |
| `src/commands.js` | `/free-models` command surface |
| `src/format.js` | Human-readable list/doctor/privacy output |
| `src/providers/registry.js` | Provider metadata and support matrix |
| `src/adapters/openai-compatible.js` | Shared factory for OpenAI-compatible catalogs |
| `src/adapters/*` | Provider-specific discovery and normalization |

## Data model

Adapters return:

```js
{
  providerId,
  name,
  baseURL,
  integration,
  allModels,
  diagnostics
}
```

Each model has:

```js
{
  id,
  name,
  context,
  output,
  tools,
  input,
  outputModalities,
  freeClass,
  privacy: { trainsOnPrompts, source },
  evidence
}
```

## Free classes

| Class | Meaning |
|---|---|
| `zero-price` | Explicit zero price for relevant inference meters |
| `free-tier` | Account entitlement covers limited usage |
| `local` | Local execution (not used by this repo) |
| `trial-credit` | Promotional credits, excluded by default |
| `unknown` | Insufficient evidence, excluded |

## OpenCode transforms

The plugin uses:

- `ctx.provider.transform` to add provider definitions and models.
- `ctx.model.transform` to remove any model outside the plugin's allowlist.
- `ctx.integration.transform` only for plugin-owned integration methods.
- `ctx.command.transform` to add `/free-models`.
- `ctx.storage` for inventory cache.

Transforms are synchronous and replayable. Network discovery happens before registration.

## Cache

Inventory is stored under a versioned key in `ctx.storage`. Bump the key whenever provider semantics or model normalization changes.

A credential change can also invalidate the cache. The current implementation relies on a cache-key bump; a future version should include a credential fingerprint.

## No gateway

The MVP does not run a local OpenAI/Anthropic gateway. Provider registration is enough for OpenCode to call the providers directly.

## No fallback

Cross-provider fallback is intentionally absent. A fallback can send conversation content to another organization and change privacy terms. It requires a separate design and explicit user consent.
