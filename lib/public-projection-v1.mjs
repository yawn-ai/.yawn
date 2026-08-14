import { createHash } from "node:crypto";

const SNAPSHOT_FIELDS = [
  "canonical_ref",
  "coordinate",
  "visibility",
  "current_yawn",
  "observations",
  "relationship_offer",
  "sources",
  "redactions",
];

const FORBIDDEN_SOURCE_KEYS = new Set([
  "body",
  "content",
  "message",
  "messages",
  "prompt",
  "response",
  "text",
  "transcript",
]);

export function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }

  return value;
}

export function publicSnapshotPayload(projection) {
  return Object.fromEntries(
    SNAPSHOT_FIELDS.map((field) => [field, projection[field]]),
  );
}

export function hashPublicSnapshot(projection) {
  const canonicalJson = JSON.stringify(
    canonicalize(publicSnapshotPayload(projection)),
  );
  return `sha256:${createHash("sha256").update(canonicalJson).digest("hex")}`;
}

function assertUniqueIds(records, label) {
  const ids = records.map((record) => record.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label} IDs must be unique.`);
  }
  return new Set(ids);
}

function assertObservationTarget(projection, observation, ids) {
  const target = observation.observes;
  const validByKind = {
    yawn: target.id === projection.current_yawn.id,
    observation: ids.observations.has(target.id),
    relationship: target.id === projection.relationship_offer.id,
    projection: target.id === projection.projection_id,
    source: ids.sources.has(target.id),
    proof_receipt: ids.sources.has(target.id),
  };

  if (!validByKind[target.kind]) {
    throw new Error(
      `Observation ${observation.id} has unresolved ${target.kind} target ${target.id}.`,
    );
  }
}

export function assertPublicProjectionSemantics(projection) {
  const ids = {
    observations: assertUniqueIds(projection.observations, "Observation"),
    sources: assertUniqueIds(projection.sources, "Source"),
    nodes: assertUniqueIds(projection.spiral.nodes, "Spiral node"),
    edges: assertUniqueIds(projection.spiral.edges, "Spiral edge"),
  };

  for (const source of projection.sources) {
    for (const key of Object.keys(source)) {
      if (FORBIDDEN_SOURCE_KEYS.has(key.toLowerCase())) {
        throw new Error(`Public source ${source.id} contains forbidden body key ${key}.`);
      }
    }
  }

  const sourceRefs = new Set(projection.current_yawn.source_refs);
  for (const observation of projection.observations) {
    assertObservationTarget(projection, observation, ids);
    for (const sourceId of observation.source_refs) {
      sourceRefs.add(sourceId);
    }
  }
  for (const sourceId of sourceRefs) {
    if (!ids.sources.has(sourceId)) {
      throw new Error(`Source reference ${sourceId} does not resolve.`);
    }
  }

  if (projection.relationship_offer.state !== "offered") {
    throw new Error("A public relationship must remain in the offered state.");
  }

  const activeNodes = projection.spiral.nodes.filter(
    (node) => node.role === "active",
  );
  if (activeNodes.length !== 1 || activeNodes[0].id !== projection.spiral.center_id) {
    throw new Error("The spiral must have exactly one active center node.");
  }
  if (activeNodes[0].canonical_ref !== projection.current_yawn.id) {
    throw new Error("The spiral center must resolve to the current Yawn.");
  }

  for (const edge of projection.spiral.edges) {
    if (!ids.nodes.has(edge.source) || !ids.nodes.has(edge.target)) {
      throw new Error(`Spiral edge ${edge.id} has an unresolved endpoint.`);
    }
  }

  const expectedHash = hashPublicSnapshot(projection);
  if (projection.snapshot_hash !== expectedHash) {
    throw new Error(
      `Snapshot hash mismatch: expected ${expectedHash}, received ${projection.snapshot_hash}.`,
    );
  }

  return true;
}
