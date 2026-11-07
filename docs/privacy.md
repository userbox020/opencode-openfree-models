# Privacy

## Labels

| Label | Meaning |
|---|---|
| `train:yes` | Provider states prompts may be used for training or improvement |
| `train:no` | Provider states prompts are not used for training |
| `train:unknown` | No reliable current evidence |

## Current providers

| Provider | Label | Notes |
|---|---|---|
| `free-kilo` | `train:yes` | Kilo free entries advertise `mayTrainOnYourPrompts: true` |
| `free-openrouter` | `train:unknown` | Upstream free-model policies vary |
| `free-ollama-cloud` | `train:unknown` | Free-tier terms are not treated as no-training |

## Strict mode

Default code behavior:

```json
{
  "allowTraining": false,
  "allowUnknownPrivacy": false
}
```

This hides Kilo and unknown-privacy models. A provider may show zero eligible models. That is a successful policy result, not a bug.

## Broad mode

```json
{
  "allowTraining": true,
  "allowUnknownPrivacy": true
}
```

This makes all three providers visible. Use it only for non-sensitive experimentation.

## Discovery privacy

Provider discovery sends:

- catalog requests,
- model metadata requests,
- authentication headers where required.

It does not send:

- prompts,
- repository contents,
- file paths,
- session titles,
- conversation history.

## Data handling

- No telemetry.
- No prompt logging.
- No response persistence.
- No local gateway in the MVP.
- No automatic fallback to a different privacy policy.

Do not send secrets, customer data, private source code, or credentials to `train:yes` or `train:unknown` providers.
