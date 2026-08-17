# Security policy

YAWN is currently a file protocol, schema set, static site, and collection of
reference implementations. The largest risks are unsafe parsers, authority or
privacy confusion, provenance loss, malicious fixtures, and accidental
publication of personal records or credentials.

## Supported versions

| Surface | Supported |
| --- | --- |
| `@yawn/contracts` v1 | Security and critical correctness fixes |
| Root state-substrate v1 schemas and reducer | Security and critical correctness fixes |
| Agency Holarchy 0.2 | Experimental; reports welcome, compatibility may change |
| Retired numbered pre-canonical records | Preserved in Git and the migration receipt; not supported as executable input |

## Report privately

Do not open a public issue for a vulnerability, secret, or exposed private
record. Use GitHub's private vulnerability reporting / Security Advisory flow
for this repository. If that is unavailable, email `yawn@yawn.ai` with subject
`[SECURITY] .yawn`.

Include the affected version or commit, reproduction, likely impact, and the
minimum sensitive detail needed. Do not access additional data to demonstrate
impact. We will acknowledge a report when received and coordinate disclosure
after a fix or documented mitigation.

## Trust boundary for implementations

- Treat `.yawn`, YAML, JSON, Markdown, HTML, and fixture content as untrusted
  data.
- Never evaluate YAML tags, shell snippets, templates, or model-proposed tool
  calls by default.
- Check authorization, privacy, and egress before retrieving or ranking moves.
- Keep secrets and private memory out of public repositories and event payloads.
- Do not make AI inference, confidence, or a passing parser equivalent to human
  authorization.
- Preserve append-only evidence when repairing canonical state.
- Pin CI dependencies and use least-privilege workflow permissions.

## Data removal

If a public file contains personal or sensitive data that should not be here,
report it privately. Because Git history may retain deleted content, remediation
may require both a repository change and coordinated history or cache removal.
