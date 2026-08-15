import { createHash } from "node:crypto";

const SNAPSHOT_FIELDS = [
  "canonical_ref",
  "coordinate",
  "visibility",
  "current_yawn",
  "observations",
  "statements",
  "intentions",
  "projections",
  "consequences",
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

export function publicSnapshotPayload(view) {
  return Object.fromEntries(SNAPSHOT_FIELDS.map((field) => [field, view[field]]));
}

export function hashPublicSnapshot(view) {
  const canonicalJson = JSON.stringify(canonicalize(publicSnapshotPayload(view)));
  return `sha256:${createHash("sha256").update(canonicalJson).digest("hex")}`;
}

function assertUniqueIds(records, label) {
  const ids = records.map((record) => record.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label} IDs must be unique.`);
  }
  return new Set(ids);
}

function assertSourceRefs(ids, sourceRefs, context) {
  for (const sourceId of sourceRefs) {
    if (!ids.sources.has(sourceId)) {
      throw new Error(`${context} has unresolved source reference ${sourceId}.`);
    }
  }
}

function assertActorRef(actorIds, actorId, context) {
  if (!actorIds.has(actorId)) {
    throw new Error(`${context} has unresolved actor reference ${actorId}.`);
  }
}

function assertTypedRef(view, ref, ids, context) {
  const validByKind = {
    yawn: ref.id === view.current_yawn.id,
    observation: ids.observations.has(ref.id),
    statement: ids.statements.has(ref.id),
    relationship: ref.id === view.relationship_offer.id,
    intention: ids.intentions.has(ref.id),
    projection: ids.projections.has(ref.id),
    consequence: ids.consequences.has(ref.id),
    view: ref.id === view.view_id,
    source: ids.sources.has(ref.id),
    proof_receipt: ids.sources.has(ref.id),
  };

  if (!validByKind[ref.kind]) {
    throw new Error(`${context} has unresolved ${ref.kind} target ${ref.id}.`);
  }
}

export function assertPublicViewSemantics(view) {
  const ids = {
    observations: assertUniqueIds(view.observations, "Observation"),
    statements: assertUniqueIds(view.statements, "Statement"),
    intentions: assertUniqueIds(view.intentions, "Intention"),
    projections: assertUniqueIds(view.projections, "Projection"),
    consequences: assertUniqueIds(view.consequences, "Consequence"),
    sources: assertUniqueIds(view.sources, "Source"),
    nodes: assertUniqueIds(view.spiral.nodes, "Spiral node"),
    edges: assertUniqueIds(view.spiral.edges, "Spiral edge"),
  };

  const semanticIds = [
    ...ids.observations,
    ...ids.statements,
    ...ids.intentions,
    ...ids.projections,
    ...ids.consequences,
    ...ids.sources,
  ];
  if (new Set(semanticIds).size !== semanticIds.length) {
    throw new Error("Public semantic record IDs must be globally unique.");
  }

  const actorIds = new Set([
    view.observer.id,
    view.interface.bot_overlay.agent_id,
    ...view.spiral.nodes
      .filter((node) => node.role === "agent")
      .map((node) => node.canonical_ref),
  ]);

  for (const source of view.sources) {
    assertActorRef(actorIds, source.asserted_by, `Source ${source.id}`);
    for (const key of Object.keys(source)) {
      if (FORBIDDEN_SOURCE_KEYS.has(key.toLowerCase())) {
        throw new Error(`Public source ${source.id} contains forbidden body key ${key}.`);
      }
    }
  }

  const allSourceRefs = new Set(view.current_yawn.source_refs);
  for (const observation of view.observations) {
    const context = `Observation ${observation.id}`;
    assertActorRef(actorIds, observation.observer_id, context);
    for (const ref of observation.observes) {
      assertTypedRef(view, ref, ids, context);
    }
    for (const sourceId of observation.source_refs) {
      allSourceRefs.add(sourceId);
    }
  }

  for (const statement of view.statements) {
    const context = `Statement ${statement.id}`;
    assertActorRef(actorIds, statement.asserted_by, context);
    for (const ref of statement.about) {
      assertTypedRef(view, ref, ids, context);
    }
    for (const observationId of statement.grounded_in_observation_refs) {
      if (!ids.observations.has(observationId)) {
        throw new Error(`${context} has unresolved Observation ${observationId}.`);
      }
    }
    for (const sourceId of statement.source_refs) {
      allSourceRefs.add(sourceId);
    }
  }

  for (const intention of view.intentions) {
    const context = `Intention ${intention.id}`;
    assertActorRef(actorIds, intention.held_by, context);
    for (const statementId of intention.statement_refs) {
      if (!ids.statements.has(statementId)) {
        throw new Error(`${context} has unresolved Statement ${statementId}.`);
      }
    }
  }

  for (const projection of view.projections) {
    const context = `Projection ${projection.id}`;
    assertActorRef(actorIds, projection.projected_by, context);
    if (projection.intention_id !== null && !ids.intentions.has(projection.intention_id)) {
      throw new Error(`${context} has unresolved Intention ${projection.intention_id}.`);
    }
    for (const statementId of projection.statement_refs) {
      if (!ids.statements.has(statementId)) {
        throw new Error(`${context} has unresolved Statement ${statementId}.`);
      }
    }
    for (const sourceId of projection.source_refs) {
      allSourceRefs.add(sourceId);
    }
    if (projection.kind === "move" && projection.move_id === null) {
      throw new Error(`${context} is a Move Projection without a move_id.`);
    }
    if (projection.kind !== "move" && projection.move_id !== null) {
      throw new Error(`${context} is not a Move and cannot carry a move_id.`);
    }
  }

  for (const consequence of view.consequences) {
    const context = `Consequence ${consequence.id}`;
    assertActorRef(actorIds, consequence.recorded_by, context);
    for (const projectionId of consequence.projection_ids) {
      if (!ids.projections.has(projectionId)) {
        throw new Error(`${context} has unresolved Projection ${projectionId}.`);
      }
    }
    for (const statementId of consequence.statement_refs) {
      if (!ids.statements.has(statementId)) {
        throw new Error(`${context} has unresolved Statement ${statementId}.`);
      }
    }
  }

  assertSourceRefs(ids, allSourceRefs, "Public View");

  if (view.relationship_offer.state !== "offered") {
    throw new Error("A public relationship must remain in the offered state.");
  }

  const activeNodes = view.spiral.nodes.filter((node) => node.role === "active");
  if (activeNodes.length !== 1 || activeNodes[0].id !== view.spiral.center_id) {
    throw new Error("The spiral must have exactly one active center node.");
  }
  if (activeNodes[0].canonical_ref !== view.current_yawn.id) {
    throw new Error("The spiral center must resolve to the current Yawn.");
  }

  for (const edge of view.spiral.edges) {
    if (!ids.nodes.has(edge.source) || !ids.nodes.has(edge.target)) {
      throw new Error(`Spiral edge ${edge.id} has an unresolved endpoint.`);
    }
  }

  const expectedHash = hashPublicSnapshot(view);
  if (view.snapshot_hash !== expectedHash) {
    throw new Error(
      `Snapshot hash mismatch: expected ${expectedHash}, received ${view.snapshot_hash}.`,
    );
  }

  return true;
}
