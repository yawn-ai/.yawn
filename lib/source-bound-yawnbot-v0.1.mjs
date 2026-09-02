const asArray = (value) => Array.isArray(value) ? value : [];
const isNonBlank = (value) => typeof value === "string" && value.trim().length > 0;
const addError = (errors, path, message) => errors.push(`${path}: ${message}`);

const collectionSpecs = [
  ["sourceRecords", "sourceId", "source"],
  ["compilerProposals", "proposalId", "compiler_proposal"],
  ["modelFacets", "facetId", "model_facet"],
  ["characterViews", "characterViewId", "view"],
  ["questions", "questionId", "question"],
  ["positions", "positionId", "position"],
  ["expressionProvisions", "provisionId", "expression_provision"],
  ["projections", "projectionId", "projection"],
  ["moves", "moveId", "move"],
  ["consequences", "consequenceId", "consequence"],
  ["evaluations", "evaluationId", "evaluation"],
  ["proofAdjudications", "proofAdjudicationId", "proof_adjudication"],
  ["updates", "updateId", "update"],
  ["relations", "relationId", "relation"],
  ["audiencePolicies", "audiencePolicyId", "audience_policy"],
];

const buildIndex = (document, errors) => {
  const records = new Map();
  if (isNonBlank(document?.modelId)) {
    records.set(document.modelId, { kind: "model", record: document });
  }

  for (const [collectionName, idKey, kind] of collectionSpecs) {
    for (const [index, record] of asArray(document?.[collectionName]).entries()) {
      const id = record?.[idKey];
      const path = `${collectionName}[${index}].${idKey}`;
      if (!isNonBlank(id)) continue;
      if (records.has(id)) addError(errors, path, `duplicate record id ${id}`);
      else records.set(id, { kind, record });
    }
  }

  for (const [evaluationIndex, evaluation] of asArray(document?.evaluations).entries()) {
    const localCriteria = new Set();
    for (const [criterionIndex, criterion] of asArray(evaluation?.criteria).entries()) {
      const id = criterion?.criterionId;
      const path = `evaluations[${evaluationIndex}].criteria[${criterionIndex}].criterionId`;
      if (!isNonBlank(id)) continue;
      if (localCriteria.has(id) || records.has(id)) addError(errors, path, `duplicate record id ${id}`);
      else {
        localCriteria.add(id);
        records.set(id, {
          kind: "criterion",
          record: criterion,
          evaluationId: evaluation?.evaluationId,
        });
      }
    }
  }

  return records;
};

const requireResolved = (errors, records, ref, path) => {
  if (isNonBlank(ref) && !records.has(ref)) addError(errors, path, `unresolved reference ${ref}`);
};

const requireResolvedRefs = (errors, records, refs, path) => {
  for (const [index, ref] of asArray(refs).entries()) {
    requireResolved(errors, records, ref, `${path}[${index}]`);
  }
};

const checkSourceRefs = (document, errors, sourceIds) => {
  const inspect = (refs, path) => {
    for (const [index, ref] of asArray(refs).entries()) {
      if (!sourceIds.has(ref)) addError(errors, `${path}[${index}]`, `unresolved source ${ref}`);
    }
  };

  inspect(document?.subject?.sourceRefs, "subject.sourceRefs");

  const collections = [
    "compilerProposals",
    "modelFacets",
    "characterViews",
    "questions",
    "positions",
    "expressionProvisions",
    "projections",
    "moves",
    "consequences",
    "proofAdjudications",
    "updates",
    "relations",
    "audiencePolicies",
  ];

  for (const collectionName of collections) {
    for (const [index, record] of asArray(document?.[collectionName]).entries()) {
      inspect(record?.sourceRefs, `${collectionName}[${index}].sourceRefs`);
    }
  }

  for (const [evaluationIndex, evaluation] of asArray(document?.evaluations).entries()) {
    inspect(evaluation?.sourceRefs, `evaluations[${evaluationIndex}].sourceRefs`);
    for (const [criterionIndex, criterion] of asArray(evaluation?.criteria).entries()) {
      inspect(criterion?.sourceRefs, `evaluations[${evaluationIndex}].criteria[${criterionIndex}].sourceRefs`);
    }
    for (const [judgmentIndex, judgment] of asArray(evaluation?.judgments).entries()) {
      inspect(judgment?.sourceRefs, `evaluations[${evaluationIndex}].judgments[${judgmentIndex}].sourceRefs`);
    }
  }
};

const checkQuestionCycles = (document, errors, questionIds) => {
  const parents = new Map();
  for (const [index, question] of asArray(document?.questions).entries()) {
    const id = question?.questionId;
    const parent = question?.parentQuestionRef;
    if (!isNonBlank(id) || parent === null || parent === undefined) continue;
    if (!questionIds.has(parent)) addError(errors, `questions[${index}].parentQuestionRef`, `unresolved Question ${parent}`);
    parents.set(id, parent);
  }

  for (const id of questionIds) {
    const seen = new Set();
    let cursor = id;
    while (parents.has(cursor)) {
      if (seen.has(cursor)) {
        addError(errors, `questions:${id}`, "parentQuestionRef cycle detected");
        break;
      }
      seen.add(cursor);
      cursor = parents.get(cursor);
    }
  }
};

const compiledKindMatches = (proposalKind, recordKind) => {
  if (["thought", "belief", "goal", "value", "need", "assumption", "bias", "boundary", "habit", "emotion", "void", "argument", "quote", "lacuna"].includes(proposalKind)) {
    return recordKind === "model_facet";
  }
  const map = new Map([
    ["question", "question"],
    ["position", "position"],
    ["character_view", "view"],
    ["expression_provision", "expression_provision"],
    ["move", "move"],
  ]);
  return !map.has(proposalKind) || map.get(proposalKind) === recordKind;
};

export function validateSourceBoundYawnbotSemantics(document) {
  const errors = [];
  const records = buildIndex(document, errors);

  const sourceIds = new Set(asArray(document?.sourceRecords).map((record) => record?.sourceId).filter(isNonBlank));
  const questionIds = new Set(asArray(document?.questions).map((record) => record?.questionId).filter(isNonBlank));
  const positionIds = new Set(asArray(document?.positions).map((record) => record?.positionId).filter(isNonBlank));
  const provisionIds = new Set(asArray(document?.expressionProvisions).map((record) => record?.provisionId).filter(isNonBlank));
  const projectionIds = new Set(asArray(document?.projections).map((record) => record?.projectionId).filter(isNonBlank));
  const proofIds = new Set(asArray(document?.proofAdjudications).map((record) => record?.proofAdjudicationId).filter(isNonBlank));
  const audiencePolicyIds = new Set(asArray(document?.audiencePolicies).map((record) => record?.audiencePolicyId).filter(isNonBlank));
  const moveById = new Map(
    asArray(document?.moves)
      .filter((record) => isNonBlank(record?.moveId))
      .map((record) => [record.moveId, record]),
  );

  checkSourceRefs(document, errors, sourceIds);
  checkQuestionCycles(document, errors, questionIds);

  const activeGoverningQuestions = asArray(document?.questions).filter(
    (question) => question?.governing === true && question?.status !== "retired",
  );
  if (activeGoverningQuestions.length !== 1) {
    addError(errors, "questions", `expected exactly one active governing Question, found ${activeGoverningQuestions.length}`);
  }

  for (const [index, source] of asArray(document?.sourceRecords).entries()) {
    if (source?.exactTextAvailable === true && !isNonBlank(source?.contentSha256)) {
      addError(errors, `sourceRecords[${index}].contentSha256`, "exact source content requires a content hash");
    }
    if (["verified_content_hash", "sanitized_derivative_hash"].includes(source?.integrityStatus) && !isNonBlank(source?.contentSha256)) {
      addError(errors, `sourceRecords[${index}].integrityStatus`, "claimed hash integrity requires contentSha256");
    }
    if (source?.integrityStatus === "verified_content_hash" && source?.exactTextAvailable !== true) {
      addError(errors, `sourceRecords[${index}].exactTextAvailable`, "verified exact content must be available");
    }
  }

  for (const [index, proposal] of asArray(document?.compilerProposals).entries()) {
    if (proposal?.compiledRecordRef !== null && proposal?.compiledRecordRef !== undefined) {
      const compiled = records.get(proposal.compiledRecordRef);
      if (!compiled) addError(errors, `compilerProposals[${index}].compiledRecordRef`, `unresolved compiled record ${proposal.compiledRecordRef}`);
      else if (!compiledKindMatches(proposal?.kind, compiled.kind)) {
        addError(errors, `compilerProposals[${index}].compiledRecordRef`, `${proposal.kind} proposal cannot compile to ${compiled.kind}`);
      }
    }
    if (proposal?.status !== "proposed" && !isNonBlank(proposal?.dispositionEventRef)) {
      addError(errors, `compilerProposals[${index}].dispositionEventRef`, `${proposal?.status} proposal requires an attributed disposition event`);
    }
  }

  for (const [index, facet] of asArray(document?.modelFacets).entries()) {
    requireResolvedRefs(errors, records, facet?.derivedFromRefs, `modelFacets[${index}].derivedFromRefs`);
    if (facet?.status === "ratified" && !isNonBlank(facet?.ratificationEventRef)) {
      addError(errors, `modelFacets[${index}].ratificationEventRef`, "ratified facet requires a ratification event");
    }
  }

  for (const [index, character] of asArray(document?.characterViews).entries()) {
    requireResolvedRefs(errors, records, character?.representsRefs, `characterViews[${index}].representsRefs`);
    if (character?.agentRef !== null) addError(errors, `characterViews[${index}].agentRef`, "character View cannot be reified as an Agent");
    if (character?.canonicalState !== false) addError(errors, `characterViews[${index}].canonicalState`, "character View cannot be canonical state");
  }

  for (const [index, question] of asArray(document?.questions).entries()) {
    requireResolvedRefs(errors, records, question?.answeredByPositionRefs, `questions[${index}].answeredByPositionRefs`);
    if (question?.openedFromRef !== null && question?.openedFromRef !== undefined) {
      requireResolved(errors, records, question.openedFromRef, `questions[${index}].openedFromRef`);
    }
    for (const positionRef of asArray(question?.answeredByPositionRefs)) {
      const position = records.get(positionRef)?.record;
      if (position && position.questionRef !== question.questionId) {
        addError(errors, `questions[${index}].answeredByPositionRefs`, `${positionRef} answers ${position.questionRef}, not ${question.questionId}`);
      }
    }
    if (question?.status === "answered") {
      const qualifying = asArray(question?.answeredByPositionRefs).some((id) => {
        const position = records.get(id)?.record;
        return position?.status === "accepted" || position?.status === "reported";
      });
      if (!qualifying) addError(errors, `questions[${index}].status`, "answered Question requires an accepted or reported Position");
    }
  }

  for (const [index, position] of asArray(document?.positions).entries()) {
    if (!questionIds.has(position?.questionRef)) addError(errors, `positions[${index}].questionRef`, `unresolved Question ${position?.questionRef}`);
    for (const [alternativeIndex, ref] of asArray(position?.alternativePositionRefs).entries()) {
      if (!positionIds.has(ref)) addError(errors, `positions[${index}].alternativePositionRefs[${alternativeIndex}]`, `unresolved Position ${ref}`);
    }
    if (position?.status === "accepted" && !isNonBlank(position?.acceptanceEventRef)) {
      addError(errors, `positions[${index}].acceptanceEventRef`, "accepted Position requires an acceptance event");
    }
  }

  for (const [index, provision] of asArray(document?.expressionProvisions).entries()) {
    for (const [questionIndex, ref] of asArray(provision?.questionRefs).entries()) {
      if (!questionIds.has(ref)) addError(errors, `expressionProvisions[${index}].questionRefs[${questionIndex}]`, `unresolved Question ${ref}`);
    }
    for (const [positionIndex, ref] of asArray(provision?.positionRefs).entries()) {
      if (!positionIds.has(ref)) addError(errors, `expressionProvisions[${index}].positionRefs[${positionIndex}]`, `unresolved Position ${ref}`);
    }
    if (!audiencePolicyIds.has(provision?.audiencePolicyRef)) {
      addError(errors, `expressionProvisions[${index}].audiencePolicyRef`, `unresolved audience policy ${provision?.audiencePolicyRef}`);
    }
    if (provision?.status === "accepted" && !isNonBlank(provision?.acceptanceEventRef)) {
      addError(errors, `expressionProvisions[${index}].acceptanceEventRef`, "accepted expression provision requires an acceptance event");
    }
  }

  for (const [index, projection] of asArray(document?.projections).entries()) {
    const provision = records.get(projection?.provisionRef)?.record;
    if (!provisionIds.has(projection?.provisionRef)) {
      addError(errors, `projections[${index}].provisionRef`, `unresolved expression provision ${projection?.provisionRef}`);
    } else {
      if (!asArray(provision?.allowedProjectionKinds).includes(projection?.projectionKind)) {
        addError(errors, `projections[${index}].projectionKind`, `${projection?.projectionKind} is not allowed by ${projection?.provisionRef}`);
      }
      if (projection?.targetArenaRef !== provision?.targetArenaRef) {
        addError(errors, `projections[${index}].targetArenaRef`, "Projection Arena must match its expression provision");
      }
      if (projection?.audiencePolicyRef !== provision?.audiencePolicyRef) {
        addError(errors, `projections[${index}].audiencePolicyRef`, "Projection audience policy must match its expression provision");
      }
    }
    if (!audiencePolicyIds.has(projection?.audiencePolicyRef)) {
      addError(errors, `projections[${index}].audiencePolicyRef`, `unresolved audience policy ${projection?.audiencePolicyRef}`);
    }
    if (projection?.status === "expressed" && !isNonBlank(projection?.expressionEventRef)) {
      addError(errors, `projections[${index}].expressionEventRef`, "expressed Projection requires an expression event");
    }
    if (["draft", "proposed"].includes(projection?.status) && isNonBlank(projection?.expressionEventRef)) {
      addError(errors, `projections[${index}].expressionEventRef`, `${projection.status} Projection cannot claim an expression event`);
    }
  }

  for (const [index, move] of asArray(document?.moves).entries()) {
    if (move?.projectionRef !== null && move?.projectionRef !== undefined && !projectionIds.has(move.projectionRef)) {
      addError(errors, `moves[${index}].projectionRef`, `unresolved Projection ${move.projectionRef}`);
    }
    const hasSelection = isNonBlank(move?.selectionReceiptRef);
    const hasChoice = isNonBlank(move?.choiceEventRef);
    const hasAuthority = asArray(move?.authorityGrantRefs).length > 0;
    const hasExecution = isNonBlank(move?.executionEventRef);

    if (move?.status === "proposed" && (hasSelection || hasChoice || hasAuthority || hasExecution)) {
      addError(errors, `moves[${index}]`, "proposed Move cannot claim selection, choice, authority, or execution");
    }
    if (move?.status === "selected" && (!hasSelection || hasChoice || hasAuthority || hasExecution)) {
      addError(errors, `moves[${index}]`, "selected Move requires a selection receipt and cannot claim choice, authority, or execution");
    }
    if (move?.status === "chosen" && (!hasChoice || hasAuthority || hasExecution)) {
      addError(errors, `moves[${index}]`, "chosen Move requires a choice event and cannot claim authority or execution");
    }
    if (move?.status === "authorized" && (!hasChoice || !hasAuthority || hasExecution)) {
      addError(errors, `moves[${index}]`, "authorized Move requires choice and authority but no execution event");
    }
    if (move?.status === "executed" && (!hasChoice || !hasAuthority || !hasExecution)) {
      addError(errors, `moves[${index}]`, "executed Move requires choice, authority, and an execution event");
    }
  }

  for (const [index, consequence] of asArray(document?.consequences).entries()) {
    const move = moveById.get(consequence?.moveRef);
    if (!move) addError(errors, `consequences[${index}].moveRef`, `unresolved Move ${consequence?.moveRef}`);
    else if (move.status !== "executed") addError(errors, `consequences[${index}].moveRef`, "Consequence cannot be recorded for a Move that is not executed");
  }

  const expectedTargetKind = new Map([
    ["question", "question"],
    ["position", "position"],
    ["expression_provision", "expression_provision"],
    ["projection", "projection"],
    ["move", "move"],
    ["consequence", "consequence"],
    ["proof_adjudication", "proof_adjudication"],
    ["update", "update"],
    ["view", "view"],
  ]);

  for (const [index, evaluation] of asArray(document?.evaluations).entries()) {
    const target = records.get(evaluation?.targetRef);
    if (!target && !["relationship", "other"].includes(evaluation?.targetKind)) {
      addError(errors, `evaluations[${index}].targetRef`, `unresolved Evaluation target ${evaluation?.targetRef}`);
    }
    const expectedKind = expectedTargetKind.get(evaluation?.targetKind);
    if (target && expectedKind && target.kind !== expectedKind) {
      addError(errors, `evaluations[${index}].targetKind`, `${evaluation.targetRef} is ${target.kind}, not ${evaluation.targetKind}`);
    }

    requireResolvedRefs(errors, records, evaluation?.opensQuestionRefs, `evaluations[${index}].opensQuestionRefs`);
    requireResolvedRefs(errors, records, evaluation?.dissentingEvaluationRefs, `evaluations[${index}].dissentingEvaluationRefs`);
    requireResolvedRefs(errors, records, evaluation?.evidenceRefs, `evaluations[${index}].evidenceRefs`);

    const criteria = new Set(asArray(evaluation?.criteria).map((criterion) => criterion?.criterionId).filter(isNonBlank));
    const judged = new Set();
    for (const [criterionIndex, criterion] of asArray(evaluation?.criteria).entries()) {
      requireResolvedRefs(errors, records, criterion?.basisRefs, `evaluations[${index}].criteria[${criterionIndex}].basisRefs`);
    }
    for (const [judgmentIndex, judgment] of asArray(evaluation?.judgments).entries()) {
      if (!criteria.has(judgment?.criterionRef)) {
        addError(errors, `evaluations[${index}].judgments[${judgmentIndex}].criterionRef`, `unresolved local criterion ${judgment?.criterionRef}`);
      }
      if (judged.has(judgment?.criterionRef)) {
        addError(errors, `evaluations[${index}].judgments[${judgmentIndex}].criterionRef`, `duplicate Judgment for ${judgment?.criterionRef}`);
      }
      judged.add(judgment?.criterionRef);
    }
    for (const criterionId of criteria) {
      if (!judged.has(criterionId)) addError(errors, `evaluations[${index}].judgments`, `missing Judgment for ${criterionId}`);
    }
    if (evaluation?.boundary?.proofGrantedByThisRecord !== false) {
      addError(errors, `evaluations[${index}].boundary.proofGrantedByThisRecord`, "Evaluation cannot grant Proof");
    }
    if (evaluation?.boundary?.authorityGrantedByThisRecord !== false) {
      addError(errors, `evaluations[${index}].boundary.authorityGrantedByThisRecord`, "Evaluation cannot grant authority");
    }
  }

  for (const [index, proof] of asArray(document?.proofAdjudications).entries()) {
    requireResolvedRefs(errors, records, proof?.targetRefs, `proofAdjudications[${index}].targetRefs`);
    requireResolvedRefs(errors, records, proof?.evidenceRefs, `proofAdjudications[${index}].evidenceRefs`);
    if (proof?.canonicalUpdateAuthorizedByThisRecord !== false) {
      addError(errors, `proofAdjudications[${index}].canonicalUpdateAuthorizedByThisRecord`, "Proof adjudication cannot authorize canonical Update");
    }
  }

  for (const [index, update] of asArray(document?.updates).entries()) {
    requireResolved(errors, records, update?.targetRef, `updates[${index}].targetRef`);
    for (const [proofIndex, ref] of asArray(update?.proofAdjudicationRefs).entries()) {
      if (!proofIds.has(ref)) addError(errors, `updates[${index}].proofAdjudicationRefs[${proofIndex}]`, `unresolved Proof adjudication ${ref}`);
    }
    if (["authorized", "applied"].includes(update?.status) && !isNonBlank(update?.authorizationEventRef)) {
      addError(errors, `updates[${index}].authorizationEventRef`, `${update.status} Update requires separate authorization`);
    }
    if (update?.status === "proposed" && isNonBlank(update?.authorizationEventRef)) {
      addError(errors, `updates[${index}].authorizationEventRef`, "proposed Update cannot claim authorization");
    }
  }

  for (const [index, relation] of asArray(document?.relations).entries()) {
    const fromKnown = records.has(relation?.fromRef);
    const toKnown = records.has(relation?.toRef);
    if (!fromKnown && !toKnown) {
      addError(errors, `relations[${index}]`, "at least one relation endpoint must belong to this package");
    }
  }

  for (const [index, policy] of asArray(document?.audiencePolicies).entries()) {
    requireResolvedRefs(errors, records, policy?.subjectRefs, `audiencePolicies[${index}].subjectRefs`);
    const authorized = ["authorized", "published"].includes(policy?.publicationStatus);
    if (authorized && (!isNonBlank(policy?.authorizationEventRef) || asArray(policy?.consentRefs).length === 0 || asArray(policy?.audienceRefs).length === 0)) {
      addError(errors, `audiencePolicies[${index}]`, "authorized publication requires authorization event, consent, and audience");
    }
    if (policy?.visibility === "public" && policy?.publicationStatus !== "published") {
      addError(errors, `audiencePolicies[${index}].visibility`, "public visibility requires published status");
    }
    if (policy?.publicationStatus === "published" && policy?.visibility !== "public") {
      addError(errors, `audiencePolicies[${index}].publicationStatus`, "published status requires public visibility");
    }
    if (policy?.publicationStatus === "not_authorized" && isNonBlank(policy?.authorizationEventRef)) {
      addError(errors, `audiencePolicies[${index}].authorizationEventRef`, "not-authorized policy cannot claim a publication authorization event");
    }
    if (["publish_candidate", "publish"].includes(policy?.disclosureIntent) && !["public_candidate", "public"].includes(policy?.visibility)) {
      addError(errors, `audiencePolicies[${index}].disclosureIntent`, "publication intent requires a public-candidate or public visibility state");
    }
  }

  const runtime = document?.runtimeBinding;
  if (runtime?.status === "active") {
    if (!isNonBlank(runtime?.agentRef) || asArray(runtime?.authorityGrantRefs).length === 0 || asArray(runtime?.activationReceiptRefs).length === 0) {
      addError(errors, "runtimeBinding", "active runtime requires Agent, authority grant, and activation receipt");
    }
    if (document?.lifecycleState !== "active") addError(errors, "lifecycleState", "active runtime requires active model lifecycle");
  }
  if (["none", "candidate", "sleeping"].includes(runtime?.status)) {
    if (asArray(runtime?.authorityGrantRefs).length > 0 || asArray(runtime?.activationReceiptRefs).length > 0) {
      addError(errors, "runtimeBinding", `${runtime.status} runtime cannot carry active authority or activation receipts`);
    }
  }
  if (document?.lifecycleState === "active" && runtime?.status !== "active") {
    addError(errors, "runtimeBinding.status", "active model lifecycle requires active runtime binding");
  }
  if (document?.lifecycleState === "retired" && runtime?.status !== "retired") {
    addError(errors, "runtimeBinding.status", "retired model lifecycle requires retired runtime binding");
  }
  for (const [index, ref] of asArray(runtime?.questionRefs).entries()) {
    if (!questionIds.has(ref)) addError(errors, `runtimeBinding.questionRefs[${index}]`, `unresolved Question ${ref}`);
  }

  const expectedTraversal = [
    "question",
    "position",
    "expression_provision",
    "projection",
    "move",
    "consequence",
    "evaluation",
    "proof_adjudication",
    "update",
    "question",
  ];
  if (JSON.stringify(document?.traversalView?.stageOrder) !== JSON.stringify(expectedTraversal)) {
    addError(errors, "traversalView.stageOrder", "default passage must preserve the typed recursive order");
  }
  if (document?.traversalView?.canonicalState !== false) {
    addError(errors, "traversalView.canonicalState", "passage is a View, not canonical state");
  }

  if (document?.boundary?.answerIsTruth !== false) addError(errors, "boundary.answerIsTruth", "Answer cannot be cast to truth");
  if (document?.boundary?.defaultTraversalIsOntology !== false) addError(errors, "boundary.defaultTraversalIsOntology", "default traversal cannot become ontology");
  if (document?.boundary?.connectionImportsTruthOrAuthority !== false) addError(errors, "boundary.connectionImportsTruthOrAuthority", "connection cannot import truth or authority");

  return errors;
}
