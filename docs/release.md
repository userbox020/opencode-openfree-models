# Release Checklist

## Before release

- [ ] `npm test` passes.
- [ ] `npm run check` passes.
- [ ] `npm run pack:check` passes.
- [ ] No secrets or credentials in the diff.
- [ ] Provider docs match the adapters.
- [ ] Privacy labels match the current evidence.
- [ ] Cache key bumped if model normalization changed.
- [ ] CHANGELOG updated.
- [ ] Version bumped in `package.json`.

## Manual live checks

Run only with explicit credentials and minimal prompts:

```powershell
opencode run --standalone -m free-kilo/kilo-auto/free "Reply with exactly OK and nothing else."
opencode run --standalone -m free-openrouter/cohere/north-mini-code:free "Reply with exactly OK and nothing else."
opencode run --standalone -m free-ollama-cloud/gpt-oss:20b "Reply with exactly OK and nothing else."
```

Experimental providers require their own credentials and are fixture-tested only in CI. Run live checks only after a provider has been explicitly approved for the account and region.

Do not run live checks in pull-request CI.

## Distribution

`opencode plugin add` installs globally. GitHub is the primary path; npm is pending.

```powershell
opencode plugin add github:userbox020/opencode-openfree-models
```

Use global plugin options in `opencode.jsonc` for the broad provider set; see the README. Do not add a project-local copy alongside the global plugin.

Local checkout is for development only:

```powershell
opencode plugin add ./opencode-openfree-models
```

npm publishing requires a granular access token with bypass 2FA enabled. Do not commit `.npmrc` or paste tokens into tracked files.

## GitHub release

Include:

- provider additions/removals,
- privacy label changes,
- config schema changes,
- cache key changes,
- migration notes.

## Rollback

- Revert the tag/commit and re-sync the local plugin.
- Publish a patch release with the previous behavior.
- Do not rewrite git history for a released tag.
