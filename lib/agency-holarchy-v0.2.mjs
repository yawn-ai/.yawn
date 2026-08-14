const indexBy = (items, key, label, errors) => {
  const index = new Map();
  for (const [position, item] of items.entries()) {
    const id = item[key];
    if (index.has(id)) errors.push(`${label}[${position}].${key}: duplicate ${id}`);
    index.set(id, item);
  }
  return index;
};

const requireRef = (ref, index, path, errors) => {
  if (ref !== null && !index.has(ref)) errors.push(`${path}: unresolved ${ref}`);
};

const requireRefs = (refs, index, path, errors) => {
  for (const [position, ref] of refs.entries()) requireRef(ref, index, `${path}[${position}]`, errors);
};

const checkParentTree = (items, idKey, parentKey, label, index, errors) => {
  for (const item of items) {
    requireRef(item[parentKey], index, `${label}:${item[idKey]}.${parentKey}`, errors);
    const seen = new Set([item[idKey]]);
    let cursor = item[parentKey];
    while (cursor !== null && index.has(cursor)) {
      if (seen.has(cursor)) {
        errors.push(`${label}:${item[idKey]}.${parentKey}: cycle through ${cursor}`);
        break;
      }
      seen.add(cursor);
      cursor = index.get(cursor)[parentKey];
    }
  }
};

const causalIndexes = (indexes) => ({
  turn: indexes.turns,
  move: indexes.moves,
  event: indexes.events,
  transition: indexes.transitions,
  proof: indexes.proofs,
});

const checkCausalRefs = (refs, indexes, path, errors) => {
  const known = causalIndexes(indexes);
  for (const [position, causalRef] of refs.entries()) {
    if (causalRef.kind === "external") continue;
    requireRef(causalRef.ref, known[causalRef.kind], `${path}[${position}].ref`, errors);
  }
};

/**
 * Validate cross-record invariants that JSON Schema cannot express alone.
 *
 * The function is pure and does not execute document content. An empty result
 * means that referential integrity, parent acyclicity, and local append-only
 * stream continuity hold for the supplied Draft 0.2 aggregate.
 */
export const validateAgencyHolarchySemantics = (document) => {
  const errors = [];
  const indexes = {
    arenas: indexBy(document.arenas, "arenaId", "arenas", errors),
    yawns: indexBy(document.yawns, "yawnId", "yawns", errors),
    relations: indexBy(document.relations, "relationId", "relations", errors),
    turns: indexBy(document.turns, "turnId", "turns", errors),
    moves: indexBy(document.moves, "moveId", "moves", errors),
    events: indexBy(document.events, "eventId", "events", errors),
    transitions: indexBy(document.transitions, "transitionId", "transitions", errors),
    proofs: indexBy(document.proofReceipts, "proofReceiptId", "proofReceipts", errors),
    routing: indexBy(document.routingProposals, "routingProposalId", "routingProposals", errors),
    receipts: indexBy(document.structuralChangeReceipts, "structuralChangeReceiptId", "structuralChangeReceipts", errors),
  };

  checkParentTree(document.arenas, "arenaId", "parentArenaRef", "arena", indexes.arenas, errors);
  checkParentTree(document.yawns, "yawnId", "primaryParentYawnRef", "yawn", indexes.yawns, errors);
  checkParentTree(document.turns, "turnId", "parentTurnRef", "turn", indexes.turns, errors);

  for (const arena of document.arenas) {
    // Agent, source, authority, and audience namespaces may resolve outside this
    // aggregate. Only protocol-owned structural references are checked here.
    if (arena.parentArenaRef !== null) requireRef(arena.parentArenaRef, indexes.arenas, `arena:${arena.arenaId}.parentArenaRef`, errors);
  }

  for (const yawn of document.yawns) {
    requireRef(yawn.arenaRef, indexes.arenas, `yawn:${yawn.yawnId}.arenaRef`, errors);
  }

  for (const relation of document.relations) {
    requireRef(relation.fromYawnRef, indexes.yawns, `relation:${relation.relationId}.fromYawnRef`, errors);
    requireRef(relation.toYawnRef, indexes.yawns, `relation:${relation.relationId}.toYawnRef`, errors);
    if (relation.fromYawnRef === relation.toYawnRef) errors.push(`relation:${relation.relationId}: self relation is not meaningful`);
  }

  for (const turn of document.turns) {
    requireRef(turn.arenaRef, indexes.arenas, `turn:${turn.turnId}.arenaRef`, errors);
    requireRef(turn.yawnRef, indexes.yawns, `turn:${turn.turnId}.yawnRef`, errors);
    requireRefs(turn.moveRefs, indexes.moves, `turn:${turn.turnId}.moveRefs`, errors);
    requireRefs(turn.eventRefs, indexes.events, `turn:${turn.turnId}.eventRefs`, errors);
    requireRefs(turn.transitionRefs, indexes.transitions, `turn:${turn.turnId}.transitionRefs`, errors);
    requireRefs(turn.proofReceiptRefs, indexes.proofs, `turn:${turn.turnId}.proofReceiptRefs`, errors);
    checkCausalRefs(turn.causedBy, indexes, `turn:${turn.turnId}.causedBy`, errors);
  }

  for (const move of document.moves) {
    requireRef(move.turnRef, indexes.turns, `move:${move.moveId}.turnRef`, errors);
    requireRef(move.yawnRef, indexes.yawns, `move:${move.moveId}.yawnRef`, errors);
    checkCausalRefs(move.causedBy, indexes, `move:${move.moveId}.causedBy`, errors);
  }

  for (const event of document.events) {
    requireRef(event.previousEventRef, indexes.events, `event:${event.eventId}.previousEventRef`, errors);
    requireRef(event.correctionOfEventRef, indexes.events, `event:${event.eventId}.correctionOfEventRef`, errors);
    checkCausalRefs(event.causedBy, indexes, `event:${event.eventId}.causedBy`, errors);
  }

  for (const transition of document.transitions) {
    requireRef(transition.turnRef, indexes.turns, `transition:${transition.transitionId}.turnRef`, errors);
    requireRef(transition.yawnRef, indexes.yawns, `transition:${transition.transitionId}.yawnRef`, errors);
    requireRefs(transition.attemptedByMoveRefs, indexes.moves, `transition:${transition.transitionId}.attemptedByMoveRefs`, errors);
    requireRefs(transition.eventRefs, indexes.events, `transition:${transition.transitionId}.eventRefs`, errors);
    requireRefs(transition.proofReceiptRefs, indexes.proofs, `transition:${transition.transitionId}.proofReceiptRefs`, errors);
    checkCausalRefs(transition.causedBy, indexes, `transition:${transition.transitionId}.causedBy`, errors);
  }

  for (const proof of document.proofReceipts) {
    requireRef(proof.yawnRef, indexes.yawns, `proof:${proof.proofReceiptId}.yawnRef`, errors);
    requireRef(proof.turnRef, indexes.turns, `proof:${proof.proofReceiptId}.turnRef`, errors);
    requireRef(proof.transitionRef, indexes.transitions, `proof:${proof.proofReceiptId}.transitionRef`, errors);
  }

  for (const proposal of document.routingProposals) {
    requireRefs(proposal.arenaCandidateRefs, indexes.arenas, `routing:${proposal.routingProposalId}.arenaCandidateRefs`, errors);
    requireRefs(proposal.yawnCandidateRefs, indexes.yawns, `routing:${proposal.routingProposalId}.yawnCandidateRefs`, errors);
    for (const [position, score] of proposal.candidateScores.entries()) {
      requireRef(score.candidateYawnRef, indexes.yawns, `routing:${proposal.routingProposalId}.candidateScores[${position}].candidateYawnRef`, errors);
    }
  }

  for (const receipt of document.structuralChangeReceipts) {
    requireRef(receipt.proposalRef, indexes.routing, `receipt:${receipt.structuralChangeReceiptId}.proposalRef`, errors);
    requireRefs(receipt.affectedArenaRefs, indexes.arenas, `receipt:${receipt.structuralChangeReceiptId}.affectedArenaRefs`, errors);
    requireRefs(receipt.affectedYawnRefs, indexes.yawns, `receipt:${receipt.structuralChangeReceiptId}.affectedYawnRefs`, errors);
    requireRefs(receipt.createdYawnRefs, indexes.yawns, `receipt:${receipt.structuralChangeReceiptId}.createdYawnRefs`, errors);
    requireRefs(receipt.retainedYawnRefs, indexes.yawns, `receipt:${receipt.structuralChangeReceiptId}.retainedYawnRefs`, errors);
    requireRefs(receipt.supersededYawnRefs, indexes.yawns, `receipt:${receipt.structuralChangeReceiptId}.supersededYawnRefs`, errors);
    requireRefs(receipt.eventRefs, indexes.events, `receipt:${receipt.structuralChangeReceiptId}.eventRefs`, errors);
  }

  const streams = new Map();
  for (const event of document.events) {
    const stream = streams.get(event.streamRef) ?? [];
    stream.push(event);
    streams.set(event.streamRef, stream);
  }
  for (const [streamRef, events] of streams) {
    events.sort((left, right) => left.sequence - right.sequence);
    for (const [position, event] of events.entries()) {
      if (event.sequence !== position) errors.push(`stream:${streamRef}: expected sequence ${position}, found ${event.sequence}`);
      const expectedPrevious = position === 0 ? null : events[position - 1].eventId;
      if (event.previousEventRef !== expectedPrevious) {
        errors.push(`stream:${streamRef}: ${event.eventId} previousEventRef must be ${expectedPrevious}`);
      }
    }
  }

  return errors;
};
