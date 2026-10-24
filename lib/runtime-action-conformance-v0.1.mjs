import { canonicalJson } from "./state-substrate-v1.mjs";

// Synthetic offline corpus adapter. This is deliberately not an authenticated
// registry, grant store, budget service, cancellation fence or production host.
export function syntheticConformanceHost(snapshot) {
  const data = structuredClone(snapshot);
  const raw = ({ origin_id, origin_revision, ...item }) => item;
  const matches = (collection, item, profile) => (data[collection] ?? []).some((entry) =>
    entry.profile_id === profile.id && canonicalJson(entry.item) === canonicalJson(raw(item)));
  const actionCheck = (collection, action) => (data[collection] ?? []).find((entry) => entry.action_id === action.id)?.allowed === true;
  return {
    programs: data.programs,
    supportedHandlers: data.supported_handlers,
    dynamic: data.dynamic,
    verifyAdoption: (rule, profile) => matches("adoptions", rule, profile),
    verifySkill: (skill, profile) => matches("skills", skill, profile),
    verifyCapability: (capability, profile) => matches("capabilities", capability, profile),
    evaluateRule: (rule, action) => (data.rule_checks ?? []).some((entry) => entry.action_id === action.id && entry.rule_id === rule.id && entry.profile_id === rule.origin_id && entry.allowed === true),
    checkGrant: (action, capabilities) => (data.grants ?? []).some((entry) => entry.action_id === action.id && entry.allowed === true && canonicalJson([...entry.capability_ids].sort()) === canonicalJson(capabilities.map(({ id }) => id).sort())),
    checkBudget: (action) => actionCheck("budgets", action),
    checkCancellation: (action) => actionCheck("cancellations", action),
  };
}
