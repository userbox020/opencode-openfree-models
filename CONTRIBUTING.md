# Contributing

## Scope

This repository is a small, dependency-free OpenCode v2 plugin. Prefer focused changes over new frameworks.

## Provider adapter checklist

A new adapter must include:

- provider metadata in `src/providers/registry.js`,
- an adapter under `src/adapters/`,
- deterministic normalization,
- explicit free-status evidence,
- privacy metadata,
- auth resolution through OpenCode connections or env,
- fixtures under `fixtures/`,
- normalization and policy tests,
- documentation in `docs/providers.md`.

Adapters must not:

- infer free status from a model name,
- send prompts during discovery,
- define arbitrary endpoints from catalog data,
- impersonate an official client,
- rotate accounts or keys,
- add paid fallback.

## Tests

```powershell
npm test
npm run check
npm run pack:check
```

CI uses fixtures only. Live provider checks are manual and must not run on pull requests from forks.

## Code style

- ESM JavaScript.
- No runtime dependencies.
- Small modules with one responsibility.
- No secrets in logs, config, fixtures, or errors.
- Keep cache keys versioned when normalization changes.

## Pull request checklist

- [ ] Tests pass.
- [ ] No new runtime dependency without justification.
- [ ] No secrets or credentials in the diff.
- [ ] Provider docs updated.
- [ ] Privacy labels updated.
- [ ] Cache key bumped if model normalization changed.
- [ ] No client impersonation or quota-evasion behavior.

## Commit style

Use short, imperative messages:

```text
add groq adapter
fix openrouter media filter
bump inventory cache
```
