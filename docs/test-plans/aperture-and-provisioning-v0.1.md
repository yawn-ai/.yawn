# Aperture and Provisioning Pressure Test v0.1

Status: proposed

## Claim under test

One canonical Yawn can support many user-selectable, context-sensitive, and
permission-safe apertures without duplicating semantic state, creating fixed
learning-style claims, or allowing a renderer to widen access or authority.

## Required distinction

- **View kind**: purpose-specific rendering family.
- **Aperture**: current scope, depth, time window, salience, and relations.
- **Aperture preset**: saved View + aperture + presentation-profile binding.
- **Presentation preference**: how a principal prefers to interact at a declared scope.
- **Provisioning**: who or what may access which resources or perform which effects.
- **Publication**: an authorized public/shared projection; not a duplicate truth store.

## Existing implementation risks

1. `components/yawn/view-switcher.tsx` uses a closed `ViewMode` union and fixed
   `VIEW_OPTIONS` array.
2. `components/shared/visibility-dropdown.tsx` exposes only public,
   participants, and private and defaults the component to public.
3. `components/shared/participants-dropdown.tsx` presents email/@username
   invitations but user invitation and real role management are incomplete.
4. `lib/yawn/visibility-access.ts` resolves only owner/participant/anonymous and
   full/summary/hidden access.
5. A View switch, publication action, participant invitation, Agent connection,
   and effect grant are currently at risk of being conflated in the interface.

Treat these as compatibility prototypes, not final contracts.

## Test equation

```text
effective render
  = canonical state at event cursor
  ∩ effective viewer/source grants
  ∩ source availability and egress policy
  filtered by registered View + aperture parameters
  rendered through accepted presentation preferences
```

## Scenario matrix

### 1. Sparse Yawn / Questions First

- Create a private Yawn from one sentence.
- Expect Questions First or an explicit hold.
- Switch to Map, Raw Model, and Timeline.
- Verify stable IDs and unchanged semantic/event hashes.
- Verify no visibility or authority mutation.

### 2. Root Agent Space / Attention Frontier

- Open `/dave` with real private state.
- Expect Attention Frontier under the context policy.
- Temporarily switch to Questions First.
- Save Questions First for this session only.
- Reopen and verify the root default remains unchanged.
- Save a Yawn-scoped preference and verify only that Yawn changes.

### 3. Accepted preference versus inferred suggestion

- Repeatedly switch one Yawn to Relationship Inspector.
- YAWN may suggest saving that aperture and must explain why.
- Reject the suggestion.
- Verify no persistent preference was written.
- Accept at Yawn scope and verify other Yawns remain unchanged.
- Verify no `visual learner`, `hierarchical learner`, or other fixed type claim is created.

### 4. Same Yawn, two viewers

- Owner selects Raw Model.
- Invited viewer selects Public Story or Relationship Inspector.
- Verify both reference the same canonical Yawn revision.
- Verify each has separate presentation-preference records.
- Verify private annotations and inaccessible fields do not appear to the other viewer.

### 5. Private versus public

- Start private by default.
- Configure a public aperture but do not publish.
- Verify anonymous access remains denied.
- Explicitly publish a pinned revision with a sanitized field set.
- Verify public access reveals only that projection.
- Update private canonical state and verify the pinned public projection does not silently change.
- Switch to live publication and verify changes are audit-receipted.

### 6. Invite and enterprise permissions

- Invite by @username and by email.
- Assign view, comment/respond, propose, edit, share, and export permissions separately.
- Set expiration and no-export constraints.
- Verify inherited rights may narrow but never widen.
- Revoke access and verify future access immediately fails.
- Verify replay cannot bypass revocation.

### 7. Agent and provider access

- Give an Agent read access to a bounded source aperture.
- Do not give effect authority.
- Verify it can propose but cannot act.
- Replace the intelligence provider.
- Verify Yawn identity, preference, grants, history, and proof remain unchanged.
- Verify provider-retention/export constraints are distinct from human collaborator permissions.

### 8. Custom aperture

- Register a declarative custom aperture without editing a closed UI enum.
- Verify it appears only for compatible, authorized contexts.
- Attempt to request an inaccessible private field.
- Verify fail-closed behavior and an inspectable denied-field receipt.
- Remove the renderer and verify deterministic fallback.

### 9. Nestheads game aperture

- Render the same Yawn and event cursor through text and Phaser/Nestheads.
- Verify all game objects resolve to canonical IDs.
- Move or animate an object without emitting a semantic operator.
- Verify semantic state remains unchanged.
- Perform a reviewed `link`, `hold`, or `authorize` operator through the game UI.
- Verify the same canonical event as the text aperture.
- Verify an accessible non-game equivalent exists.

### 10. Adaptive aperture safety

- Give the system a task for which another aperture could plausibly reduce correction burden.
- Require it to show the selected/suggested aperture and reason.
- Override it immediately.
- Verify no hidden adaptation or engagement-only optimization.
- Inject a safety, privacy, or consent boundary that the preferred aperture would hide.
- Verify the hard gate remains visible.

## Comparative evaluation

Hold the underlying Yawn, model/provider, compute budget, task, and time as
constant as practical. Compare:

1. fixed Questions First;
2. explicit user-selected aperture;
3. Auto with visible rationale and immediate override;
4. raw model;
5. Nestheads/game aperture when available.

Measure:

- orientation gain;
- correction burden;
- navigation success;
- context-restoration time;
- task/question completion;
- preference reversals;
- authority and privacy comprehension;
- cognitive carrying reduction;
- unwanted anthropomorphic or engagement capture.

## First-lap completion criteria

- Apertures are registry-driven rather than a closed `ViewMode` union.
- Questions First remains a context default, not a universal hard-coded View.
- Time, Aperture, and Provisioning appear as adjacent but semantically distinct controls.
- The default Yawn is private/deny until explicit grants exist.
- A user can select `use once`, `this Yawn`, `this Arena`, or personal default scope.
- Inferred preferences remain proposals until accepted.
- Public and private projections share canonical identity and do not duplicate truth state.
- Invite by username/email has real role, expiration, revocation, and audit semantics.
- A custom aperture cannot read outside effective grants.
- A View switch cannot mutate semantic state or authority.
- A provisioning change cannot silently change the selected aperture.
- Historical replay cannot widen current access.
- At least one same-Yawn, two-viewer test and one Nestheads/text parity test pass.

## Falsifiers

- Users cannot predict what changing Aperture will affect.
- Aperture and sharing controls are routinely confused.
- Dynamic selection causes more correction or distrust than a stable default.
- Public projections leak private source, relationship, or model data.
- Custom renderers create incompatible semantics or controls.
- The registry and preset system adds more management burden than it removes.
- The game aperture increases engagement without improving orientation, recall,
  context restoration, or agency.
