# Security

## Credential handling

- Credentials come from OpenCode integration connections or environment variables.
- No secrets are stored in `.opencode/free-models.json`.
- The plugin does not read or edit `auth.json`.
- Credential values are never printed by `doctor`, `list`, or `privacy`.
- Provider credentials are bound to their provider integration ID.

Resolution order:

1. Environment variable.
2. Existing OpenCode integration connection.
3. Plugin-specific connection ID.

## Network policy

- Remote providers use HTTPS.
- Provider base URLs are code-reviewed constants.
- Catalog data cannot define arbitrary endpoints, headers, or packages.
- Redirects are disabled for catalog requests.
- Responses are size-limited and parsed as JSON.
- No custom endpoint support in the MVP.
- No local model endpoints are registered.

## No client impersonation

The plugin does not spoof official client identities, rotate accounts, or bypass free-tier restrictions. It uses documented provider connections and anonymous access only where the provider documents it.

## No gateway

The MVP does not expose a local OpenAI/Anthropic gateway. There is no LAN listener, CORS surface, or gateway token to protect.

A future gateway must be loopback-only, authenticated, request-limited, and disabled by default.

## Supply chain

- Zero runtime dependencies.
- No install/postinstall scripts.
- No downloaded binaries.
- No dynamic code from catalogs.
- Catalog strings are treated as untrusted display data.
- CI runs fixture tests only; live tests are manual.

## Reporting

See [SECURITY.md](../SECURITY.md).
