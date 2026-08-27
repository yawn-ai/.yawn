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

const checkParentBots = (bots, botIndex, errors) => {
  for (const bot of bots) {
    requireRef(bot.parentBotRef, botIndex, `bot:${bot.botId}.parentBotRef`, errors);
    const seen = new Set([bot.botId]);
    let cursor = bot.parentBotRef;
    while (cursor !== null && botIndex.has(cursor)) {
      if (seen.has(cursor)) {
        errors.push(`bot:${bot.botId}.parentBotRef: cycle through ${cursor}`);
        break;
      }
      seen.add(cursor);
      cursor = botIndex.get(cursor).parentBotRef;
    }
  }
};

/**
 * Validate lifecycle invariants that JSON Schema cannot express across records.
 * External Yawn, Agent Space, Arena, policy, source, and grant references remain
 * the responsibility of their owning protocol modules.
 */
export const validateObjectiveHolonSemantics = (document) => {
  const errors = [];
  const indexes = {
    projections: indexBy(document.compileProjections, "compileProjectionId", "compileProjections", errors),
    candidates: indexBy(document.objectiveCandidates, "objectiveCandidateId", "objectiveCandidates", errors),
    objectives: indexBy(document.objectives, "objectiveId", "objectives", errors),
    bots: indexBy(document.yawnBots, "botId", "yawnBots", errors),
    ratifications: indexBy(document.ratificationReceipts, "ratificationReceiptId", "ratificationReceipts", errors),
    activations: indexBy(document.activationReceipts, "activationReceiptId", "activationReceipts", errors),
  };

  const rootBot = indexes.bots.get(document.rootAlignment.rootBotRef);
  if (!rootBot) {
    errors.push(`rootAlignment.rootBotRef: unresolved ${document.rootAlignment.rootBotRef}`);
  } else {
    if (rootBot.role !== "root_steward") errors.push("rootAlignment.rootBotRef: root bot must have role root_steward");
    if (rootBot.parentBotRef !== null) errors.push("rootAlignment.rootBotRef: root bot cannot have a parent bot");
    if (rootBot.yawnRef !== document.rootAlignment.rootYawnRef) errors.push("rootAlignment: root bot and root Yawn must match");
    if (rootBot.principalRef !== document.rootAlignment.principalRef) errors.push("rootAlignment: root bot and principal must match");
  }

  checkParentBots(document.yawnBots, indexes.bots, errors);

  for (const projection of document.compileProjections) {
    requireRefs(projection.objectiveCandidateRefs, indexes.candidates, `projection:${projection.compileProjectionId}.objectiveCandidateRefs`, errors);
    const detectionIds = new Set(projection.detections.map((detection) => detection.detectionId));
    const operationIds = new Set();
    for (const [position, operation] of projection.proposedOperations.entries()) {
      if (operationIds.has(operation.operationId)) {
        errors.push(`projection:${projection.compileProjectionId}.proposedOperations[${position}]: duplicate ${operation.operationId}`);
      }
      operationIds.add(operation.operationId);
      if (operation.rank !== position + 1) {
        errors.push(`projection:${projection.compileProjectionId}.proposedOperations[${position}].rank: expected ${position + 1}`);
      }
      if (position > 0 && operation.rankingScore > projection.proposedOperations[position - 1].rankingScore) {
        errors.push(`projection:${projection.compileProjectionId}.proposedOperations: ranking scores must be non-increasing`);
      }
      for (const ref of operation.basisDetectionRefs) {
        if (!detectionIds.has(ref)) {
          errors.push(`operation:${operation.operationId}.basisDetectionRefs: unresolved ${ref}`);
        }
      }
    }
  }

  for (const candidate of document.objectiveCandidates) {
    requireRef(candidate.proposedBotRef, indexes.bots, `candidate:${candidate.objectiveCandidateId}.proposedBotRef`, errors);
    const bot = indexes.bots.get(candidate.proposedBotRef);
    if (bot && bot.yawnRef !== candidate.proposedYawnRef) {
      errors.push(`candidate:${candidate.objectiveCandidateId}: proposed bot must bind proposed Yawn`);
    }
    if (bot && bot.principalRef !== candidate.principalRef) {
      errors.push(`candidate:${candidate.objectiveCandidateId}: proposed bot principal must match candidate principal`);
    }
  }

  for (const objective of document.objectives) {
    requireRef(objective.derivedFromCandidateRef, indexes.candidates, `objective:${objective.objectiveId}.derivedFromCandidateRef`, errors);
    if (objective.principalRef !== objective.ratifiedBy) {
      errors.push(`objective:${objective.objectiveId}: ratifiedBy must be the objective principal in v0.1`);
    }
    const accepted = document.ratificationReceipts.some((receipt) =>
      receipt.decision === "accepted" &&
      receipt.objectiveCandidateRef === objective.derivedFromCandidateRef &&
      receipt.objectiveRef === objective.objectiveId &&
      receipt.principalRef === objective.principalRef
    );
    if (!accepted) errors.push(`objective:${objective.objectiveId}: missing accepted ratification receipt`);
  }

  for (const bot of document.yawnBots) {
    requireRef(bot.objectiveRef, indexes.objectives, `bot:${bot.botId}.objectiveRef`, errors);
    requireRefs(bot.ratificationReceiptRefs, indexes.ratifications, `bot:${bot.botId}.ratificationReceiptRefs`, errors);
    requireRefs(bot.activationReceiptRefs, indexes.activations, `bot:${bot.botId}.activationReceiptRefs`, errors);

    if (bot.objectiveRef !== null) {
      const objective = indexes.objectives.get(bot.objectiveRef);
      if (objective && objective.principalRef !== bot.principalRef) {
        errors.push(`bot:${bot.botId}: objective principal must match bot principal`);
      }
      if (objective && !["ratified", "paused"].includes(objective.status) && ["orienting", "active", "waiting", "blocked"].includes(bot.lifecycleState)) {
        errors.push(`bot:${bot.botId}: active stewardship requires a ratified objective`);
      }
      const matchingRatification = bot.ratificationReceiptRefs.some((ref) => {
        const receipt = indexes.ratifications.get(ref);
        return receipt &&
          receipt.decision === "accepted" &&
          receipt.botRef === bot.botId &&
          receipt.yawnRef === bot.yawnRef &&
          receipt.objectiveRef === bot.objectiveRef &&
          receipt.principalRef === bot.principalRef;
      });
      if (!matchingRatification) errors.push(`bot:${bot.botId}: missing matching ratification receipt`);
    }

    if (["orienting", "active", "waiting", "blocked", "paused"].includes(bot.lifecycleState)) {
      const matchingActivation = bot.activationReceiptRefs.some((ref) => {
        const receipt = indexes.activations.get(ref);
        return receipt &&
          receipt.botRef === bot.botId &&
          receipt.yawnRef === bot.yawnRef &&
          receipt.objectiveRef === bot.objectiveRef &&
          receipt.principalRef === bot.principalRef;
      });
      if (!matchingActivation) errors.push(`bot:${bot.botId}: missing matching activation receipt`);
    }
  }

  for (const receipt of document.ratificationReceipts) {
    requireRef(receipt.objectiveCandidateRef, indexes.candidates, `ratification:${receipt.ratificationReceiptId}.objectiveCandidateRef`, errors);
    requireRef(receipt.objectiveRef, indexes.objectives, `ratification:${receipt.ratificationReceiptId}.objectiveRef`, errors);
    requireRef(receipt.botRef, indexes.bots, `ratification:${receipt.ratificationReceiptId}.botRef`, errors);
    const candidate = indexes.candidates.get(receipt.objectiveCandidateRef);
    if (candidate && candidate.principalRef !== receipt.principalRef) {
      errors.push(`ratification:${receipt.ratificationReceiptId}: principal must match candidate principal`);
    }
    if (receipt.authorizedBy !== receipt.principalRef) {
      errors.push(`ratification:${receipt.ratificationReceiptId}: authorizedBy must be the principal in v0.1`);
    }
    if (receipt.decision === "accepted") {
      const bot = indexes.bots.get(receipt.botRef);
      if (candidate && receipt.yawnRef !== candidate.proposedYawnRef) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: accepted Yawn must match proposed Yawn`);
      }
      if (candidate && receipt.botRef !== candidate.proposedBotRef) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: accepted bot must match proposed bot`);
      }
      if (bot && !bot.ratificationReceiptRefs.includes(receipt.ratificationReceiptId)) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: accepted bot must reference receipt`);
      }
    }
  }

  for (const receipt of document.activationReceipts) {
    requireRef(receipt.botRef, indexes.bots, `activation:${receipt.activationReceiptId}.botRef`, errors);
    requireRef(receipt.objectiveRef, indexes.objectives, `activation:${receipt.activationReceiptId}.objectiveRef`, errors);
    if (receipt.authorizedBy !== receipt.principalRef) {
      errors.push(`activation:${receipt.activationReceiptId}: authorizedBy must be the principal in v0.1`);
    }
    const bot = indexes.bots.get(receipt.botRef);
    if (bot && receipt.yawnRef !== bot.yawnRef) errors.push(`activation:${receipt.activationReceiptId}: Yawn must match bot binding`);
    if (bot && receipt.objectiveRef !== bot.objectiveRef) errors.push(`activation:${receipt.activationReceiptId}: objective must match bot binding`);
    if (bot && receipt.principalRef !== bot.principalRef) errors.push(`activation:${receipt.activationReceiptId}: principal must match bot binding`);
    if (bot && receipt.authorityGrantRefs.some((ref) => !bot.authorityGrantRefs.includes(ref))) {
      errors.push(`activation:${receipt.activationReceiptId}: activation grants must be present on bot binding`);
    }
  }

  return errors;
};
