# Views

Status: **Informative**

A View renders the canonical agency graph for a particular purpose. It
can change layout, inclusion, aggregation, and salience. It cannot change
identity, truth status, authority, privacy, proof, or event history.

Earlier drafts called this a `projection`. New normative work reserves
**Projection** for what an Agent actually expresses or attempts back into an
Arena. Rendering contracts use **View**. Legacy names remain readable only as
compatibility aliases.

## One graph, several lenses

| View | Foregrounds | Must not imply |
| --- | --- | --- |
| Arena | agents, affordances, constraints, boundaries, open turns | combat, fixed teams, or a winner |
| Timeline | causal sequence, overlap, waiting, deadlines, handoffs | one global clock or total ordering |
| Proof / replay | prediction, evidence, state delta, falsifier, revision | that a move proved itself |
| Memory | sources, summaries, retrieval paths, freshness | that recall is complete or literal |
| Causal graph | event and transition dependencies | that correlation is causation |
| Filesystem | durable containers and local navigation | that folders establish semantic identity |
| World | high-aperture context across nested arenas | that the rendered map exhausts reality |
| Orientation Spiral | a deterministic human-facing orientation cycle centered on the active Yawn or lacuna | that geometry, color, or an agent overlay creates canonical state |

## Agent Arena

Agent Arena is the vivid, game-readable View of agency: nested arenas,
agents, available moves, open turns, consequences, and what becomes possible
next. It can make an asynchronous causal history legible in the grammar of a
world, board, map, or coliseum.

The View is useful precisely because the core remains neutral. Arena does
not mean combat, opponent processing does not mean hostile people, and turns do
not mean reality literally pauses between moves. Fixed scoring would be a poor
default for open-ended human life, where purposes, rules, and participants can
change.

> YAWN does not turn reality into a game. It makes agency game-readable without
> pretending that the rules or score are fixed.

### Visual invariants

- spatial proximity may retrieve related candidates but never determines
  identity, parentage, merge, privacy, or authority;
- aperture changes context and salience, not truth;
- every rendered object resolves to a stable canonical ID;
- uncertainty and disputes stay visible;
- waiting, blocked, delegated, and yielded turns are first-class;
- nested arenas and turns may overlap asynchronously; and
- a user can inspect source, proof, and structural receipts from the view.

## Filesystem holarchy

The filesystem is the durable, inspectable View in this repository.
Folders are coherence containers, and `node.yawn` files explain what they hold,
receive, produce, and question. The semantic holarchy is richer than the folder
tree: `primary_parent_id` and typed lateral links establish protocol relations.

## Timeline is a view

Timeline is not a Yawn kind. It projects causal events and open turns. A single
Yawn may span several timelines; one timeline may show events from many Yawns.
Use causal IDs and local event cursors rather than assuming filenames or display
order define causation.

## Designing a new View

A proposal for a new View should declare:

1. the user purpose and aperture;
2. canonical record kinds read;
3. aggregation and omission rules;
4. uncertainty, privacy, and authority treatment;
5. stable ID and source inspection behavior;
6. interaction effects and required authorization; and
7. proof that presentation changes cannot mutate semantic state.

## Public View contract

Public YAWN.ai pages, YAWN.bot, downloadable `.yawn` records, QR-resolved
routes, and spiral Views may share `schemas/public-view.v1.schema.json`.
They report one semantic `snapshot_hash`; interface copy, QR rendering, media,
overlay state, and node positions are deliberately outside that hash.

Public source records contain metadata and hashes only. Relationship records are
offers, never inferred active relationships. Renderers validate stable IDs,
typed references, and the hash before displaying a View.
