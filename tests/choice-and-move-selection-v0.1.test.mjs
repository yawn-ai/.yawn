import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createChoiceEvent,
  hashMoveSelectionReceipt,
  scoreMoveCandidate,
  selectMoveProposal,
} from "../lib/choice-and-move-selection-v0.1.mjs";

const fixture = JSON.parse(await readFile(new URL("../fixtures/choice-and-move-selection.v0.1.json", import.meta.url), "utf8"));

function compileFixture(overrides = {}) {
  const source = structuredClone(fixture.moveSelectionReceipt);
  return selectMoveProposal({
    receiptId: source.receiptId,
    revision: source.revision,
    orientationMapRef: source.orientationMapRef,
    principalRef: source.principalRef,
    relationshipRef: source.relationshipRef,
    arenaRef: source.arenaRef,
    sourceRefs: source.sourceRefs,
    gateAssessments: source.gateAssessments,
    candidates: source.candidates,
    createdAt: source.createdAt,
    ...overrides,
  });
}

test("ranks a reversible, proofable clarification above premature materialization", () => {
  const receipt = compileFixture();
  assert.equal(receipt.outcome.kind, "proposal");
  assert.equal(receipt.outcome.selectedCandidateId, "move-candidate:confirm-parent-purpose");
  assert.equal(receipt.choiceRequired, true);
  assert.equal(receipt.authorizationRequired, true);
  assert.equal(receipt.canonicalState, false);
  assert.equal(receipt.epistemicStatus, "inferred");
  assert.match(receipt.outcome.whySelected, /recommendation, not a choice or authorization/i);
});

test("holds when any material gate remains active or unknown", () => {
  const gates = structuredClone(fixture.moveSelectionReceipt.gateAssessments);
  gates.authorityOrConsent.status = "unknown";
  gates.authorityOrConsent.epistemicStatus = "unknown";
  gates.authorityOrConsent.confidence = 0;
  gates.authorityOrConsent.reason = "The rightful principal has not been resolved.";

  const receipt = compileFixture({ gateAssessments: gates });
  assert.equal(receipt.outcome.kind, "hold");
  assert.equal(receipt.outcome.hold.reason, "live_or_unknown_hard_gate");
  assert.equal(receipt.outcome.selectedCandidateId, null);
});

test("holds when every candidate is blocked or outside an authority path", () => {
  const candidates = structuredClone(fixture.moveSelectionReceipt.candidates).map((candidate) => ({
    ...candidate,
    authorityStatus: "blocked",
    gateStatus: "blocked",
    blockedBy: ["authorityOrConsent"],
  }));
  const receipt = compileFixture({ candidates });
  assert.equal(receipt.outcome.kind, "hold");
  assert.equal(receipt.outcome.hold.reason, "no_eligible_candidate");
});

test("scoring is deterministic and bounded", () => {
  const candidate = fixture.moveSelectionReceipt.candidates[0];
  assert.equal(scoreMoveCandidate(candidate), 0.8534);
  assert.throws(
    () => scoreMoveCandidate({ ...candidate, scoreInputs: { ...candidate.scoreInputs, risk: 2 } }),
    /score_out_of_bounds:risk/,
  );
});

test("a rightful choice records authorship without granting authority", () => {
  const receipt = compileFixture();
  const choice = createChoiceEvent({
    choiceEventId: "choice:test-selection",
    revision: 1,
    principalRef: fixture.choiceEvent.principalRef,
    moveSelectionReceipt: receipt,
    decision: {
      kind: "selected",
      selectedCandidateId: receipt.outcome.selectedCandidateId,
      rationale: "This resolves the placement lacuna with the smallest reversible commitment.",
    },
    sourceRefs: fixture.choiceEvent.sourceRefs,
    canonicalState: false,
    createdAt: "2026-09-01T17:00:00Z",
  });

  assert.equal(choice.decision.epistemicStatus, "reported");
  assert.equal(choice.authorization.grantedByThisEvent, false);
  assert.equal(choice.authorization.effectAuthorized, false);
  assert.equal(choice.authorization.resolutionStatus, "not_resolved");
  assert.equal(choice.authorization.authorityRef, null);
  assert.match(choice.moveSelectionReceiptRef.stateSha256, /^[a-f0-9]{64}$/);
  assert.equal(choice.moveSelectionReceiptRef.stateSha256, hashMoveSelectionReceipt(receipt));
});

test("choice cannot select a candidate absent from the exact receipt", () => {
  const receipt = compileFixture();
  assert.throws(
    () => createChoiceEvent({
      choiceEventId: "choice:illegal-selection",
      revision: 1,
      principalRef: fixture.choiceEvent.principalRef,
      moveSelectionReceipt: receipt,
      decision: {
        kind: "selected",
        selectedCandidateId: "move-candidate:not-in-receipt",
        rationale: "Attempted stale or injected choice.",
      },
      sourceRefs: fixture.choiceEvent.sourceRefs,
      canonicalState: false,
      createdAt: "2026-09-01T17:00:00Z",
    }),
    /selected_candidate_not_in_receipt/,
  );
});

test("hold and rejection events cannot smuggle a selected candidate", () => {
  const receipt = compileFixture();
  assert.throws(
    () => createChoiceEvent({
      choiceEventId: "choice:illegal-hold",
      revision: 1,
      principalRef: fixture.choiceEvent.principalRef,
      moveSelectionReceipt: receipt,
      decision: {
        kind: "held",
        selectedCandidateId: receipt.outcome.selectedCandidateId,
        rationale: "Hold should not select.",
      },
      sourceRefs: fixture.choiceEvent.sourceRefs,
      canonicalState: false,
      createdAt: "2026-09-01T17:00:00Z",
    }),
    /non_selected_choice_must_not_name_candidate/,
  );
});
