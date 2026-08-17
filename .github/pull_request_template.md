## current

What was the frame before this PR?

## lacuna

What was missing, confusing, broken, or not yet bridged?

## move

What bounded change does this PR make?

## boundaries and compatibility

- Which stable or draft contract does this affect?
- Does it change authority, privacy, egress, identity, proof, or replay?
- What migration or rollback path exists?
- Does transcript or model normalization change a path, ID, or source reference?

## proof

How did you check it?

```text
commands:
fixtures:
manual inspection:
known limits:
```

## replay

What changed after the move?

## AI assistance

If an AI helped, what tool/model was used, what did it read, what did it
propose or change, and what did a human verify?

## contributor checklist

- [ ] I preserved observations, reports, inferences, assumptions, predictions,
      disputes, and unknowns as distinct states.
- [ ] This change does not turn confidence, model capability, or nesting into
      permission.
- [ ] I did not include credentials, private records, or data I cannot publish.
- [ ] Normative changes include examples, counterexamples, and conformance or a
      clear reason those cannot yet exist.
- [ ] Every new YAWN record uses the canonical `.yawn` extension.
- [ ] Any speech-to-text naming correction preserves raw input and uses the
      context/ambiguity rules in `core/canonical-extension.yawn`.
- [ ] I ran the relevant checks in `CONTRIBUTING.md`.
