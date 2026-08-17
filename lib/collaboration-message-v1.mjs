const defaultActorHandles = new Map([
  ["user:dave", "@dave"],
  ["agent:openai:codex", "@codex"],
  ["agent:anthropic:claude-code", "@claude"],
]);

export function attributionErrors(message, { actorHandles = defaultActorHandles } = {}) {
  const errors = [];
  const expectedHandle = actorHandles.get(message?.sender?.actorId);
  if (!expectedHandle) errors.push("sender_not_registered");
  else if (expectedHandle !== message?.sender?.handle) errors.push("sender_handle_mismatch");
  return errors;
}

export function evaluateMessageAuthority(message, {
  actorHandles = defaultActorHandles,
  rightfulGrantorActorId = message?.authority?.rightfulGrantorActorId,
} = {}) {
  const attribution = attributionErrors(message, { actorHandles });
  const isRightfulGrantorDecision = message?.sender?.actorId === rightfulGrantorActorId
    && message?.speechAct === "decision"
    && message?.authority?.grantorDecisionRecorded === true;
  return {
    attributable: attribution.length === 0,
    canonicalizable: attribution.length === 0
      && isRightfulGrantorDecision
      && message?.authority?.canonicalMutationAuthorized === true,
    externalEffectAuthorized: attribution.length === 0
      && isRightfulGrantorDecision
      && message?.authority?.externalEffectsAuthorized === true,
    blockers: [
      ...attribution,
      ...(!isRightfulGrantorDecision ? ["rightful_grantor_decision_missing"] : []),
    ],
  };
}
