# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.2.x | Yes |
| 0.1.x | No |

## Reporting a vulnerability

Report privately through the repository security advisory flow. Do not open a public issue for:

- credential exposure,
- endpoint/SSRF issues,
- gateway authentication issues,
- malicious catalog handling,
- supply-chain concerns.

Include:

- affected version or commit,
- provider and configuration,
- reproduction steps using synthetic credentials,
- impact and suggested mitigation.

## Design rules

- No secrets in project configuration.
- Credentials are resolved from OpenCode connections or environment variables.
- Remote catalogs cannot define endpoints, headers, packages, or code.
- Redirects are disabled for catalog requests.
- No local gateway in the MVP.
- No client impersonation or account rotation.
- No paid fallback.
- No telemetry or prompt logging.

## Out of scope

- Vulnerabilities in upstream providers.
- Terms-of-service disputes with providers.
- Issues caused by sending private data to training-enabled providers.
- Local machine compromise outside the plugin's code path.
