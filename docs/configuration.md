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
    "tagsURL": "https://ollama.com/api/tags"
  }
}
```

Credential resolution:

1. `OLLAMA_API_KEY`
2. Active OpenCode `ollama-cloud` connection
3. Active `free-ollama-cloud` connection

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

## Restart behavior

Local plugin code changes may require a service restart:

```powershell
opencode service restart
```

Config changes may be picked up by `opencode reload`, but new sessions are recommended.
