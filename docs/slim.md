# Using OPENFREE models with oh-my-opencode-slim

`opencode-openfree-models` registers providers. `oh-my-opencode-slim` owns agent routing. Keep those responsibilities separate.

## Suggested rollout

Start with low-risk roles:

| Role | Suggested model |
|---|---|
| `explorer` | `free-openrouter/cohere/north-mini-code:free` |
| `librarian` | `free-openrouter/recursive/flint-v1.0:free` |
| `test-writer` | `free-kilo/kilo-auto/free` |
| `observer` | `free-openrouter/google/gemma-4-31b-it:free` |

Keep these on approved paid models until quality is measured:

- `orchestrator`
- `fixer`
- `code-reviewer`
- `security-reviewer`
- `oracle`

## Example override

Use a project override rather than rewriting a stock preset:

```jsonc
{
  "agents": {
    "explorer": {
      "model": "free-openrouter/cohere/north-mini-code:free"
    },
    "librarian": {
      "model": "free-openrouter/recursive/flint-v1.0:free"
    }
  }
}
```

Validate against the installed Slim schema before applying. Exact preset and override keys can differ by Slim version.

## Warnings

- Do not copy `variant: "max"` to a model that does not advertise it.
- Free models may have different tool-calling reliability.
- Kilo and unknown-privacy providers may train on prompts.
- Do not route sensitive review or security work to `train:yes` / `train:unknown` providers.
- A model appearing in the picker does not prove a successful inference request.
