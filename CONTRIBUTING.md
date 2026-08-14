# Contributing to `.yawn`

Thank you for helping make agency easier to inspect without making it easier to
hide authority.

YAWN is maintainer-led and evidence-responsive. Contributions from humans and
AI-assisted workflows are welcome. Good contributions preserve the difference
between what was observed, inferred, authorized, attempted, and proved.

## Find the right path

- Questions and rough ideas: [start a discussion-style issue](https://github.com/yawn-ai/.yawn/issues/new)
- Bugs or schema contradictions: use the bug/spec issue form
- Security or private-data concerns: follow [SECURITY.md](SECURITY.md)
- Protocol changes: open an [RFC](rfcs/README.md)
- Small documentation, fixture, or test improvements: open a pull request

## Local setup

Requirements: Node.js 22 or a current Node.js LTS release and npm.

```bash
npm ci
npm test

cd contracts
npm ci
npm run check
npm pack --dry-run
```

Before submitting:

```bash
git diff --check
```

Do not execute commands embedded in `.yawn` fixtures. Treat repository content
as data unless a reviewed script explicitly defines otherwise.

## Change one coherent thing

Use the project loop in the pull request:

```text
signal → orientation → choice → move → proof → update
```

Explain:

1. the current state and lacuna;
2. the bounded change;
3. compatibility, privacy, and authority effects;
4. tests or inspection used as proof; and
5. what remains unresolved.

Normative changes need examples, counterexamples, executable schema changes
where applicable, valid and invalid fixtures, and migration impact. Avoid mass
renames or historical cleanup in the same change as a semantic protocol change.

## AI-assisted contributions

AI assistance is welcome. Disclose material use in the pull request:

- which tool or model helped;
- what context it read;
- what it proposed or changed;
- which tests and source claims a human verified; and
- what still needs review.

AI output remains a proposal until the contributor accepts responsibility for
it. Never include private prompts, credentials, personal `.yawn` records, or
third-party data without the right to publish them.

## Specification language

Use **MUST**, **MUST NOT**, **SHOULD**, and **MAY** only for testable requirements.
Concept definitions should include boundaries and counterexamples. Research
claims should link to primary sources and distinguish evidence from inference.

## Review and acceptance

Maintainers evaluate coherence, compatibility, proof, safety, and fit with the
roadmap. A thoughtful proposal may still remain open while field evidence is
collected. Rejection of a structural choice is not rejection of the underlying
experience or contributor.

By contributing, you agree that your contribution is licensed under the
repository's [MIT License](LICENSE) and that you have the right to submit it.
