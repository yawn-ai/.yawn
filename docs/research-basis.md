# Research basis and limits

Status: **Informative**

YAWN is an engineering synthesis informed by cognitive science, philosophy,
cybernetics, information systems, provenance standards, and lived use. These
sources motivate design questions; they do not prove the whole ontology or make
software agents equivalent to organisms.

## Agent and arena

Vervaeke's lecture series describes an arena as a situation organized relative
to an agent's ability to act and calibrate performance, with agent and arena
co-identifying through that relation. Jaeger, Riedl, Djedovic, Vervaeke, and
Walsh later define the arena as the situated, task-relevant part of a larger
experienced environment and describe iterative coupling among goals, actions,
affordances, and changed conditions.

YAWN's `arena` follows that bounded relevance sense. YAWN's first-class
asynchronous `turn` is an engineering discretization of the loop, not a term or
ontology attributed to Vervaeke. The source explicitly treats underlying
processes as continuous and concurrent, so the protocol permits overlapping and
nested turns.

The protocol's relationship-first formulation is a YAWN synthesis, not a quote
or settled scientific taxonomy. Its full provenance braid separates direct
source support from engineering inference and links Vervaeke's agent-arena
reciprocity with participatory sense-making, affordance, active-inference,
enactive, and extended-cognition research. See
[`references/RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn`](../references/RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn).

- John Vervaeke, *Awakening from the Meaning Crisis*, Episode 7:
  <https://meaningcrisis.co/episode-7-aristotles-world-view-and-erich-fromm/>
- Jaeger et al. (2024), “Naturalizing relevance realization” in *Frontiers in
  Psychology*: <https://doi.org/10.3389/fpsyg.2024.1362658>

## Event segmentation and replay

Humans segment continuous activity into meaningful events, and event models
help guide perception and memory. YAWN's turns and events use that practical
fact while preserving causal overlap and uncertain temporal precision.

- Zacks & Swallow (2007), “Event Segmentation,” *Current Directions in
  Psychological Science*: <https://doi.org/10.1111/j.1467-8721.2007.00510.x>

## External and extended cognition

External representations can participate in reasoning by reducing memory load,
stabilizing shared context, and changing available operations. A `.yawn` is
designed as such a scaffold. It can record participatory experience but cannot
reduce lived knowing to propositions or logs.

- Clark & Chalmers (1998), “The Extended Mind”:
  <https://doi.org/10.1093/analys/58.1.7>

## Provenance and event sourcing

Attributed entities, activities, agents, derivations, and revision histories
are established concerns in data provenance. YAWN aligns with W3C PROV where
possible while adding authority, lacuna, proof, and orientation semantics.

- W3C PROV-O: <https://www.w3.org/TR/prov-o/>
- JSON Schema Draft 2020-12: <https://json-schema.org/draft/2020-12>

## Structural inference

Minimum Description Length offers one way to compare candidate structures by
balancing model complexity against unexplained exceptions. YAWN treats this as
an informative guard for routing, never an authority that can override privacy,
permissions, provenance, proof, or human judgment.

- Grünwald (2000), “Model selection based on minimum description length”:
  <https://pubmed.ncbi.nlm.nih.gov/11151565/>

## Goal networks and hierarchical action

Goal Systems Theory represents goals and their means as a network: one goal can
have several means, one means can serve several goals, and activation can move
through those relations. YAWN uses this as support for objective holons that can
coordinate multiple goals and connect laterally rather than flattening every
direction into one assistant queue.

The options framework in hierarchical reinforcement learning models bounded,
temporally extended courses of action with their own initiation and termination
conditions. It is a useful engineering analogy for delegated worker bots and
proof-bounded turns. It is not evidence that human purposes are reward
functions, that a bot owns its principal's objective, or that software agents
have human-like experience.

- Kruglanski et al. (2002), “A theory of goal systems”:
  <https://doi.org/10.1016/S0065-2601(02)80008-9>
- Sutton, Precup, and Singh (1999), “Between MDPs and semi-MDPs: A framework
  for temporal abstraction in reinforcement learning”:
  <https://doi.org/10.1016/S0004-3702(99)00052-1>

## Choice architecture and adaptive disclosure

Choice architecture affects decisions through both the structure of the choice
task and the way options and attributes are described. Classic
choice-reaction experiments also connect response time to the information or
uncertainty in the alternatives under controlled conditions.

YAWN therefore ranks currently valid operations only after authority, privacy,
provenance, structural-fit, and proof gates; foregrounds a few high-value paths;
shows the data-model consequence of each; and preserves correction and access
to the rest. The limit of three suggested structural paths is a product
heuristic to test, not a universal cognitive law. Probability ranks proposals;
it does not establish the person's objective or authorize an operation.

- Johnson et al. (2012), “Beyond nudges: Tools of a choice architecture”:
  <https://doi.org/10.1007/s11002-012-9186-1>
- Hick (1952), “On the rate of gain of information”:
  <https://doi.org/10.1080/17470215208416600>

## Claim discipline

When describing the project, use these labels:

- **Observed**: directly recorded with an attributable source.
- **Reported**: stated by another agent or source.
- **Inferred**: an interpretation from available evidence.
- **Experimental**: implemented to learn, without a stable guarantee.
- **Unknown**: unresolved or outside current access.

The project does not claim that relevance can be completely formalized, that a
schema captures the world, that AI has human-like participatory agency, or that
gamification is intrinsically beneficial. The lacuna is part of the design:
every arena remains a provisional small-world cut that may need reframing.
