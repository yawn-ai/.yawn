import { canonicalJson, hashCanonical } from "./state-substrate-v1.mjs";

export const OBSERVATION_SCHEMA_VERSION = "yawn.observation-state.v1";
export const RECORD_EVENT_SCHEMA_VERSION = "yawn.record-event.v1";

const allowedStatuses = new Set(["accepted", "superseded"]);
const allowedEpistemicStatuses = new Set(["observed", "reported", "inferred", "assumed", "predicted", "disputed", "unknown"]);
const sourceStatementStatuses = new Set(["observed", "reported", "disputed", "unknown"]);
const inferenceStatementStatuses = new Set(["inferred", "assumed", "predicted", "disputed", "unknown"]);
const sha256Pattern = /^[a-f0-9]{64}$/;
const extensionKeyPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$/;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeStringArray(values, name) {
  assert(Array.isArray(values), `${name}_required`);
  for (const value of values) assert(typeof value === "string" && value.length > 0, `${name}_invalid`);
  return [...values];
}

function normalizeUniqueRefs(values, name) {
  const normalized = normalizeStringArray(values, name);
  assert(new Set(normalized).size === normalized.length, `${name}_duplicate`);
  return normalized.sort();
}

function normalizeSourceSpans(values) {
  assert(Array.isArray(values) && values.length > 0, "observation_source_span_required");
  return values.map((span) => {
    assert(span && typeof span === "object", "observation_source_span_invalid");
    assert(typeof span.sourceRef === "string" && span.sourceRef.length > 0, "observation_source_ref_required");
    assert(sha256Pattern.test(span.sourceSha256), "observation_source_hash_invalid");
    assert(Number.isInteger(span.startCharacter) && span.startCharacter >= 0, "observation_source_start_invalid");
    assert(Number.isInteger(span.endCharacter) && span.endCharacter >= span.startCharacter, "observation_source_end_invalid");
    assert(span.coordinate && typeof span.coordinate === "object" && !Array.isArray(span.coordinate), "observation_source_coordinate_invalid");
    return { ...span, coordinate: { ...span.coordinate } };
  });
}

function normalizeStatements(values, allowed, spanCount, name) {
  assert(Array.isArray(values), `${name}_required`);
  return values.map((statement) => {
    assert(statement && typeof statement === "object", `${name}_invalid`);
    assert(typeof statement.text === "string" && statement.text.length > 0, `${name}_text_required`);
    assert(typeof statement.assertedBy === "string" && statement.assertedBy.length > 0, `${name}_actor_required`);
    assert(allowed.has(statement.epistemicStatus), `${name}_epistemic_status_invalid`);
    assert(typeof statement.confidence === "number" && statement.confidence >= 0 && statement.confidence <= 1, `${name}_confidence_invalid`);
    assert(Array.isArray(statement.sourceSpanIndexes), `${name}_source_indexes_required`);
    assert(new Set(statement.sourceSpanIndexes).size === statement.sourceSpanIndexes.length, `${name}_source_indexes_duplicate`);
    for (const index of statement.sourceSpanIndexes) {
      assert(Number.isInteger(index) && index >= 0 && index < spanCount, `${name}_source_index_invalid`);
    }
    return { ...statement, sourceSpanIndexes: [...statement.sourceSpanIndexes] };
  });
}

export function normalizeObservationState(input) {
  assert(input?.schemaVersion === OBSERVATION_SCHEMA_VERSION, "invalid_observation_schema");
  assert(typeof input.observationId === "string" && input.observationId.length > 0, "observation_id_required");
  assert(typeof input.observerRef === "string" && input.observerRef.length > 0, "observer_ref_required");
  assert(typeof input.agentSpaceRef === "string" && input.agentSpaceRef.length > 0, "agent_space_ref_required");
  assert(typeof input.whatBecameAvailable === "string" && input.whatBecameAvailable.trim().length > 0, "observation_text_required");
  assert(Number.isInteger(input.revision) && input.revision >= 1, "observation_revision_invalid");
  assert(allowedStatuses.has(input.status), "observation_status_invalid");
  assert(allowedEpistemicStatuses.has(input.epistemicStatus), "observation_epistemic_status_invalid");
  assert(typeof input.confidence === "number" && input.confidence >= 0 && input.confidence <= 1, "observation_confidence_invalid");
  const sourceSpans = normalizeSourceSpans(input.sourceSpans);
  assert(input.extensions && typeof input.extensions === "object" && !Array.isArray(input.extensions), "observation_extensions_invalid");
  for (const key of Object.keys(input.extensions)) assert(extensionKeyPattern.test(key), "observation_extension_key_invalid");
  if (input.previousStateSha256 !== null && input.previousStateSha256 !== undefined) {
    assert(sha256Pattern.test(input.previousStateSha256), "observation_previous_hash_invalid");
  }

  return {
    schemaVersion: OBSERVATION_SCHEMA_VERSION,
    observationId: input.observationId,
    observerRef: input.observerRef,
    agentSpaceRef: input.agentSpaceRef,
    arenaRef: input.arenaRef ?? null,
    observedYawnRefs: normalizeUniqueRefs(input.observedYawnRefs, "observed_yawn_refs"),
    sourceSpans,
    whatBecameAvailable: input.whatBecameAvailable,
    observerAdded: normalizeStatements(input.observerAdded, sourceStatementStatuses, sourceSpans.length, "observer_added"),
    inferences: normalizeStatements(input.inferences, inferenceStatementStatuses, sourceSpans.length, "inference"),
    conditions: normalizeStringArray(input.conditions, "conditions"),
    limits: normalizeStringArray(input.limits, "limits"),
    remainsOpen: normalizeStringArray(input.remainsOpen, "remains_open"),
    proofRefs: normalizeUniqueRefs(input.proofRefs, "proof_refs"),
    epistemicStatus: input.epistemicStatus,
    confidence: input.confidence,
    status: input.status,
    revision: input.revision,
    observedAt: input.observedAt ?? null,
    recordedAt: input.recordedAt,
    updatedAt: input.updatedAt,
    previousStateSha256: input.previousStateSha256 ?? null,
    extensions: input.extensions ?? {},
  };
}

export function observationStateSha256(state) {
  return hashCanonical(normalizeObservationState(state)).replace(/^sha256:/, "");
}

export function createObservationEvent({ eventId, actorRef, occurredAt, state, previousStateSha256 = null }) {
  const normalized = normalizeObservationState(state);
  assert(normalized.previousStateSha256 === previousStateSha256, "observation_previous_hash_conflict");
  const resultingStateSha256 = observationStateSha256(normalized);
  return {
    schemaVersion: RECORD_EVENT_SCHEMA_VERSION,
    eventId,
    subjectRef: { kind: "observation", id: normalized.observationId },
    revision: normalized.revision,
    eventType: normalized.revision === 1 ? "observation.accepted" : "observation.revised",
    actorRef,
    authorityStatus: "authorized",
    payload: { resultingState: normalized },
    previousStateSha256,
    resultingStateSha256,
    occurredAt,
  };
}

export function reduceObservationEvents(events) {
  const ordered = events
    .filter((event) => event.authorityStatus === "authorized")
    .sort((left, right) => left.revision - right.revision || left.eventId.localeCompare(right.eventId));
  let expectedRevision = 1;
  let expectedPrevious = null;
  let state = null;

  for (const event of ordered) {
    assert(event.schemaVersion === RECORD_EVENT_SCHEMA_VERSION, "invalid_record_event_schema");
    assert(event.subjectRef?.kind === "observation", "event_subject_not_observation");
    assert(event.revision === expectedRevision, "observation_revision_gap");
    assert(event.previousStateSha256 === expectedPrevious, "observation_previous_hash_mismatch");
    const next = normalizeObservationState(event.payload?.resultingState);
    assert(next.observationId === event.subjectRef.id, "observation_subject_mismatch");
    assert(next.revision === event.revision, "observation_state_revision_mismatch");
    assert(observationStateSha256(next) === event.resultingStateSha256, "observation_resulting_hash_mismatch");
    state = next;
    expectedPrevious = event.resultingStateSha256;
    expectedRevision += 1;
  }

  return state ? { state, stateSha256: expectedPrevious, revision: state.revision } : null;
}

export function serializeObservationYawn(state, { preferenceHash = null } = {}) {
  const normalized = normalizeObservationState(state);
  assert(preferenceHash === null || sha256Pattern.test(preferenceHash), "observation_preference_hash_invalid");
  const envelope = {
    kind: "observation",
    schemaVersion: OBSERVATION_SCHEMA_VERSION,
    stateSha256: observationStateSha256(normalized),
    preferenceHash,
    state: normalized,
  };
  return `${canonicalJson(envelope)}\n`;
}

export function parseObservationYawn(bytes) {
  const envelope = JSON.parse(bytes);
  assert(envelope?.kind === "observation", "observation_yawn_kind_invalid");
  assert(envelope.schemaVersion === OBSERVATION_SCHEMA_VERSION, "observation_yawn_schema_invalid");
  assert(sha256Pattern.test(envelope.stateSha256), "observation_yawn_hash_invalid");
  assert(envelope.preferenceHash === null || sha256Pattern.test(envelope.preferenceHash), "observation_preference_hash_invalid");
  const state = normalizeObservationState(envelope.state);
  assert(envelope.stateSha256 === observationStateSha256(state), "observation_yawn_hash_mismatch");
  return { ...envelope, state };
}
