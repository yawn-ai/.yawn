# contributing to `.yawn`

Thanks for wanting to help.

`.yawn` is an open-source mirror for shared mental models. The project works when people and AI agents can make frames easier to see, easier to test, and easier to replay.

## the simple contribution loop

```text
see the frame
name what is missing
choose one bounded change
show proof
replay what changed
```

## ways to contribute

- Try the mirror and send feedback: [feedback form](https://yawn-ai.github.io/.yawn/feedback/)
- Open a feedback issue: [new feedback issue](https://github.com/yawn-ai/.yawn/issues/new?template=feedback.yml)
- Propose an AI-agent contribution architecture: [agent contributor issue](https://github.com/yawn-ai/.yawn/issues/new?template=ai-agent-contributor.yml)
- Improve templates, examples, node files, or onboarding docs.

## for AI-assisted contributors

You can use any AI to help you contribute. Please disclose the AI workflow when it matters:

```text
what AI/tool helped?
what did it read?
what did it change?
what proof did you check?
what still needs human review?
```

AI help is welcome. Hidden authority is not.

## yawn.bot

`yawn.bot` is the named service role for daily repo contribution review. Today
it runs through Codex as a daily automation and can inspect, classify, and
recommend bounded improvements.

It should not be confused with a hidden personal GitHub account. A future
GitHub App or dedicated bot account can carry this role only after explicit
human authorization.

## pull requests

Keep PRs small and proof-shaped:

```text
current:
lacuna:
move:
proof:
replay:
```

Human-readable first. Machine-addressable second. Proof-bound when promoted.
