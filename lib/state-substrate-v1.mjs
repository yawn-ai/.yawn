import { createHash } from "node:crypto";

const EMPTY_HASH = `sha256:${"0".repeat(64)}`;

function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortValue(value[key])]),
    );
  }

  return value;
}
export function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

export function hashCanonical(value) {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))].sort();
}

function sourceRefsFromLegacy(record) {
  const explicit = record?.source?.source_refs;
  if (Array.isArray(explicit) && explicit.length > 0) {
    return uniqueSorted(explicit);
  }

  const origin = record?.source?.origin;
  return [typeof origin === "string" && origin.length > 0 ? `legacy:${origin}` : "legacy:unattributed"];
}

function observerRefFromLegacy(record) {
  return typeof record?.observer?.name === "string" && record.observer.name.length > 0
    ? record.observer.name
    : "principal:unknown";
}

function asText(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function normalizeLegacyYawn(record, { rootId = "legacy:yawn" } = {}) {
  const sourceRefs = sourceRefsFromLegacy(record);
  const attributedTo = observerRefFromLegacy(record);
  const current = asText(record?.frame?.current ?? record?.currentState ?? record?.current_value);
  const possible = asText(record?.frame?.possible ?? record?.desiredState ?? record?.desired_value);
  const possibleKind = asText(record?.frame?.possible_kind) ?? "unknown";
  const snapshots = [];
  const desires = [];
  const targets = [];

  if (current) {
    snapshots.push({
      schemaVersion: 1,
      snapshotId: `${rootId}:snapshot:current`,
      scopeRef: rootId,
      description: current,
      attributedTo,
      modalRole: "actual",
      motivationalRole: "neutral",
      epistemicStatus: "reported",
      sourceRefs,
    });
  }

  if (possible) {
    if (possibleKind === "desired" || record?.desiredState || record?.desired_value) {
      const desireId = `${rootId}:desire:legacy-possible`;
      desires.push({
        schemaVersion: 1,
        desireId,
        principalRef: attributedTo,
        description: possible,
        sourceRefs,
        authorityStatus: "self_reported",
        visibility: "private",
      });
      targets.push({
        schemaVersion: 1,
        targetId: `${rootId}:target:legacy-possible`,
        mode: "attain",
        description: possible,
        proposedBy: attributedTo,
        sourceRefs,
        affectedPrincipals: [attributedTo],
        ratificationStatus: "proposed",
        sufficientWhen: ["The affected principal explicitly ratifies a proof-bounded condition."],
        boundaryRefs: [`${rootId}:boundary:legacy-review`],
        desireRef: desireId,
      });
    } else {
      snapshots.push({
        schemaVersion: 1,
        snapshotId: `${rootId}:snapshot:possible`,
        scopeRef: rootId,
        description: possible,
        attributedTo,
        modalRole: "possible",
        motivationalRole: possibleKind === "feared" ? "feared" : "neutral",
        epistemicStatus: possibleKind === "unproven" ? "unproven" : "inferred",
        sourceRefs,
      });
    }
  }

  const legacyDesired = [
    ...(Array.isArray(record?.measurement?.desired) ? record.measurement.desired : []),
    ...(Array.isArray(record?.orientation_stack?.desires) ? record.orientation_stack.desires : []),
    ...(Array.isArray(record?.projection_stack?.desires) ? record.projection_stack.desires : []),
  ];

  for (const [index, descriptionValue] of legacyDesired.entries()) {
    const description = asText(descriptionValue);
    if (!description || desires.some((desire) => desire.description === description)) continue;
    desires.push({
      schemaVersion: 1,
      desireId: `${rootId}:desire:legacy-${index + 1}`,
      principalRef: attributedTo,
      description,
      sourceRefs,
      authorityStatus: "self_reported",
      visibility: "private",
    });
  }

  return {
    schemaVersion: 1,
    rootId,
    sourceRefs,
    snapshots,
    desires,
    targets,
    aliasesRead: uniqueSorted(
      [
        current && (record?.frame?.current !== undefined ? "frame.current" : record?.currentState !== undefined ? "currentState" : "current_value"),
        possible && (record?.frame?.possible !== undefined ? "frame.possible" : record?.desiredState !== undefined ? "desiredState" : "desired_value"),
      ].filter(Boolean),
    ),
  };
}

function emptyAggregate(rootId) {
  return {
    schemaVersion: 1,
    materializedStateId: `${rootId}:materialized`,
    rootId,
    asOfEventCursor: 0,
    lifecycleStatus: "active",
    loopStatus: "dormant",
    axisResolutionStatus: "potential",
    sourceCoverage: [],
    currentSnapshotRefs: [],
    acceptedClaimRefs: [],
    commitmentRefs: [],
    permissionRefs: [],
    unknowns: [],
  };
}

function applyAuthorizedEvent(state, event) {
  const payload = event.payload ?? {};
  const next = { ...state, asOfEventCursor: Math.max(state.asOfEventCursor, event.eventCursor) };

  switch (payload.operation) {
    case "add_source":
      next.sourceCoverage = uniqueSorted([...state.sourceCoverage, payload.sourceRef]);
      break;
    case "set_snapshot":
      next.currentSnapshotRefs = uniqueSorted([payload.snapshotRef]);
      break;
    case "accept_empirical_claim":
      if ((event.evidenceRefs?.length ?? 0) > 0) {
        next.acceptedClaimRefs = uniqueSorted([...state.acceptedClaimRefs, payload.claimRef]);
      }
      break;
    case "record_commitment":
      next.commitmentRefs = uniqueSorted([...state.commitmentRefs, payload.commitmentRef]);
      break;
    case "grant_permission":
      next.permissionRefs = uniqueSorted([...state.permissionRefs, payload.permissionRef]);
      break;
    case "record_unknown":
      next.unknowns = uniqueSorted([...state.unknowns, payload.description]);
      break;
    case "set_loop_status":
      next.loopStatus = payload.loopStatus ?? state.loopStatus;
      break;
    case "set_axis_resolution_status":
      next.axisResolutionStatus = payload.axisResolutionStatus ?? state.axisResolutionStatus;
      break;
    case "apply_presentation":
      // Presentation events intentionally do not modify semantic state.
      break;
    default:
      break;
  }

  return next;
}

export function reduceAuthorizedEvents(rootId, events) {
  const ordered = [...events].sort(
    (left, right) => left.eventCursor - right.eventCursor || left.eventId.localeCompare(right.eventId),
  );

  const reduced = ordered.reduce(
    (state, event) => (event.authorityStatus === "authorized" ? applyAuthorizedEvent(state, event) : state),
    emptyAggregate(rootId),
  );

  const stateHash = hashCanonical(reduced);
  return { ...reduced, stateHash };
}

export function createStateUpdate(priorState, nextState, authorizedEventRefs) {
  const ignored = new Set(["stateHash", "asOfEventCursor"]);
  const changedPaths = Object.keys(nextState)
    .filter((key) => !ignored.has(key) && canonicalJson(priorState[key]) !== canonicalJson(nextState[key]))
    .map((key) => `/${key}`)
    .sort();

  return {
    schemaVersion: 1,
    updateId: `${nextState.rootId}:update:${nextState.asOfEventCursor}`,
    authorizedEventRefs: uniqueSorted(authorizedEventRefs),
    priorStateHash: priorState.stateHash ?? EMPTY_HASH,
    nextStateHash: nextState.stateHash,
    changedPaths,
    empiricalClaimRefs: nextState.acceptedClaimRefs,
    reducerVersion: "yawn-state-reducer.v1",
  };
}
