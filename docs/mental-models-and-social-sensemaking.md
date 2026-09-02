# Mental models and social sense-making

Status: **research-informed design note, not a settled theory of mind**

This note explains why `.yawn` treats mental models as attributed, relational,
socially shaped, and revisable.

## Working claim

A mental model is a partial representation that lets an agent run possibilities:
describe a situation, infer causes, anticipate outcomes, coordinate with others,
or choose a move.

The model is not reality. It is a tool used from a standpoint.

Mental-model theory has long emphasized representations of possibilities and the
need to search for alternative models or counterexamples rather than stopping
at the first coherent interpretation. See P. N. Johnson-Laird, “Mental Models in
Cognitive Science” (1980), and Khemlani & Johnson-Laird, “The processes of
inference” (2013).

- https://doi.org/10.1207/s15516709cog0401_4
- https://doi.org/10.1080/19462166.2012.674060

## Why models become messy when spoken

A person normally does not carry one clean, explicit graph of their worldview.
What becomes expressible depends on:

- the current Question;
- the relationship and social setting;
- attention and working memory;
- emotion and bodily state;
- language available for the experience;
- expectations about the listener;
- identity and reputational stakes;
- which counterexamples are currently accessible.

Conversation is therefore not merely a channel for transmitting a completed
model. It can participate in constructing and revising the model.

This is consistent with research on interactive and shared cognition: useful
team knowledge may be overlapping, complementary, distributed, and dynamically
coordinated rather than represented identically in every individual.

- Stout et al., “Planning, Shared Mental Models, and Coordinated Performance”
  (1999): https://doi.org/10.1518/001872099779577273
- Cooke, “Interactive Team Cognition” (2013):
  https://doi.org/10.1111/cogs.12009
- Cannon-Bowers & Salas, “Reflections on shared cognition” (2001):
  https://doi.org/10.1002/job.82

## Why persistent models are not automatically true

Ideas and practices survive socially for several possible reasons:

- they predict something useful;
- they coordinate behavior;
- they compress experience;
- they support identity or belonging;
- they are taught by trusted or prestigious people;
- they fit existing institutions and incentives;
- they are memorable or emotionally compelling;
- alternatives are costly, inaccessible, or punished;
- they genuinely track reality;
- or several of these at once.

Culture and cognition shape each other. Social institutions, networks, language,
and repeated practices can activate and select among cognitive schemas.
Cultural evolution can preserve highly useful knowledge, but selection for
transmission or group coordination is not identical to selection for truth.

- DiMaggio, “Culture and Cognition” (1997):
  https://doi.org/10.1146/annurev.soc.23.1.263
- Markus & Hamedani, “Psychology and Culture” (2007):
  https://doi.org/10.1146/annurev.psych.58.110405.085559
- Heyes, “Précis of Cognitive Gadgets” (2019):
  https://doi.org/10.1017/S0140525X18002145
- Dean et al., “Human cumulative culture: a comparative perspective” (2014):
  https://doi.org/10.1111/brv.12053

The public YAWN examples should therefore avoid treating any one religious,
scientific, political, professional, or family tradition as uniquely irrational.
All traditions can preserve insight, blind spots, authority structures, identity
commitments, and standards of evidence.

## Motivated reasoning

People do not always evaluate every claim using one neutral procedure.
Motivation can influence which beliefs are retrieved, which explanations are
constructed, and how evidence is evaluated. The resulting account may feel
reasonable because the biased selection process is not itself fully visible.

That does not mean every protected belief is false or every identity commitment
is irrational. It means the model should preserve the relationship between the
claim, the identity or value at stake, the evidence considered, and the
alternatives that were not considered.

- Kunda, “The case for motivated reasoning” (1990):
  https://doi.org/10.1037/0033-295X.96.4.480
- APA summary of motivated reasoning:
  https://www.apa.org/pi/aids/resources/education/reasoning

## Observer and executive functions

“Observer” is an interface and ontology role, not a claim that the brain
contains an all-seeing homunculus.

Executive functions support goal-directed regulation such as inhibitory
control, working-memory updating, and cognitive flexibility. Metacognitive
processes monitor and regulate cognition, including parts of executive control.
These functions are limited, distributed, and dependent on task and context.

Tomasello's agency-based model explicitly distinguishes executive regulation of
attention/action from second-order metacognitive regulation of those executive
processes.

- Tomasello, “An agency-based model of executive and metacognitive regulation”
  (2024): https://doi.org/10.3389/fdpys.2024.1367381

YAWN's operational translation is:

```text
embodied Agent
  ↕ may occupy
observer role / participant role / actor role / affected role
```

Role separation does not require identity multiplication. Self-observation is
valuable, but it is not independent corroboration.

## The YAWN design response

A useful model record preserves more than its conclusion:

```yaml
question:
position:
asserted_by:
source_refs:
source_relationship_refs:
standpoint:
arena:
identity_or_value_stakes:
alternatives:
counterexamples:
confidence:
uncertainty:
disputes:
criteria:
falsifiers:
revision_conditions:
```

A model may be coherent and still wrong. A model may be socially unpopular and
still useful. Agreement may improve coordination without proving accuracy.
Disagreement may reveal different evidence, definitions, values, roles, or
access rather than one simple factual conflict.

## Model comparison without forced consensus

When two Yawnbots answer one Question differently:

```text
shared Question
  ├─ Position A — attributed to Agent A
  └─ Position B — attributed to Agent B
```

the system should inspect:

1. Are the terms defined the same way?
2. Are the sources independent?
3. Did the observations occur in the same Arena and time window?
4. Do the agents have different access or roles?
5. Are they evaluating against different values or criteria?
6. Which claim is empirical, normative, strategic, or identity-related?
7. What evidence or experience could revise either Position?
8. Is coordination possible without full agreement?
9. What is the smallest reversible Move that increases shared resolution?

The output may be:

- stronger agreement;
- clearer disagreement;
- an unresolved lacuna;
- a scoped experiment;
- a negotiated boundary;
- an explicit hold;
- or recognition that the models answer different Questions.

## Social fitness is a clue, not a proof field

YAWN may record that a model is widespread, durable, institutionally supported,
identity-protective, prestigious, costly to signal, or successful at
coordination. These are useful causal and social observations.

They must not be collapsed into:

```text
popular → true
durable → good
costly → sincere
scientific label → proven
religious label → false
consensus → authority
novel → superior
```

## Falsifiers for this design

Revise this model if evidence shows that:

- explicit source and relationship metadata adds burden without improving
  correction or coordination;
- users consistently mistake attributed Positions for objective profiles;
- model comparison intensifies identity defense more than it creates useful
  differentiation;
- a simpler source-and-question ledger performs as well;
- the slash metaphor causes more confusion than relational clarity;
- the system rewards model complexity rather than contact with consequences;
- users feel pressured to expose private cognition to participate;
- or independent implementations cannot preserve the distinctions.

## Current confidence

```yaml
mental_models_are_partial_action_guiding_representations: 0.94
mental_models_are_often_socially_shaped: 0.96
social_persistence_alone_indicates_truth: 0.08
conversation_can_help_construct_and_revise_models: 0.90
shared_models_can_support_coordination: 0.87
full_model_similarity_is_required_for_coordination: 0.18
yawn_will_improve_model_correction_in_practice: 0.58
```

The first five estimates summarize broad research-aligned claims. The final
estimate is a YAWN-specific product hypothesis and requires direct testing.

## Related protocol records

- [`core/open-relation-port.yawn`](../core/open-relation-port.yawn)
- [`core/relation-address.yawn`](../core/relation-address.yawn)
- [`core/relational-observation.yawn`](../core/relational-observation.yawn)
- [`schemas/relation-address.v0.1.schema.json`](../schemas/relation-address.v0.1.schema.json)
- [`schemas/relational-observation.v0.1.schema.json`](../schemas/relational-observation.v0.1.schema.json)
- [`references/RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn`](../references/RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn)
