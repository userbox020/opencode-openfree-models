# Configuration

## Location

Project config:

```text
.opencode/free-models.json
```

Plugin options can override file config:

```jsonc
{
  "plugins": [
    {
      "package": "./opencode-openfree-models",
      "options": {
        "policy": {
          "allowTraining": false,
          "allowUnknownPrivacy": false
        }
      }
    }
  ]
}
```

## Schema

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

## Merge rules

1. Built-in defaults.
2. `.opencode/free-models.json`.
3. Plugin options.

Provider maps merge by provider key. Policy and catalog objects merge by field. Unknown fields are ignored.

## Policy fields

| Field | Default | Effect |
|---|---|---|
| `allowFreeTier` | `true` | Allows free-tier models |
| `allowTraining` | `false` | Allows models that may train on prompts |
| `allowUnknownPrivacy` | `false` | Allows models with unknown privacy |
| `allowTrialCredits` | `false` | Allows trial-credit models |

Strict mode:

```json
{
  "policy": {
    "allowTraining": false,
    "allowUnknownPrivacy": false
  }
}
```

Broad mode:

```json
{
  "policy": {
    "allowTraining": true,
    "allowUnknownPrivacy": true
  }
}
```

## Provider fields

### Kilo

```json
{
  "kilo": { "enabled": true }
}
```

No auth configuration.

### OpenRouter

```json
{
  "openrouter": {
    "enabled": true,
    "env": "OPENROUTER_API_KEY"
  }
}
```

Credential resolution:

1. `OPENROUTER_API_KEY`
2. Active OpenCode `openrouter` connection
3. Active `free-openrouter` connection

### Ollama Cloud

```json
{
  "ollamaCloud": {
    "enabled": true,
    "env": "OLLAMA_API_KEY",
    "baseURL": "https://ollama.com/v1",
    "catalogURL": "https://ollama.com/v1/models",
    "tagsURL": "https://ollama.com/api/tags",
    "allowlist": [],
    "denylist": []
  }
}
```

Credential resolution:

1. `OLLAMA_API_KEY`
2. Active OpenCode `ollama-cloud` connection
3. Active `free-ollama-cloud` connection

#### Model filters

Set these under `providers.ollamaCloud`:

| Field | Default | Effect |
|---|---|---|
| `allowlist` | absent / `[]` | If nonempty, include only these exact model IDs |
| `denylist` | absent / `[]` | Exclude these exact model IDs, even if allowlisted |

There is no wildcard or provider-prefix matching. Empty/absent lists impose no filtering for that list, and **denylist wins**. Normal catalog eligibility and privacy policy filtering still apply.

The Ollama catalog does not expose plan entitlement. Without an allowlist, the plugin can list models that return “not included in your free usage.” Only 7/25 worked on the tested free plan on 2026-11-06. An optional configuration for those seven IDs is:

```json
{
  "providers": {
    "ollamaCloud": {
      "allowlist": [
        "beam",
        "gemma4:31b",
        "gpt-oss:120b",
        "gpt-oss:20b",
        "nemotron-3-nano:30b",
        "nemotron-3-super",
        "nemotron-3-ultra"
      ],
      "denylist": []
    }
  },
  "policy": {
    "allowUnknownPrivacy": true
  }
}
```

These are observed account-specific results, not a guarantee of future free access. Run `/free-models refresh` after changing filters.

## Additional provider config

The experimental adapters use the same `providers` map:

| Config key | Provider | Environment variable | Notes |
|---|---|---|---|
| `gemini` | `free-gemini` | `GEMINI_API_KEY` | Gemini free-tier quotas are project/model-specific |
| `groq` | `free-groq` | `GROQ_API_KEY` | Free plan has RPM/RPD/TPM limits |
| `mistral` | `free-mistral` | `MISTRAL_API_KEY` | Free mode may train on requests |
| `cohere` | `free-cohere` | `COHERE_API_KEY` | Trial/evaluation limits |
| `cloudflare` | `free-cloudflare` | `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` | Account ID is required |
| `sambanova` | `free-sambanova` | `SAMBANOVA_API_KEY` | Free-tier rate limits |
| `zai` | `free-zai` | `ZHIPU_API_KEY` | Only selected flash models are free |
| `nvidia` | `free-nvidia` | `NVIDIA_API_KEY` | `trial-credit`; requires `allowTrialCredits` |
| `alibaba` | `free-alibaba` | `DASHSCOPE_API_KEY` | `trial-credit`; new-user quota |
| `nebius` | `free-nebius` | `NEBIUS_API_KEY` | `trial-credit`; review data-use terms |
| `bazaarlink` | `free-bazaarlink` | `BAZAARLINK_API_KEY` | `auto:free` route |
| `byteplus` | `free-byteplus` | `BYTEPLUS_API_KEY` | `trial-credit`; account/region-specific credits |
| `kimchi` | `free-kimchi` | `KIMCHI_API_KEY` | Free-tier terms apply |

`free-bazaarlink`, `free-byteplus`, and `free-kimchi` are plugin-only auth integrations. They are registered at startup before discovery even when no credential exists, so they can be connected with **Manually enter API Key** in the providers UI. The environment variable takes priority over a stored connection; UI connections persist across restarts.

### Cloudflare Workers AI

```json
{
  "cloudflare": {
    "enabled": true,
    "env": "CLOUDFLARE_API_TOKEN",
    "accountId": "YOUR_ACCOUNT_ID"
  }
}
```

Cloudflare requires:

- `CLOUDFLARE_API_TOKEN` — account-scoped token with **Workers AI → Read**
- `CLOUDFLARE_ACCOUNT_ID` or `providers.cloudflare.accountId`

Find the account ID in the dashboard:

- Account home → `Ctrl/Cmd + K` → `Copy account ID`
- Workers & Pages → Account Details → Account ID
- Dashboard URL: `https://dash.cloudflare.com/<ACCOUNT_ID>`

Create the token at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens). Use an **Account** policy with **Workers AI → Read** scoped to your account. No Zone permission is needed.

Cloudflare tool calls use a provider-scoped HTTP request hook that flattens array/null message content to strings while preserving tool calls, tool-result IDs, and user images. Cache `v18` carries per-model tool capability. Model quality and Workers-plan entitlement still vary. See [provider results](providers.md#free-cloudflare).

Trial-credit providers are excluded unless:

```json
{
  "policy": {
    "allowTrialCredits": true
  }
}
```

## Catalog fields

| Field | Default | Effect |
|---|---|---|
| `timeoutMs` | `8000` | Per-request timeout |
| `ttlSeconds` | `21600` | Inventory cache lifetime |

The inventory cache key is `free-models:inventory:v18`. Cached provider records preserve `package` and `settings`, so Cloudflare retains `@opencode/ai/providers/cloudflare-workers-ai` after a cache hit.

## Scripts

Run from the repository checkout on **native Windows with PowerShell**, without Docker or WSL.

### Workspace sync

`npm run sync:workspace` copies `index.js`, `package.json`, `README.md`, and `src` to `.opencode/plugins/free-models`. Its default destination is `C:\_Work\__OPENFREE_AI\.opencode\plugins\free-models`; use `-Destination` for another workspace. It replaces the destination `src` directory and overwrites those root files, so preview before applying:

```powershell
npm run sync:workspace -- -DryRun
# Optional destination override; still a preview:
npm run sync:workspace -- -Destination "C:\path\to\workspace\.opencode\plugins\free-models" -DryRun
```

Remove `-DryRun` only when you intend to update the installed workspace plugin. `-Source` optionally overrides the source checkout. Sync does not copy tests or automatically restart OpenCode.

### Live smoke tests

`npm run smoke` uses `opencode.cmd` to run a short `general` agent prompt for each model. It makes live requests and consumes provider quota; it does not establish full tool/agent compatibility.

```powershell
npm run smoke -- -All -OutFile smoke.jsonl -SummaryFile smoke-summary.json -TimeoutSec 120
npm run smoke -- -ModelsFile models.txt -OutFile smoke.jsonl -SummaryFile smoke-summary.json
```

| Option | Meaning |
|---|---|
| `-All` | Test all `free-` models returned by `opencode models --standalone` |
| `-ModelsFile` | Instead of `-All`, read one full `provider/model` ID per nonblank line |
| `-OutFile` | Required JSONL result path; overwritten at the start |
| `-SummaryFile` | Required JSON summary path; overwritten at completion |
| `-TimeoutSec` | Per-model timeout in seconds; default `60` |

Choose exactly one of `-All` and `-ModelsFile`. Use existing output directories and disposable output filenames. Results distinguish plan limits (`PLAN_LIMIT`), protocol failures (`PROTOCOL`), rate limits, timeouts, and other errors.

## Restart behavior

Local plugin code changes may require a service restart:

```powershell
opencode service restart
```

Config changes may be picked up by `opencode reload`, but new sessions are recommended.
