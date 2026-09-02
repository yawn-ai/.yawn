# RFC 0004: The slash carries capabilities — slash commands as invocations inside a relation step

- Status: proposed / owner review required
- Date: 2026-09-02
- Authors: David Forman (source, voice) with @claude (agent:anthropic:claude-code) synthesis
- Decision authority: founding maintainer (Dave)
- Depends on: [PR #27](https://github.com/yawn-ai/.yawn/pull/27) `core/relation-address.yawn` and `core/open-relation-port.yawn` (proposed); compatible with `main` as of `f713749`
- Source record: `dave.yawn/Preferences/YAWN_BOT_SLASH_ONTOLOGY_INHERITANCE_AND_MAIL_PRIMARY_2026_09_02.yawn`

## 1. Summary and status

Two things in this system are written with the same glyph:

- the **relation operator** in an address — `yawn.bot/dave`, `dave/lauran`;
- the **slash command** in a conversation — `/capabilities`, `/loop`, `/code-review`.

Dave's observation (2026-09-02, verbatim in the source record): the relation
operator "seems to be a transfer of capabilities, or a value delivery, or how
we coordinate … we're within a relationship, but then whatever it is that
we're trying to do is also within a relationship."

This RFC proposes that they are one operator seen from two standpoints:

- a **relation step** (`A/B`) is a noun — B reached through the declared
  relation from A — and the step **carries** something: grants, obligations,
  value delivered, and a coordination protocol;
- a **slash command** (`/verb`) is a verb — a **capability invocation** — and
  it is always issued *inside* a relation step; its authority is exactly what
  that step carries, never more.

Status: proposal. Nothing here changes canon, grants authority, or makes any
current implementation conformant.

## 2. Current state and lacuna

`core/holarchy.yawn` already says child authority "may narrow automatically;
widening requires an explicit rightful grant". `spec/ontology.md` already
defines the execution-delegate relationship as "an active, revocable
relationship between a rightful grantor and a capability-bound worker". PR #27
defines the Relation Address and states that the slash "is the visible
traversal handle. It is not the relationship record itself."

What is missing:

- no contract says **what a relation step carries** between its endpoints;
- "slash command" is undefined; product surfaces (yawn.bot chat, agent CLIs)
  use it daily with no ontological home;
- the click-through Dave asked for — "click into the slash and it shows you
  the two bots and the holonic taxonomy view" — has no View contract.

## 3. Proposed semantics and invariants

### 3.1 A relation step carries

Every relation step (PR #27 `relation_steps[]`) MAY declare a `carries` block:

```yaml
carries:
  grants:            # capabilities the from-endpoint makes invocable for the to-endpoint (or vice versa, by direction)
    - capability: yawn.read
      boundary: { scope: owner_agent_space }
      granted_by: user:dave
      revocable: true
  obligations:       # what each endpoint owes the other while the step is active (receipts, cursor advance, proof)
    - "append receipts to the shared thread"
  value_delivery:    # what actually flows (a brief, a decision, a proof, a payment, attention)
    - "daily morning brief to dave@yawn.ai"
  coordination_protocol: yawn.collaboration-message.v1
  revocation: "grantor event; suspension on stale input or failed check"
```

Invariants:

1. `carries.grants` is a **subset** of what the from-endpoint rightfully holds;
   a step cannot mint capability (holarchy inheritance rule, unchanged).
2. Carrying is **directional**; the inverse View (`B/A`) does not carry the same
   grants unless declared.
3. A declared grant is **not availability** and **not proof** (the
   `/capabilities` distinction: ability ≠ access ≠ authority ≠ availability ≠
   proof).
4. `carries` is inspectable through the slash: selecting the slash MAY disclose
   the two endpoints, relation type, direction, what is carried, and the
   holonic position of each endpoint (the "two bots" View).

### 3.2 A slash command is a capability invocation

```text
<relation address> + /<verb> [args]
```

is a **Move** addressed at the innermost relation step of the address:

- `yawn.bot/dave` + `/capabilities` → "render what the yawn.bot→dave step
  carries" (the owner aperture);
- `yawn.bot` + `/capabilities` → "render the capability types the shared
  ontology defines" (the public View; no principal, so nothing granted);
- `yawn.bot/claude` + `/loop 5m /babysit` → invoke `loop` using only what the
  yawn.bot→claude step carries; if `loop` is not carried, the invocation is a
  proposal, not an effect.

Invariants:

5. **No invocation from nowhere.** A slash command with no relation address
   resolves against the Open Relation Port of the current anchor and can only
   propose.
6. **Authority = carried grant ∩ current availability ∩ explicit rightful
   event.** Confidence, habit, and prior success never widen it.
7. A slash command that would produce an external effect emits the same
   receipts as any Move (action receipt, proof receipt); the address is
   recorded on the receipt so replay shows *which relation* was exercised.
8. A slash command that names a View (`/ontology`, `/frontier`) is a
   projection change, not an effect; it needs no grant beyond `yawn.read`.

### 3.3 Inheritance by reference

`yawn.bot/<coordinate>` without a principal segment is the shared ontology.
`yawn.bot/<principal>/<coordinate>` is the same coordinate reached through the
principal's declared step. The principal **references** the shared meaning; the
step **carries** the principal's grants. No copy of the shared record is made
under the principal (PR yawn-ai/yawn.bot#109, "Dave references them; he does
not privately own or duplicate their meanings").

## 4. Alternatives and counterexamples

- *Keep slash commands as UI sugar with no ontology.* Rejected: every product
  surface already routes authority through them; an undefined operator is an
  unauditable one.
- *Make every slash command a child Yawn.* Rejected: most invocations are
  Moves inside an existing Turn, not new orientation contracts.
- *Treat the path as containment (B "inside" A).* Already rejected by
  `core/canonical-extension.yawn` and PR #27 (`semantic_parentage` only via
  `primary_parent`).
- Counterexample that must stay false: an agent invoking `/deploy` at
  `yawn.bot/claude` when the step carries only `yawn.propose` — invariant 6
  makes this a proposal with a visible lacuna, never an effect.

## 5. Authority, privacy, safety, and human-agency effects

- Authority can only narrow through steps; widening remains a grantor event.
- Privacy: `carries` is part of the relationship record, private by default;
  the public View shows capability *types*, never a principal's grants.
- Safety: an invocation that fails a precondition suspends (matches the
  execution-delegate loop); uncertainty never becomes permission.
- Human agency: the person can read, at the slash, exactly what they have
  handed to a bot and revoke it — the click-through Dave asked for.

## 6. Compatibility and migration

Additive. `carries` is optional on relation steps; absent means "unknown", not
"nothing". No existing schema changes. If PR #27 merges first, this RFC's
schema fragment lands under `schemas/relation-address.v0.1.schema.json`
(`relation_steps[].carries`); if not, it lands with #27.

## 7. Schemas, examples, and conformance tests

- Contract: `core/relation-carries.yawn` (this PR).
- Example: `yawn.bot/dave` carries nine owner grants
  (`agent_space.owner, yawn.read, yawn.propose, yawn.decide, proof.record,
  budget.request, connector.github.read, connector.github.write,
  deployment.publish`) and `dave → service:yawn` carries six execution-delegate
  grants (`connector.github.inspect, connector.github.prepare,
  connector.github.execute_work_order, action.policy.match,
  action.policy.propose, action.receipt.record`) — fifteen in the live
  control-plane graph on 2026-09-02.
- Conformance test: `tests/relation-carries-v0.1.test.mjs` (this PR) checks
  the contract's required keys, canonical epistemic status, and that the
  invariant text is present.

## 8. Evidence, open questions, and falsifiers

- Evidence: the fifteen-capability graph; the `/capabilities` coordinate; the
  daily use of slash commands in every agent surface; Dave's source record.
- Open: should `value_delivery` be its own record kind (a Turn's output) rather
  than a field on the step? Should a slash command at a public View ever carry
  a grant (e.g. `/apply`)?
- Falsifier: a real invocation whose authority cannot be derived from the
  address's carried grants plus a rightful event. If one exists and is
  legitimate, invariant 6 is wrong.

## 9. Decision and implementation receipt

Pending Dave's ruling. Implementation receipt to follow in yawn.bot: the slash
disclosure in `YawnCoordinateFrame` and the `/dave/capabilities` aperture.
