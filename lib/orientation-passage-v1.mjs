const COLLECTIONS = [
  ["actor", "actors", "actorId"],
  ["arena", "arenas", "arenaId"],
  ["source", "sources", "sourceId"],
  ["yawn", "yawns", "yawnId"],
  ["observation", "observations", "observationId"],
  ["statement", "statements", "statementId"],
  ["orientation", "orientations", "orientationId"],
  ["choice", "choices", "choiceId"],
  ["intention", "intentions", "intentionId"],
  ["projection", "projections", "projectionId"],
  ["move", "moves", "moveId"],
  ["consequence", "consequences", "consequenceId"],
  ["authority_grant", "authorityGrants", "grantId"],
  ["proof_receipt", "proofReceipts", "receiptId"],
];

const EXTERNAL_TYPED_REF_KINDS = new Set([
  "agent_space",
  "event",
  "goal",
  "lacuna",
  "relationship",
  "target",
  "value",
  "view",
]);

function makeRegistry(document) {
  const byKind = new Map();
  const globalIds = new Set();

  for (const [kind, collectionName, idField] of COLLECTIONS) {
    const records = document[collectionName];
    const recordsById = new Map();
    for (const record of records) {
      const id = record[idField];
      if (recordsById.has(id)) {
        throw new Error(`${collectionName} contains duplicate ID ${id}.`);
      }
      if (globalIds.has(id)) {
        throw new Error(`Protocol IDs must be globally unique within a document: ${id}.`);
      }
      recordsById.set(id, record);
      globalIds.add(id);
    }
    byKind.set(kind, recordsById);
  }

  return byKind;
}

function requireRecord(registry, kind, id, context) {
  const record = registry.get(kind)?.get(id);
  if (!record) {
    throw new Error(`${context} has unresolved ${kind} reference ${id}.`);
  }
  return record;
}

function requireTypedRef(registry, ref, context) {
  if (EXTERNAL_TYPED_REF_KINDS.has(ref.kind)) {
    return;
  }
  requireRecord(registry, ref.kind, ref.id, context);
}

function requireSourceSpans(registry, spans, context) {
  for (const span of spans) {
    const source = requireRecord(registry, "source", span.sourceRef, context);
    if (span.endCharacter < span.startCharacter) {
      throw new Error(`${context} has an inverted source span for ${span.sourceRef}.`);
    }
    if (span.sourceSha256 !== source.sourceSha256) {
      throw new Error(`${context} source hash does not match ${span.sourceRef}.`);
    }
  }
}

function requireControlGrants(registry, record, context) {
  for (const grantRef of record.control?.authorityGrantRefs ?? []) {
    requireRecord(registry, "authority_grant", grantRef, context);
  }
}

function requireListedRefs(registry, kind, refs, context) {
  for (const ref of refs) {
    requireRecord(registry, kind, ref, context);
  }
}

export function assertOrientationPassageSemantics(document) {
  const registry = makeRegistry(document);

  for (const actor of document.actors) {
    requireControlGrants(registry, actor, `Actor ${actor.actorId}`);
  }

  for (const source of document.sources) {
    requireRecord(registry, "actor", source.assertedBy, `Source ${source.sourceId}`);
    requireControlGrants(registry, source, `Source ${source.sourceId}`);
  }

  for (const arena of document.arenas) {
    if (arena.agentSpaceRef !== document.agentSpaceRef) {
      throw new Error(`Arena ${arena.arenaId} belongs to a different Agent Space.`);
    }
    requireListedRefs(registry, "actor", arena.framedByRefs, `Arena ${arena.arenaId}`);
    requireControlGrants(registry, arena, `Arena ${arena.arenaId}`);
  }

  for (const yawn of document.yawns) {
    requireRecord(registry, "arena", yawn.arenaRef, `Yawn ${yawn.yawnId}`);
    for (const ref of yawn.targetRefs) {
      requireTypedRef(registry, ref, `Yawn ${yawn.yawnId}`);
    }
    requireListedRefs(registry, "observation", yawn.observationRefs, `Yawn ${yawn.yawnId}`);
    for (const observationRef of yawn.observationRefs) {
      const observation = requireRecord(registry, "observation", observationRef, `Yawn ${yawn.yawnId}`);
      if (observation.arenaRef !== yawn.arenaRef) {
        throw new Error(`Yawn ${yawn.yawnId} must receive its Observations from the same Arena.`);
      }
    }
    requireListedRefs(registry, "statement", yawn.statementRefs, `Yawn ${yawn.yawnId}`);
    requireListedRefs(registry, "orientation", yawn.orientationRefs, `Yawn ${yawn.yawnId}`);
    requireListedRefs(registry, "choice", yawn.choiceRefs, `Yawn ${yawn.yawnId}`);
    requireListedRefs(registry, "intention", yawn.intentionRefs, `Yawn ${yawn.yawnId}`);
    requireListedRefs(registry, "projection", yawn.projectionRefs, `Yawn ${yawn.yawnId}`);
    requireListedRefs(registry, "move", yawn.moveRefs, `Yawn ${yawn.yawnId}`);
    requireListedRefs(registry, "consequence", yawn.consequenceRefs, `Yawn ${yawn.yawnId}`);
    requireListedRefs(registry, "proof_receipt", yawn.proofReceiptRefs, `Yawn ${yawn.yawnId}`);
  }

  for (const observation of document.observations) {
    const context = `Observation ${observation.observationId}`;
    requireRecord(registry, "actor", observation.observerRef, context);
    requireRecord(registry, "arena", observation.arenaRef, context);
    requireSourceSpans(registry, observation.sourceSpans, context);
    for (const ref of observation.observedRefs) {
      requireTypedRef(registry, ref, context);
    }
    requireControlGrants(registry, observation, context);
  }

  for (const statement of document.statements) {
    const context = `Statement ${statement.statementId}`;
    requireRecord(registry, "actor", statement.assertedBy, context);
    requireSourceSpans(registry, statement.sourceSpans, context);
    requireListedRefs(registry, "observation", statement.groundedInObservationRefs, context);
    for (const ref of statement.aboutRefs) {
      requireTypedRef(registry, ref, context);
    }
    requireControlGrants(registry, statement, context);
  }

  for (const orientation of document.orientations) {
    const context = `Orientation ${orientation.orientationId}`;
    requireRecord(registry, "yawn", orientation.yawnRef, context);
    requireRecord(registry, "actor", orientation.heldBy, context);
    requireListedRefs(registry, "statement", orientation.statementRefs, context);
    for (const ref of [...orientation.valueRefs, ...orientation.goalRefs, ...orientation.targetRefs]) {
      requireTypedRef(registry, ref, context);
    }
    requireControlGrants(registry, orientation, context);
  }

  for (const choice of document.choices) {
    const context = `Choice ${choice.choiceId}`;
    requireRecord(registry, "yawn", choice.yawnRef, context);
    requireRecord(registry, "actor", choice.selectedBy, context);
    requireRecord(registry, "orientation", choice.orientationRef, context);
    requireListedRefs(registry, "intention", choice.selectedIntentionRefs, context);
    requireControlGrants(registry, choice, context);
  }

  for (const intention of document.intentions) {
    const context = `Intention ${intention.intentionId}`;
    requireRecord(registry, "yawn", intention.yawnRef, context);
    requireRecord(registry, "actor", intention.heldBy, context);
    if (intention.selectedByChoiceRef !== null) {
      const choice = requireRecord(registry, "choice", intention.selectedByChoiceRef, context);
      if (!choice.selectedIntentionRefs.includes(intention.intentionId)) {
        throw new Error(`${context} is not selected by reciprocal Choice ${choice.choiceId}.`);
      }
    }
    requireListedRefs(registry, "statement", intention.sourceStatementRefs, context);
    requireControlGrants(registry, intention, context);
  }

  for (const projection of document.projections) {
    const context = `Projection ${projection.projectionId}`;
    const yawn = requireRecord(registry, "yawn", projection.yawnRef, context);
    requireRecord(registry, "actor", projection.projectedBy, context);
    requireRecord(registry, "arena", projection.arenaRef, context);
    if (projection.arenaRef !== yawn.arenaRef) {
      throw new Error(`${context} must enter the same Arena as its Yawn.`);
    }
    if (projection.intentionRef !== null) {
      requireRecord(registry, "intention", projection.intentionRef, context);
    }
    requireListedRefs(registry, "statement", projection.contentStatementRefs, context);
    requireListedRefs(registry, "source", projection.contentSourceRefs, context);
    if (projection.kind === "move") {
      const move = requireRecord(registry, "move", projection.moveRef, context);
      if (move.projectionRef !== projection.projectionId) {
        throw new Error(`${context} does not have a reciprocal Move reference.`);
      }
    }
    requireControlGrants(registry, projection, context);
  }

  for (const move of document.moves) {
    const context = `Move ${move.moveId}`;
    requireRecord(registry, "yawn", move.yawnRef, context);
    requireRecord(registry, "actor", move.attemptedBy, context);
    const projection = requireRecord(registry, "projection", move.projectionRef, context);
    if (projection.kind !== "move" || projection.moveRef !== move.moveId) {
      throw new Error(`${context} must be represented by a reciprocal Projection of kind move.`);
    }
    if (projection.projectedBy !== move.attemptedBy || projection.yawnRef !== move.yawnRef) {
      throw new Error(`${context} and its Projection disagree about actor or Yawn.`);
    }

    if (["authorized", "attempted", "completed"].includes(move.status)) {
      if (move.authorityGrantRef === null) {
        throw new Error(`${context} cannot be ${move.status} without an Authority Grant.`);
      }
      const grant = requireRecord(registry, "authority_grant", move.authorityGrantRef, context);
      if (grant.status !== "granted" || grant.principalRef !== move.attemptedBy) {
        throw new Error(`${context} does not resolve to a granted authority for its actor.`);
      }
      if (grant.yawnRef !== move.yawnRef || grant.arenaRef !== projection.arenaRef) {
        throw new Error(`${context} authority scope does not match its Yawn and Arena.`);
      }
    }
    if (["attempted", "completed"].includes(move.status) && move.attemptedAt === null) {
      throw new Error(`${context} requires attemptedAt when status is ${move.status}.`);
    }
    requireControlGrants(registry, move, context);
  }

  for (const consequence of document.consequences) {
    const context = `Consequence ${consequence.consequenceId}`;
    const yawn = requireRecord(registry, "yawn", consequence.yawnRef, context);
    requireRecord(registry, "arena", consequence.arenaRef, context);
    requireRecord(registry, "actor", consequence.recordedBy, context);
    requireListedRefs(registry, "projection", consequence.projectionRefs, context);
    if (consequence.arenaRef !== yawn.arenaRef) {
      throw new Error(`${context} must return through the same Arena as its Yawn.`);
    }
    for (const projectionRef of consequence.projectionRefs) {
      const projection = requireRecord(registry, "projection", projectionRef, context);
      if (projection.arenaRef !== consequence.arenaRef) {
        throw new Error(`${context} and ${projectionRef} must resolve through the same Arena.`);
      }
    }
    requireListedRefs(registry, "statement", consequence.statementRefs, context);
    requireControlGrants(registry, consequence, context);
  }

  for (const grant of document.authorityGrants) {
    const context = `Authority Grant ${grant.grantId}`;
    requireRecord(registry, "actor", grant.principalRef, context);
    requireRecord(registry, "actor", grant.grantedBy, context);
    requireRecord(registry, "arena", grant.arenaRef, context);
    requireRecord(registry, "yawn", grant.yawnRef, context);
  }

  for (const receipt of document.proofReceipts) {
    const context = `Proof Receipt ${receipt.receiptId}`;
    requireRecord(registry, "yawn", receipt.yawnRef, context);
    requireRecord(registry, "actor", receipt.verifiedBy, context);
    requireListedRefs(registry, "move", receipt.evaluatesMoveRefs, context);
    requireListedRefs(registry, "consequence", receipt.evaluatesConsequenceRefs, context);
    requireSourceSpans(registry, receipt.sourceSpans, context);
    if (["passed", "failed", "disputed"].includes(receipt.status) && receipt.verifiedAt === null) {
      throw new Error(`${context} requires verifiedAt when status is ${receipt.status}.`);
    }
    requireControlGrants(registry, receipt, context);
  }

  return true;
}
