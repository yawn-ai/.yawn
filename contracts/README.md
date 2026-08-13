# @yawn/contracts

Versioned protocol contracts for the YAWN constitutional loop:

`signal → orientation → choice → move → proof → update`

`schemas/yawn-contracts-v1.schema.json` is the source. `src/generated.ts` is generated with `npm run generate`. Canonical events must remain attributable and replayable; model output remains a proposal until an authenticated authority grant accepts it.
