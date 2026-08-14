import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import { validateAgencyHolarchySemantics } from "../lib/agency-holarchy-v0.2.mjs";

const readJson = async (relativePath) => JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));

const schema = await readJson("../schemas/agency-holarchy.v0.2.schema.json");
const canonicalFixture = await readJson("../fixtures/agency-holarchy.v0.2.json");
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);

const clone = (value) => structuredClone(value);
const errors = () => ajv.errorsText(validate.errors, { separator: "\n" });

test("the canonical agency-holarchy working-draft fixture validates", () => {
  assert.equal(validate(canonicalFixture), true, errors());
  assert.deepEqual(validateAgencyHolarchySemantics(canonicalFixture), []);
});

test("world is an unbounded referent, while fields and arenas are serialized", () => {
  assert.ok(schema.$comment.includes("unbounded referent"));
  assert.equal(Object.hasOwn(schema.properties, "world"), false);
  assert.ok(schema.$defs.Arena.description.includes("agent-relative"));
  assert.ok(schema.$defs.Arena.properties.field.$ref.endsWith("/FieldSnapshot"));
});

test("the holarchy has one primary-parent backbone and typed lateral links", () => {
  const child = canonicalFixture.yawns.find((yawn) => yawn.yawnId === "yawn:verify-live-hub");
  const nestedArena = canonicalFixture.arenas.find((arena) => arena.arenaId === "arena:repository-publication");
  assert.equal(child.primaryParentYawnRef, "yawn:ontology-hub");
  assert.equal(nestedArena.parentArenaRef, "arena:open-source-project");
  assert.deepEqual(schema.$defs.Relation.properties.relationType.enum, [
    "overlaps",
    "depends_on",
    "supports",
    "conflicts_with",
    "coordinates_with",
    "derived_from",
    "supersedes",
    "same_as",
  ]);

  const invalid = clone(canonicalFixture);
  invalid.yawns[0].secondaryParentYawnRef = "yawn:unexpected";
  assert.equal(validate(invalid), false);
  assert.match(errors(), /additional properties/);
});

test("lateral relations preserve epistemic confidence and effective time", () => {
  const relation = canonicalFixture.relations[0];
  assert.equal(relation.epistemicStatus, "inferred");
  assert.equal(relation.confidence, 0.98);
  assert.equal(relation.effectiveUntil, null);

  const invalid = clone(canonicalFixture);
  invalid.relations[0].confidence = 1.5;
  assert.equal(validate(invalid), false);
  assert.match(errors(), /must be <= 1/);
});

test("turns may nest and waiting turns require an explicit resume contract", () => {
  const child = canonicalFixture.turns.find((turn) => turn.parentTurnRef !== null);
  assert.equal(child.parentTurnRef, "turn:publish");

  const invalid = clone(canonicalFixture);
  invalid.turns[0].status = "waiting";
  invalid.turns[0].waitingConditions = [];
  assert.equal(validate(invalid), false);
  assert.match(errors(), /must NOT have fewer than 1 items/);

  invalid.turns[0].waitingConditions = [{
    conditionId: "wait:review",
    waitingOn: "An external review",
    resumeWhen: "The review reaches a terminal state",
    timeoutAt: null,
    fallback: null,
    extensions: {},
  }];
  assert.equal(validate(invalid), true, errors());

  invalid.turns[0].endedAt = "2026-08-13T09:07:00Z";
  assert.equal(validate(invalid), false);
  assert.match(errors(), /must be null/);
});

test("AI-authored moves remain proposals until a separate authorization receipt exists", () => {
  const move = canonicalFixture.moves[0];
  assert.equal(move.proposedBy.role, "ai");
  assert.equal(move.authorizationState, "granted");
  assert.ok(move.authorizationReceiptRefs.length > 0);

  const invalid = clone(canonicalFixture);
  invalid.moves[0].authorizationReceiptRefs = [];
  assert.equal(validate(invalid), false);
  assert.match(errors(), /must NOT have fewer than 1 items/);

  const deniedControl = clone(canonicalFixture);
  deniedControl.moves[0].control.authority.state = "denied";
  assert.equal(validate(deniedControl), false);
  assert.match(errors(), /must be equal to constant/);

  const deniedTarget = clone(canonicalFixture);
  deniedTarget.yawns[0].target.control.authority.state = "denied";
  assert.equal(validate(deniedTarget), false);
  assert.match(errors(), /must be equal to constant/);

  const publicWithoutConsent = clone(canonicalFixture);
  publicWithoutConsent.yawns[0].control.privacy.consentRefs = [];
  assert.equal(validate(publicWithoutConsent), false);
  assert.match(errors(), /must NOT have fewer than 1 items/);
});

test("privacy and authority are explicit hard gates before candidate ranking", () => {
  const statements = canonicalFixture.arenas.flatMap((arena) => arena.field.availableStatements);
  assert.ok(statements.every((statement) => statement.control.privacy.ownerRefs.length > 0));
  assert.equal(canonicalFixture.yawns[0].target.control.authority.state, "granted");

  const held = clone(canonicalFixture);
  const proposal = held.routingProposals[0];
  proposal.gates.privacy = "unknown";
  proposal.resolution = "hold";
  proposal.candidateScores = [];
  assert.equal(validate(held), true, errors());

  proposal.resolution = "create_child";
  assert.equal(validate(held), false);
  assert.match(errors(), /must be equal to constant/);

  const failedProof = clone(canonicalFixture);
  failedProof.routingProposals[0].gates.proofPreservation = "failed";
  failedProof.routingProposals[0].resolution = "create_child";
  assert.equal(validate(failedProof), false);
  assert.match(errors(), /must be equal to constant/);
});

test("routing keeps orientation coverage, claim confidence, and routing confidence separate", () => {
  const proposal = canonicalFixture.routingProposals[0];
  assert.notEqual(proposal.orientationCoverage, proposal.claimConfidence);
  assert.notEqual(proposal.claimConfidence, proposal.routingConfidence);
  assert.equal(schema.$defs.RoutingProposal.properties.decisionStatus.const, "proposed");
  assert.match(schema.$defs.CandidateScore.properties.semanticSimilarity.description, /never decide identity/);
});

test("events carry append-only sequence and causal continuity fields", () => {
  const [first, second] = canonicalFixture.events;
  assert.equal(first.sequence, 0);
  assert.equal(first.previousEventRef, null);
  assert.equal(second.sequence, 1);
  assert.equal(second.previousEventRef, first.eventId);
  assert.match(schema.$defs.Event.$comment, /immutability after append/);

  const deniedControl = clone(canonicalFixture);
  deniedControl.events[0].control.authority.state = "denied";
  assert.equal(validate(deniedControl), false);
  assert.match(errors(), /must be equal to constant/);

  const invalidTime = clone(canonicalFixture);
  invalidTime.events[0].occurredAt = "not-a-timestamp";
  assert.equal(validate(invalidTime), false);
  assert.match(errors(), /must match pattern/);
});

test("moves, events, transitions, and proof receipts remain distinct records", () => {
  const move = canonicalFixture.moves[0];
  const event = canonicalFixture.events.find((candidate) => candidate.eventId === "event:review-requested");
  const transition = canonicalFixture.transitions[0];
  const proof = canonicalFixture.proofReceipts[0];
  assert.equal(event.causedBy[0].ref, move.turnRef);
  assert.ok(transition.attemptedByMoveRefs.includes(move.moveId));
  assert.equal(transition.eventRefs.length, 0);
  assert.ok(transition.proofReceiptRefs.includes(proof.proofReceiptId));
  assert.equal(transition.outcomeStatus, "pending");
  assert.equal(proof.status, "waiting");
});

test("structural changes require a human-authorized receipt with an event", () => {
  const receipt = canonicalFixture.structuralChangeReceipts[0];
  assert.equal(receipt.authorizationStatus, "authorized");
  assert.equal(receipt.authorizedByRole, "human");
  assert.ok(receipt.eventRefs.length > 0);

  const invalid = clone(canonicalFixture);
  invalid.structuralChangeReceipts[0].authorizedByRole = "ai";
  assert.equal(validate(invalid), false);
  assert.match(errors(), /must be equal to constant/);

  const deniedControl = clone(canonicalFixture);
  deniedControl.structuralChangeReceipts[0].control.authority.state = "denied";
  assert.equal(validate(deniedControl), false);
  assert.match(errors(), /must be equal to constant/);

  const emptyCreate = clone(canonicalFixture);
  emptyCreate.structuralChangeReceipts[0].createdYawnRefs = [];
  assert.equal(validate(emptyCreate), false);
  assert.match(errors(), /must NOT have fewer than 1 items/);

  const emptyReparent = clone(canonicalFixture);
  emptyReparent.structuralChangeReceipts[0].operation = "reparent";
  emptyReparent.structuralChangeReceipts[0].createdYawnRefs = [];
  emptyReparent.structuralChangeReceipts[0].affectedYawnRefs = [];
  assert.equal(validate(emptyReparent), false);
  assert.match(errors(), /must NOT have fewer than 1 items/);
});

test("merge and split receipts preserve identity, provenance, and proof continuity", () => {
  const base = canonicalFixture.structuralChangeReceipts[0];
  const merge = {
    ...clone(base),
    structuralChangeReceiptId: "receipt:merge:duplicates",
    operation: "merge",
    affectedYawnRefs: ["yawn:duplicate:a", "yawn:duplicate:b"],
    createdYawnRefs: [],
    retainedYawnRefs: ["yawn:duplicate:a"],
    supersededYawnRefs: ["yawn:duplicate:b"],
    aliasMap: { "yawn:duplicate:b": "yawn:duplicate:a" },
    provenanceRefs: ["source:duplicate:a", "source:duplicate:b"],
    proofContinuityRefs: ["proof:duplicate:combined"],
  };
  const split = {
    ...clone(base),
    structuralChangeReceiptId: "receipt:split:compound",
    operation: "split",
    affectedYawnRefs: ["yawn:compound"],
    createdYawnRefs: ["yawn:compound:a", "yawn:compound:b"],
    retainedYawnRefs: [],
    supersededYawnRefs: ["yawn:compound"],
    provenanceRefs: ["source:compound"],
    proofContinuityRefs: ["proof:compound:a", "proof:compound:b"],
  };
  const fixture = clone(canonicalFixture);
  fixture.structuralChangeReceipts.push(merge, split);
  assert.equal(validate(fixture), true, errors());

  fixture.structuralChangeReceipts.at(-1).createdYawnRefs = ["yawn:compound:a"];
  assert.equal(validate(fixture), false);
  assert.match(errors(), /must NOT have fewer than 2 items/);
});

test("unknown core fields are rejected while namespaced extensions are accepted", () => {
  const extensible = clone(canonicalFixture);
  extensible.extensions["org.example.protocol/receipt"] = { version: 1 };
  assert.equal(validate(extensible), true, errors());

  extensible.extensions["not_namespaced"] = true;
  assert.equal(validate(extensible), false);
  assert.match(errors(), /property name must be valid/);

  const unknownCore = clone(canonicalFixture);
  unknownCore.arenas[0].world = { complete: true };
  assert.equal(validate(unknownCore), false);
  assert.match(errors(), /additional properties/);
});

test("semantic validation rejects cycles, unresolved references, and broken event chains", () => {
  const cyclic = clone(canonicalFixture);
  cyclic.yawns[0].primaryParentYawnRef = "yawn:verify-live-hub";
  assert.match(validateAgencyHolarchySemantics(cyclic).join("\n"), /cycle/);

  const unresolved = clone(canonicalFixture);
  unresolved.turns[0].eventRefs.push("event:missing");
  assert.match(validateAgencyHolarchySemantics(unresolved).join("\n"), /unresolved event:missing/);

  const brokenStream = clone(canonicalFixture);
  brokenStream.events[1].previousEventRef = null;
  assert.match(validateAgencyHolarchySemantics(brokenStream).join("\n"), /previousEventRef must be/);
});
