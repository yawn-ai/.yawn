# Decision Sufficiency V0.1

Decision Sufficiency V0.1 is an additive, experimental instrument for one
bounded question: whether a declared projection preserves enough of a finite,
synthetic state space to determine a declared reference evaluator's binary
result. It does not decide whether a real-world action is wise, authorized,
true, safe, or complete.

The executable instrument is
[`lib/decision-sufficiency-v0.1.mjs`](../lib/decision-sufficiency-v0.1.mjs).
[`scripts/generate-decision-sufficiency-v0.1.mjs`](../scripts/generate-decision-sufficiency-v0.1.mjs)
creates the reviewed synthetic artifact at
[`fixtures/decision-sufficiency.v0.1.json`](../fixtures/decision-sufficiency.v0.1.json).
Each coarse fiber is serialized as a
[`decision-sufficiency-receipt.v0.1`](../schemas/decision-sufficiency-receipt.v0.1.schema.json).

## Scope and boundary

The current receipt contract is deliberately narrow:

- Its state space is finite, declared before reference evaluation, and
  synthetic.
- Its reference result domain is exactly `executable` or `blocked`.
- Its receipt result may additionally be `needs_refinement` when a displayed
  fiber contains both reference results.
- Its fixed fixture uses the existing delegated-execution gate as a reference
  evaluator. The receipt describes that bounded modeled computation; it is not
  a delegated-execution receipt and cannot cause or authorize a merge.

Every valid receipt fixes `experiment.status: experimental`,
`experiment.fixtureIsSynthetic: true`, `experiment.liveEffects: false`, and
`experiment.normativeAuthority: none`. Its boundary also fixes
`receiptGrantsAuthority`, `projectionGrantsAuthority`, and
`refinementGrantsDisclosure` to `false`. These are contract fields, not
advisory labels.

No normative core migration follows from this experiment. A future production
use would need a separately reviewed schema, source and authorization model,
live-environment binding, and proof path.

## Formal criterion

For one fixed declared query `q`, let:

- `S` be a finite, nonempty set of declared states;
- `d_q : S -> { executable, blocked }` be one evaluation of the declared pure
  reference evaluator for `q` per state;
- `V` be the declared visible fields; and
- `C` be the declared candidate fields, disjoint from `V`.

`π_F(s)` is the canonical JSON projection of state `s` onto field set `F`.
The `V`-fiber for a state is:

```text
[s]_V = { t in S | π_V(t) = π_V(s) }
```

The projection is sufficient for `q` over `S` exactly when every visible fiber is
decision-homogeneous:

```text
∀ s,t in S: π_V(s) = π_V(t)  =>  d_q(s) = d_q(t)
```

Equivalently, the projection is sufficient exactly when there is a function
`h` on its projected values such that:

```text
d_q = h ∘ π_V
```

If every fiber is homogeneous, define `h(π_V(s)) = d_q(s)`; homogeneity makes
that definition well-defined. Conversely, a factorization through `π_V` gives
the same `d_q` value to every state with the same projection. This is a finite
partition criterion, not an assertion that a representation explains the
evaluator or the world.

If a fiber is not homogeneous, a refinement `R ⊆ C` is sufficient for that
fiber when all states equal under `V ∪ R` have the same reference decision.
The instrument enumerates the finite candidate subsets and records:

```text
M_f = { R | R is sufficient for fiber f and |R| is minimal }
```

The fiber remains `needs_refinement` and has enforcement disposition `block`
until the projection is sufficient. An `executable` or `blocked` result is
allowed only for a fiber whose recorded decision values are respectively the
singleton `[executable]` or `[blocked]`.

### Minimum-cardinality, ties, and necessity

`minimumCardinality` is the size shared by every set in `M_f`.
`allMinimumRefinements` retains every tied minimum set. The
`canonicalRefinement` is a deterministic lexical representative chosen for
stable rendering; it does not make that representative uniquely correct.

For each field in the canonical refinement, a `necessityWitness` gives two
states that remain indistinguishable after removing that field from the
canonical refinement but receive different reference decisions. This is a
conditional necessity claim:

```text
field x is necessary for this selected minimum R* over this declared S and d_q
```

It is not a claim that `x` occurs in every tied minimum set, is causally
necessary in the world, or should be disclosed in another context. When
minimum refinements tie, the complete tie set remains the evidence; the
canonical representative is only a deterministic View choice.

If no candidate subset resolves a mixed fiber, the receipt records
`minimumCardinality: null` and empty refinement and witness arrays. It remains
blocked rather than inventing a sufficient projection.

In the current generated experiment, the coarse projection needs seven raw
candidate fields. This means the instrument found no compression of those
independently relevant gate fields **within its declared raw candidate
universe**. `display_label` is excluded. It is not a proof that seven is a
universal shortest representation: introducing a derived aggregate such as a
gate-outcome field would define a different candidate universe and a different
question. The result is about finite decision fidelity and recoverable lost
distinction, not a guarantee that consequential detail can always be shrunk.

## What a receipt binds

The generator records four applicability bindings:

```text
stateSpaceSha256
querySha256
projectionSha256
evaluatorSha256
```

`evaluatorSha256` is the canonical SHA-256 of the declared evaluator
dependency bundle:

```text
gateSourceSha256
adapterSha256
sourceFixtureSha256
```

This pins the delegated-execution gate source, the full generator source that
contains the state-to-gate adapter/build definition, and the synthetic baseline
fixture. It prevents the instrument from treating a changed baseline or adapter
as though it were the same current evaluator setup.

The `replay.receiptSha256` digest is the canonical SHA-256 of the receipt body
excluding `replay`. It is useful for detecting ordinary mutation when a caller
recomputes it. It is not a signature, identity proof, authorization grant,
proof of the evaluator's mathematical claim, or protection against someone
rewriting a receipt and recomputing its digest. Schema validation checks digest
shape only; generator replay supplies the stronger local check.

## Historical, invalid, stale, and current

The receipt has different statuses that must not be collapsed:

| Condition | Meaning | Enforcement disposition |
| --- | --- | --- |
| Invalid | The structure is malformed, non-canonical, missing a required binding, or the stored digest does not match a recomputation. | `block` |
| Historical and structurally valid | The receipt can remain a correct record of the earlier bounded computation. | Preserved; it does not become current by itself. |
| Stale | The receipt is historically intact, but one or more current bindings differ from its recorded state space, query, projection, or evaluator bundle. | `block` |
| Current under the instrument | All four current bindings exactly equal the receipt bindings and the receipt's own result consistency checks hold. | Its recorded disposition, still without authority or effect. |

Staleness does not rewrite the historical receipt. It says that the earlier
projection/evaluator result is not applicable to the caller's current declared
bindings. Likewise, a currently matching synthetic receipt still does not
validate a live environment or authorize an operation.

## Reference gate limitation

The reused delegated-execution gate treats a nonempty `approvalBasis` as a
present approval basis. It does **not** independently establish who issued it,
whether it was legitimate, whether it was revoked, whether it covers the
current effect, or whether a person presently consents. The generator stores
this limitation verbatim in `referenceEvaluator.limitations`, and the receipt
schema requires it.

The fixed experiment also assumes valid synthetic input shapes. It does not
model identity, policy interpretation, source authenticity, timing, revocation,
or a live provider result beyond the values deliberately supplied to its finite
state space.

## Coarse, Witness, Refined

The intended Dave-only View is a three-part projection of one receipt, not
three decisions:

1. **Coarse** shows the declared visible projection and whether its fiber is
   homogeneous.
2. **Witness** shows the recorded pair that is equal under the coarse View but
   differs in reference decision, plus the fields that differ.
3. **Refined** shows the same receipt's minimum refinement record and the
   resulting finer partition.

The View may explain the generated evidence, but it may not present it as a
human trial, a live operational check, an approval, a permission, or an
external effect. See
[`interface/decision-sufficiency-view-v0.1.yawn`](../interface/decision-sufficiency-view-v0.1.yawn).

## Validation

The local proof path is:

```bash
node scripts/generate-decision-sufficiency-v0.1.mjs --check
node --test --test-concurrency=1 tests/decision-sufficiency-v0.1.test.mjs
```

The tests compile the strict receipt schema with the canonical action-signature
schema, validate the generated receipt, reject the declared invalid mutations,
independently recompute the finite partition/refinement result, and check that
changed current bindings produce `stale` rather than a rewritten history.
