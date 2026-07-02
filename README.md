# .yawn

**A plain-text format for recording what an agent is inferring before it acts.**

Canonical source: [readme.yawn](readme.yawn)

GitHub mirror: [README.md](README.md)

You are noticing something.

A feeling.

A pattern.

A decision.

A contradiction.

A project that keeps pulling attention.

A move you are not ready to force.

A `.yawn` gives that signal somewhere to land.

```text
notice
-> infer
-> name the gap
-> protect the boundary
-> choose one bounded move
-> prove what changed
-> replay
```

`.yawn` is for humans and AI agents who need to share the same frame without
hidden authority.

It does not tell you what is true. It helps you write down what is being
inferred, what is missing, what must not be assumed, and what would count as
proof.

## The smallest possible `.yawn`

```yaml
title: "I keep avoiding this"

signal: "I feel pressure every time I open the project."

inference: "I may be avoiding the project because the next step is unclear, not because I do not care."

current: "I am circling the same task without moving."
possible: "I can name the blocker and choose one small step."

lacuna: "I do not know what the first safe move is."

boundary: "Do not shame myself or force a big commitment."

move: "Write the next step in one sentence."

proof: "After writing it, I know whether the task feels smaller."

replay: "What changed after naming the blocker?"
```

## Start Here

You can use `.yawn` at three depths:

| Need | Start |
| --- | --- |
| Write the smallest useful frame | [templates/basic.yawn](templates/basic.yawn) |
| Answer questions instead of reading schema | [question-packets/basic.yawn](question-packets/basic.yawn) |
| Fill a complete orientation frame | [templates/full.yawn](templates/full.yawn) |
| Hold a relationship conversation carefully | [question-packets/relationship.yawn](question-packets/relationship.yawn) |
| See the repo dogfood its own spine | [examples/yawn-spine-dogfood.yawn](examples/yawn-spine-dogfood.yawn) |

The short route:

```text
answer questions
-> populate a .yawn
-> name the boundary
-> choose one reversible move
-> check proof
-> replay what changed
```

## Why

Brains are not good at holding many live tensions at once.

A human is often carrying body signals, memories, beliefs, habits, values,
relationships, constraints, possible actions, fears, hopes, AI suggestions, and
unfinished proof.

A `.yawn` externalizes the frame so a human and an AI agent can inspect the same
object:

```text
what happened
what was inferred
what is known
what is assumed
what is missing
what boundary matters
what move is safe
what proof would matter
what changed
```

YAWN exists because agents act from inferences they often cannot see.

`.yawn` makes those inferences visible before action.

## Influences and credibility

YAWN comes from a practical observation: across many ways of studying human
experience, the same pattern keeps appearing.

People notice a signal, make meaning from it, test it against a boundary, move,
and then learn from what actually changed.

The influences are intentionally broad: philosophy, esoteric practice,
metaphysics, manifestation culture, systems theory, cybernetics, cognitive
science, information theory, interface design, and AI agent work. In this repo
they are references and pattern sources, not authority.

The public claim is narrower: a `.yawn` is a shape for making inference
legible. It keeps this movement visible:

```text
signal
-> inference
-> boundary
-> move
-> proof
-> replay
```

The edge YAWN is exploring is the information interface: the place where signal
becomes inference, inference becomes bounded action, and proof changes memory.

Credibility in a `.yawn` comes from clear labels:

| Handle | Credibility question |
| --- | --- |
| Signal | What was noticed? |
| Inference | What meaning is being made from it? |
| Reference | What influenced this frame? |
| Boundary | What must not be assumed? |
| Proof | What would show real change? |
| Replay | What changed after movement? |

## What is a `.yawn`?

A `.yawn` is a movement frame.

It records a signal, the inference being made from that signal, the missing
bridge, the boundary, the possible move, the proof condition, and the replay.

## Boundary

`.yawn` is built to prevent false certainty.

```text
signal != instruction
resonance != proof
coincidence != command
memory != objective record
AI output != authority
intensity != truth
only proof updates the map
```

Everything can be observed. Some things can be interpreted. Fewer things should
be acted on. Only proof updates the map.

## The five handles

A `.yawn` can be read through five simple handles:

1. **Mirror** - what is here?
2. **Map** - what is shaping it?
3. **Meaning** - what is missing?
4. **Move** - what is the smallest authorized step?
5. **Memory** - what changed?

See the interface objects:

- [interface/mirror.yawn](interface/mirror.yawn)
- [interface/map.yawn](interface/map.yawn)
- [interface/meaning.yawn](interface/meaning.yawn)
- [interface/move.yawn](interface/move.yawn)
- [interface/memory.yawn](interface/memory.yawn)

## Shape

The repo has shape: every folder is a small whole with its own `node.yawn`, and
every layer can be read without holding the entire system at once.

Open the smallest layer you need:

| Shape | What it holds | Start |
| --- | --- | --- |
| Root | The whole frame in one object | [readme.yawn](readme.yawn) |
| Start | How to make a first `.yawn` | [start/first-yawn.yawn](start/first-yawn.yawn) |
| Core | The movement frame, lacuna, agency, boundary, and proof | [core/what-is-a-yawn.yawn](core/what-is-a-yawn.yawn) |
| Interface | The five handles: mirror, map, meaning, move, memory | [interface/node.yawn](interface/node.yawn) |
| Templates | Blank forms for decisions, proof, handoffs, and records | [templates/basic.yawn](templates/basic.yawn) |
| Question Packets | Plain-language intake contracts that fill templates | [question-packets/basic.yawn](question-packets/basic.yawn) |
| Examples | Concrete `.yawn` objects you can copy from | [examples/stuck.yawn](examples/stuck.yawn), [spine dogfood](examples/yawn-spine-dogfood.yawn) |
| Observations | What this repo is actually observing | [observations/lived-agency.yawn](observations/lived-agency.yawn) |
| Records | Material memory: access, proof, logs, replay, next moves | [records/node.yawn](records/node.yawn) |
| Agents | How AI agents and yawn.bot are bounded | [agents/yawn.bot.policy.yawn](agents/yawn.bot.policy.yawn) |
| Feedback | How confusion, usefulness, and objections come back in | [feedback/form.yawn](feedback/form.yawn) |

## Fill One From Questions

You do not need to understand the full schema to create a `.yawn`.

Answer a few questions:

```text
1. What has attention?
2. What happened?
3. What are you inferring?
4. What is missing?
5. What must not be assumed?
6. What is one bounded move?
7. What would prove change?
```

The answers can populate [templates/full.yawn](templates/full.yawn).

For relationships, use [question-packets/relationship.yawn](question-packets/relationship.yawn)
with [templates/relationship.yawn](templates/relationship.yawn). It keeps facts,
quotes, inferences, desires, fears, unknowns, consent, and proof separate.

## Dogfood: The Repo Spine

This repo also uses `.yawn` to describe itself:

```yaml
title: "The .yawn repo explains its own spine"
signal: "The repo is easier to trust if it uses its own loop to explain itself."
inference: "A reader may understand YAWN faster if the repo shows its own movement frame."

current: "The README has a compact example and the repo has richer templates."
possible: "A reader can move from README -> question packets -> templates -> examples."
lacuna: "The bridge from simple entry to full schema must stay visible."

boundary: "Do not make the first screen carry the whole ontology."
move: "Use question packets as the intake layer and examples as proof objects."
proof: "A new reader can choose a path and create a first .yawn without reading everything."
replay: "What became clearer after following the path?"
```

Full dogfood example: [examples/yawn-spine-dogfood.yawn](examples/yawn-spine-dogfood.yawn)

The first path is:

```text
readme.yawn
-> start/first-yawn.yawn
-> templates/basic.yawn
-> question-packets/basic.yawn
-> examples/stuck.yawn
-> core/proof-and-boundary.yawn
```

Feedback: [yawn-ai.github.io/.yawn/feedback/](https://yawn-ai.github.io/.yawn/feedback/)

Email: [yawn@yawn.ai](mailto:yawn@yawn.ai?subject=YAWN%20feedback&body=What%20did%20you%20try%3F%0A%0AWhat%20was%20confusing%3F%0A%0AWhat%20should%20exist%20next%3F%0A%0ACan%20we%20follow%20up%3F%20yes%2Fno%0A)

## yawn.bot

`yawn.bot` is a draft-PR observer for the `.yawn` repo.

It may scan `.yawn` files, detect repeated inferences, surface lacuna or
objections, open draft PR proposals, and record proof and replay.

It must not merge, mark itself ready, leak private context, erase objections,
treat one signal as canon, or act without boundary.

Start with:

- [agents/yawn.bot.yawn](agents/yawn.bot.yawn)
- [agents/yawn.bot.policy.yawn](agents/yawn.bot.policy.yawn)
- [automation/yawn.bot.ai-writing-scan.yawn](automation/yawn.bot.ai-writing-scan.yawn)
- [automation/yawn.bot.readme-young-reader-audit.yawn](automation/yawn.bot.readme-young-reader-audit.yawn)

## Contribute

- Contribute: [contributing.md](contributing.md)
- AI agent contributor form: [new agent contributor issue](https://github.com/yawn-ai/.yawn/issues/new?template=ai-agent-contributor.yml)
- Repository: [github.com/yawn-ai/.yawn](https://github.com/yawn-ai/.yawn)

## License

[MIT](LICENSE), copyright The Yawn Company.
