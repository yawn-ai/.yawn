const list = (value) => Array.isArray(value) ? value : [];

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

const checkParentBots = (bots, botIndex, rootBotRef, errors) => {
  for (const bot of bots) {
    requireRef(bot.parentBotRef, botIndex, `bot:${bot.botId}.parentBotRef`, errors);
    if (bot.botId !== rootBotRef && bot.parentBotRef === null) {
      errors.push(`bot:${bot.botId}.parentBotRef: non-root bot requires a parent`);
    }
    const seen = new Set([bot.botId]);
    let cursor = bot.parentBotRef;
    let reachedRoot = bot.botId === rootBotRef;
    while (cursor !== null && botIndex.has(cursor)) {
      if (seen.has(cursor)) {
        errors.push(`bot:${bot.botId}.parentBotRef: cycle through ${cursor}`);
        break;
      }
      if (cursor === rootBotRef) reachedRoot = true;
      seen.add(cursor);
      const parent = botIndex.get(cursor);
      if (Date.parse(parent.producedBy.producedAt) > Date.parse(bot.producedBy.producedAt)) {
        errors.push(`bot:${bot.botId}.parentBotRef: parent must not be produced after child`);
      }
      cursor = parent.parentBotRef;
    }
    if (bot.botId !== rootBotRef && !reachedRoot) {
      errors.push(`bot:${bot.botId}.parentBotRef: non-root bot must connect to the configured root`);
    }
  }
};

/**
 * Validate lifecycle invariants that JSON Schema cannot express across records.
 * External Yawn, StructuralChangeReceipt, Agent Space, Arena, policy, source,
 * and grant references remain the responsibility of their owning protocol
 * modules. In particular, a locally coherent BotBindingReceipt is not proof
 * that its referenced Yawn materialization or authority records resolve.
 */
export const validateObjectiveHolonSemantics = (
  document,
  { requireBotBindingReceipts = false } = {},
) => {
  const errors = [];
  const indexes = {
    projections: indexBy(document.compileProjections, "compileProjectionId", "compileProjections", errors),
    candidates: indexBy(document.objectiveCandidates, "objectiveCandidateId", "objectiveCandidates", errors),
    objectives: indexBy(document.objectives, "objectiveId", "objectives", errors),
    bots: indexBy(document.yawnBots, "botId", "yawnBots", errors),
    ratifications: indexBy(document.ratificationReceipts, "ratificationReceiptId", "ratificationReceipts", errors),
    bindings: indexBy(list(document.botBindingReceipts), "botBindingReceiptId", "botBindingReceipts", errors),
    activations: indexBy(document.activationReceipts, "activationReceiptId", "activationReceipts", errors),
  };

  const rootBot = indexes.bots.get(document.rootAlignment.rootBotRef);
  const rootStewards = document.yawnBots.filter((bot) => bot.role === "root_steward");
  if (rootStewards.length !== 1 || rootStewards[0]?.botId !== document.rootAlignment.rootBotRef) {
    errors.push("rootAlignment.rootBotRef: exactly one root_steward must equal the configured root bot");
  }
  if (!rootBot) {
    errors.push(`rootAlignment.rootBotRef: unresolved ${document.rootAlignment.rootBotRef}`);
  } else {
    if (rootBot.role !== "root_steward") errors.push("rootAlignment.rootBotRef: root bot must have role root_steward");
    if (rootBot.parentBotRef !== null) errors.push("rootAlignment.rootBotRef: root bot cannot have a parent bot");
    if (rootBot.objectiveRef !== null) errors.push("rootAlignment.rootBotRef: root bot cannot hold an objective in v0.1");
    if (rootBot.ratificationReceiptRefs.length > 0 || list(rootBot.bindingReceiptRefs).length > 0) {
      errors.push("rootAlignment.rootBotRef: root bot cannot carry objective ratification or binding refs in v0.1");
    }
    if (rootBot.yawnRef !== document.rootAlignment.rootYawnRef) errors.push("rootAlignment: root bot and root Yawn must match");
    if (rootBot.principalRef !== document.rootAlignment.principalRef) errors.push("rootAlignment: root bot and principal must match");
  }

  checkParentBots(document.yawnBots, indexes.bots, document.rootAlignment.rootBotRef, errors);

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
    if (candidate.proposedBotRef !== null && candidate.proposedYawnRef === null) {
      errors.push(`candidate:${candidate.objectiveCandidateId}: proposed bot requires proposed Yawn`);
    }
  }

  const ratificationsByCandidate = new Map();
  for (const receipt of document.ratificationReceipts) {
    const receipts = ratificationsByCandidate.get(receipt.objectiveCandidateRef) ?? [];
    receipts.push(receipt);
    ratificationsByCandidate.set(receipt.objectiveCandidateRef, receipts);
  }
  for (const [candidateRef, receipts] of ratificationsByCandidate) {
    if (receipts.length > 1) {
      errors.push(`candidate:${candidateRef}: at most one ratification receipt; decision change requires a new corrected candidate`);
    }
  }

  const objectiveByCandidate = new Map();
  for (const objective of document.objectives) {
    requireRef(objective.derivedFromCandidateRef, indexes.candidates, `objective:${objective.objectiveId}.derivedFromCandidateRef`, errors);
    if (objectiveByCandidate.has(objective.derivedFromCandidateRef)) {
      errors.push(`candidate:${objective.derivedFromCandidateRef}: cannot derive more than one objective in v0.1`);
    }
    objectiveByCandidate.set(objective.derivedFromCandidateRef, objective.objectiveId);
    if (objective.principalRef !== objective.ratifiedBy) {
      errors.push(`objective:${objective.objectiveId}: ratifiedBy must be the objective principal in v0.1`);
    }
    const accepted = document.ratificationReceipts.filter((receipt) =>
      receipt.decision === "accepted" &&
      receipt.objectiveCandidateRef === objective.derivedFromCandidateRef &&
      receipt.objectiveRef === objective.objectiveId &&
      receipt.principalRef === objective.principalRef &&
      receipt.authorizedBy === objective.ratifiedBy &&
      receipt.recordedAt === objective.ratifiedAt
    );
    if (accepted.length !== 1) {
      errors.push(`objective:${objective.objectiveId}: requires exactly one matching accepted ratification receipt`);
    }
  }

  for (const bot of document.yawnBots) {
    requireRef(bot.objectiveRef, indexes.objectives, `bot:${bot.botId}.objectiveRef`, errors);
    requireRefs(bot.ratificationReceiptRefs, indexes.ratifications, `bot:${bot.botId}.ratificationReceiptRefs`, errors);
    requireRefs(list(bot.bindingReceiptRefs), indexes.bindings, `bot:${bot.botId}.bindingReceiptRefs`, errors);
    requireRefs(bot.activationReceiptRefs, indexes.activations, `bot:${bot.botId}.activationReceiptRefs`, errors);

    const matchingBindings = list(bot.bindingReceiptRefs).filter((ref) => {
      const receipt = indexes.bindings.get(ref);
      return receipt &&
        receipt.botRef === bot.botId &&
        receipt.yawnRef === bot.yawnRef &&
        receipt.objectiveRef === bot.objectiveRef &&
        receipt.principalRef === bot.principalRef &&
        receipt.toBindingState === "sleeping";
    });
    const bindingsForBot = list(document.botBindingReceipts).filter(
      (receipt) => receipt.botRef === bot.botId,
    );
    if ((list(bot.bindingReceiptRefs).length > 0 || bindingsForBot.length > 0)
      && matchingBindings.length === 0) {
      errors.push(`bot:${bot.botId}: missing matching bot binding receipt`);
    }
    if (bindingsForBot.length > 1 || list(bot.bindingReceiptRefs).length > 1) {
      errors.push(`bot:${bot.botId}: at most one bot binding receipt is permitted in v0.1`);
    }
    for (const ref of list(bot.bindingReceiptRefs)) {
      const receipt = indexes.bindings.get(ref);
      if (receipt && !(
        receipt.botRef === bot.botId
        && receipt.yawnRef === bot.yawnRef
        && receipt.objectiveRef === bot.objectiveRef
        && receipt.principalRef === bot.principalRef
        && receipt.toBindingState === "sleeping"
      )) {
        errors.push(`bot:${bot.botId}: binding receipt ref must match bot, Yawn, objective, and principal`);
      }
    }
    for (const ref of bot.ratificationReceiptRefs) {
      const receipt = indexes.ratifications.get(ref);
      if (receipt && !(
        receipt.decision === "accepted"
        && receipt.objectiveRef === bot.objectiveRef
        && receipt.principalRef === bot.principalRef
        && (receipt.yawnRef === null || receipt.yawnRef === bot.yawnRef)
        && (receipt.botRef === null || receipt.botRef === bot.botId)
      )) {
        errors.push(`bot:${bot.botId}: ratification receipt ref must accept the same objective and principal`);
      }
      const matchingBindingReceipt = matchingBindings.length === 1
        ? indexes.bindings.get(matchingBindings[0])
        : undefined;
      if (matchingBindingReceipt && ref !== matchingBindingReceipt.ratificationReceiptRef) {
        errors.push(`bot:${bot.botId}: ratification receipt ref must match the binding receipt`);
      }
    }
    for (const ref of bot.activationReceiptRefs) {
      const receipt = indexes.activations.get(ref);
      if (receipt && !(
        receipt.botRef === bot.botId
        && receipt.yawnRef === bot.yawnRef
        && receipt.objectiveRef === bot.objectiveRef
        && receipt.principalRef === bot.principalRef
      )) {
        errors.push(`bot:${bot.botId}: activation receipt ref must match bot, Yawn, objective, and principal`);
      }
    }
    if (requireBotBindingReceipts && bot.role === "root_steward"
      && (bot.ratificationReceiptRefs.length > 0 || list(bot.bindingReceiptRefs).length > 0)) {
      errors.push(`bot:${bot.botId}: root steward cannot carry objective ratification or binding refs in v0.1`);
    }

    if (bot.objectiveRef !== null) {
      const objective = indexes.objectives.get(bot.objectiveRef);
      if (objective && objective.principalRef !== bot.principalRef) {
        errors.push(`bot:${bot.botId}: objective principal must match bot principal`);
      }
      if (objective && !["ratified", "paused"].includes(objective.status) && ["orienting", "active", "waiting", "blocked"].includes(bot.lifecycleState)) {
        errors.push(`bot:${bot.botId}: active stewardship requires a ratified objective`);
      }
      const allowedBotStatesByObjectiveStatus = {
        ratified: ["sleeping", "orienting", "active", "waiting", "blocked", "paused"],
        paused: ["sleeping", "paused"],
        retired: ["retired"],
        revoked: ["retired"],
      };
      if (objective && !allowedBotStatesByObjectiveStatus[objective.status]?.includes(bot.lifecycleState)) {
        errors.push(`bot:${bot.botId}: lifecycle state ${bot.lifecycleState} is incompatible with objective status ${objective.status}`);
      }
      if (requireBotBindingReceipts
        && matchingBindings.length === 0) {
        errors.push(`bot:${bot.botId}: missing matching bot binding receipt`);
      }

      if (requireBotBindingReceipts) {
        if (bindingsForBot.length !== 1 || matchingBindings.length !== 1
          || list(bot.bindingReceiptRefs).length !== 1) {
          errors.push(`bot:${bot.botId}: strict profile requires exactly one matching bot binding receipt`);
        }
        const matchingBindingReceipt = matchingBindings.length === 1
          ? indexes.bindings.get(matchingBindings[0])
          : undefined;
        if (matchingBindingReceipt && !(
          bot.ratificationReceiptRefs.length === 1
          && bot.ratificationReceiptRefs[0] === matchingBindingReceipt.ratificationReceiptRef
        )) {
          errors.push(`bot:${bot.botId}: strict profile requires exactly the binding's ratification receipt ref`);
        }
      }
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

    if (requireBotBindingReceipts) {
      const activationsForBot = document.activationReceipts.filter(
        (receipt) => receipt.botRef === bot.botId,
      );
      const activationRequired = ["orienting", "active", "waiting", "blocked", "paused"]
        .includes(bot.lifecycleState);
      if (activationsForBot.length > 1 || list(bot.activationReceiptRefs).length > 1) {
        errors.push(`bot:${bot.botId}: strict profile permits at most one activation receipt in v0.1`);
      }
      if (activationRequired
        && (activationsForBot.length !== 1 || list(bot.activationReceiptRefs).length !== 1)) {
        errors.push(`bot:${bot.botId}: strict profile requires exactly one current activation receipt`);
      }
    }
  }

  for (const receipt of document.ratificationReceipts) {
    requireRef(receipt.objectiveCandidateRef, indexes.candidates, `ratification:${receipt.ratificationReceiptId}.objectiveCandidateRef`, errors);
    requireRef(receipt.objectiveRef, indexes.objectives, `ratification:${receipt.ratificationReceiptId}.objectiveRef`, errors);
    const candidate = indexes.candidates.get(receipt.objectiveCandidateRef);
    if (candidate && candidate.principalRef !== receipt.principalRef) {
      errors.push(`ratification:${receipt.ratificationReceiptId}: principal must match candidate principal`);
    }
    if (candidate && Date.parse(candidate.producedBy.producedAt) > Date.parse(receipt.recordedAt)) {
      errors.push(`ratification:${receipt.ratificationReceiptId}: candidate must not be produced after ratification`);
    }
    if (receipt.authorizedBy !== receipt.principalRef) {
      errors.push(`ratification:${receipt.ratificationReceiptId}: authorizedBy must be the principal in v0.1`);
    }
    if (receipt.decision === "corrected") {
      if (receipt.objectiveRef !== null || receipt.yawnRef !== null || receipt.botRef !== null) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: corrected decision cannot ratify or name structural refs`);
      }
      if (list(receipt.corrections).length === 0) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: corrected decision requires corrections`);
      }
      const correctedCandidateRef = receipt.correctedCandidateRef;
      if (requireBotBindingReceipts && (typeof correctedCandidateRef !== "string" || correctedCandidateRef.length === 0)) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: strict profile requires correctedCandidateRef`);
      }
      if (typeof correctedCandidateRef === "string") {
        requireRef(correctedCandidateRef, indexes.candidates, `ratification:${receipt.ratificationReceiptId}.correctedCandidateRef`, errors);
        const correctedCandidate = indexes.candidates.get(correctedCandidateRef);
        if (correctedCandidateRef === receipt.objectiveCandidateRef) {
          errors.push(`ratification:${receipt.ratificationReceiptId}: corrected candidate must be distinct`);
        }
        if (correctedCandidate && correctedCandidate.principalRef !== receipt.principalRef) {
          errors.push(`ratification:${receipt.ratificationReceiptId}: corrected candidate principal must match`);
        }
        if (correctedCandidate
          && Date.parse(correctedCandidate.producedBy.producedAt) < Date.parse(receipt.recordedAt)) {
          errors.push(`ratification:${receipt.ratificationReceiptId}: corrected candidate must not predate correction receipt`);
        }
        if (!list(receipt.corrections).includes(correctedCandidateRef)) {
          errors.push(`ratification:${receipt.ratificationReceiptId}: corrections must include correctedCandidateRef`);
        }
      }
    } else if (list(receipt.corrections).length > 0) {
      errors.push(`ratification:${receipt.ratificationReceiptId}: only corrected decision may carry corrections`);
    }
    if (receipt.decision === "accepted") {
      const objective = indexes.objectives.get(receipt.objectiveRef);
      if (objective && objective.derivedFromCandidateRef !== receipt.objectiveCandidateRef) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: objective must derive from the ratified candidate`);
      }
      if (objective && (
        objective.principalRef !== receipt.principalRef
        || objective.ratifiedBy !== receipt.authorizedBy
        || objective.ratifiedAt !== receipt.recordedAt
      )) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: objective principal, authorizer, and ratifiedAt must match receipt`);
      }
      if (candidate && receipt.yawnRef !== null && receipt.yawnRef !== candidate.proposedYawnRef) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: accepted Yawn must match proposed Yawn`);
      }
      if (candidate && receipt.botRef !== null && receipt.botRef !== candidate.proposedBotRef) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: accepted bot must match proposed bot`);
      }
      if (receipt.botRef !== null && receipt.yawnRef === null) {
        errors.push(`ratification:${receipt.ratificationReceiptId}: bot cross-link requires Yawn cross-link`);
      }
    }
  }

  for (const receipt of list(document.botBindingReceipts)) {
    requireRef(receipt.botRef, indexes.bots, `botBinding:${receipt.botBindingReceiptId}.botRef`, errors);
    requireRef(receipt.objectiveRef, indexes.objectives, `botBinding:${receipt.botBindingReceiptId}.objectiveRef`, errors);
    requireRef(receipt.ratificationReceiptRef, indexes.ratifications, `botBinding:${receipt.botBindingReceiptId}.ratificationReceiptRef`, errors);
    if (receipt.authorizedBy !== receipt.principalRef) {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: authorizedBy must be the principal in v0.1`);
    }
    const bot = indexes.bots.get(receipt.botRef);
    if (bot && receipt.yawnRef !== bot.yawnRef) {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: Yawn must match bot binding`);
    }
    if (bot && receipt.objectiveRef !== bot.objectiveRef) {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: objective must match bot binding`);
    }
    if (bot && receipt.principalRef !== bot.principalRef) {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: principal must match bot binding`);
    }
    if (bot && !list(bot.bindingReceiptRefs).includes(receipt.botBindingReceiptId)) {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: bot must reference binding receipt`);
    }
    const ratification = indexes.ratifications.get(receipt.ratificationReceiptRef);
    if (ratification && !(
      ratification.decision === "accepted"
      && ratification.objectiveRef === receipt.objectiveRef
      && ratification.principalRef === receipt.principalRef
    )) {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: ratification must accept the same objective and principal`);
    }
    if (receipt.authorizationStatus !== "authorized") {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: authorizationStatus must be authorized`);
    }
    if (ratification && Date.parse(ratification.recordedAt) > Date.parse(receipt.recordedAt)) {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: ratification must not occur after binding`);
    }
    const parentBot = bot?.parentBotRef === null
      ? undefined
      : indexes.bots.get(bot?.parentBotRef);
    if (parentBot && Date.parse(parentBot.producedBy.producedAt) > Date.parse(receipt.recordedAt)) {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: parent bot must not be produced after child binding`);
    }
    if (requireBotBindingReceipts && bot?.role !== "root_steward"
      && Date.parse(bot?.producedBy?.producedAt) < Date.parse(receipt.recordedAt)) {
      errors.push(`botBinding:${receipt.botBindingReceiptId}: bound bot producedAt must not precede binding recordedAt`);
    }
    for (const effectKey of [
      "botActivated",
      "authorityGranted",
      "effectAuthorityGranted",
      "externalEffectsAuthorized",
    ]) {
      if (receipt.effects?.[effectKey] !== false) {
        errors.push(`botBinding:${receipt.botBindingReceiptId}: ${effectKey} must be false`);
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
    if (bot && !bot.activationReceiptRefs.includes(receipt.activationReceiptId)) {
      errors.push(`activation:${receipt.activationReceiptId}: bot must reverse-reference activation receipt`);
    }
    const binding = list(document.botBindingReceipts).find(
      (candidate) => candidate.botRef === receipt.botRef,
    );
    if (binding && Date.parse(binding.recordedAt) > Date.parse(receipt.recordedAt)) {
      errors.push(`activation:${receipt.activationReceiptId}: binding must not occur after activation`);
    }
    if (bot && Date.parse(bot.producedBy.producedAt) > Date.parse(receipt.recordedAt)) {
      errors.push(`activation:${receipt.activationReceiptId}: bound bot record must not occur after activation`);
    }
  }

  return errors;
};

export const validateObjectiveHolonBindingConformance = (document) =>
  validateObjectiveHolonSemantics(document, { requireBotBindingReceipts: true });
