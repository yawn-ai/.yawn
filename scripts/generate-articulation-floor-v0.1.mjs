// Write fixtures/articulation-floor.v0.1.json deterministically from the lib, so the fixture's
// hashes and floors are exactly what the loop produces. Dependency-free.
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { answer, computeFloor, seal } from "../lib/articulation-floor-v0.1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const articulationFloorFixtureOptions = Object.freeze({
  ledgerId: "ledger:fixture:articulation-floor",
  actor: "principal:fixture",
  t_computed: "2026-09-13T12:00:00Z",
});

export function buildArticulationFloorFixture(options = articulationFloorFixtureOptions) {
  const model = "fixture: predictions read from the records named in source_refs; no provider call";
  const seals = [
    seal({ question: "question-packets/polanyi.yawn#fidelity", axis: "fidelity", predicted_answer: "rarely", predicted_reason: "The records say a move cannot mark itself successful and resonance is not proof; a reason given after the move is treated as a claim to check.", confidence: 0.55, model, t_sealed: "2026-09-13T00:00:00Z", blind: true, source_refs: ["core/proof-and-boundary.yawn"] }),
    seal({ question: "question-packets/polanyi.yawn#levels", axis: "levels", predicted_answer: "no", predicted_reason: "The holarchy contract says a whole harnesses its parts through boundary conditions the parts do not carry.", confidence: 0.6, model, t_sealed: "2026-09-13T00:00:00Z", blind: true, source_refs: ["core/holarchy.yawn"] }),
    seal({ question: "decisions/001-one-canon-per-concept.yawn", axis: "canonical-multiplicity", predicted_answer: "C", predicted_reason: "The authored rules sit on the single-canon side while the plural side is mostly drift; a typed pointer keeps lenses without a second canon.", confidence: 0.7, model: "decisions/001-one-canon-per-concept.yawn recommendation, attributed agent-on-behalf, authority none; no provider call", t_sealed: "2026-09-12T00:00:00Z", blind: false, source_refs: ["decisions/001-one-canon-per-concept.yawn"] }),
  ];
  const answers = [
    answer(seals[0], { answer: "sometimes; I can usually name the reason a day later, not in the moment", mode: "freeform", answer_match: "partial", reason_match: "partly", t_answered: "2026-09-13T09:00:00Z", actor: options.actor }),
    answer(seals[1], { answer: "no", mode: "pick", reason_match: "yes", t_answered: "2026-09-13T09:05:00Z", actor: options.actor }),
    answer(seals[2], { answer: "A", mode: "pick", reason_match: "no", t_answered: "2026-09-13T09:10:00Z", actor: options.actor }),
  ];
  const floors = [
    computeFloor(answers, seals, { axis: "all", t_computed: options.t_computed }),
    computeFloor(answers, seals, { axis: "fidelity", t_computed: options.t_computed }),
    computeFloor(answers, seals, { axis: "canonical-multiplicity", t_computed: options.t_computed }),
  ];
  return { schemaVersion: "yawn.articulation-floor.v0.1", ledgerId: options.ledgerId, canonicalState: false, notAuthority: true, seals, answers, floors };
}

async function generate() {
  const fixture = buildArticulationFloorFixture();
  await writeFile(join(root, "fixtures/articulation-floor.v0.1.json"), `${JSON.stringify(fixture, null, 2)}\n`);
  console.log(`Wrote fixtures/articulation-floor.v0.1.json: ${fixture.seals.length} seals, ${fixture.answers.length} answers, ${fixture.floors.length} floors.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generate();
