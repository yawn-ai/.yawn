import { canonicalSha256 } from "./delegated-execution-v1.mjs";

// Equality uses canonical JSON, not a digest: the finite partition is exact.
function canonical(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0)) return value;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!Object.hasOwn(value, i)) throw new TypeError("Sparse arrays are not supported");
    }
    return value.map(canonical);
  }
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  throw new TypeError("Only finite JSON values are supported");
}

const keyOf = (value) => JSON.stringify(canonical(value));
const lexical = (a, b) => a < b ? -1 : a > b ? 1 : 0;

function fieldList(fields) {
  if (!Array.isArray(fields) || Array.from(fields).some((field) => typeof field !== "string" || !field.length)
      || new Set(fields).size !== fields.length) throw new TypeError("Fields must be unique nonempty strings");
  return [...fields].sort(lexical);
}

export function projectState(attributes, fields) {
  if (!attributes || Object.getPrototypeOf(attributes) !== Object.prototype) throw new TypeError("Attributes must be a JSON object");
  canonical(attributes);
  return Object.fromEntries(fieldList(fields).map((field) => {
    if (!Object.hasOwn(attributes, field)) throw new TypeError(`Missing attribute: ${field}`);
    return [field, canonical(attributes[field])];
  }));
}

function partition(states, fields) {
  const groups = new Map();
  for (const state of states) {
    const visibleValue = projectState(state.attributes, fields);
    const key = keyOf(visibleValue);
    if (!groups.has(key)) groups.set(key, { visibleValue, members: [] });
    groups.get(key).members.push(state);
  }
  return [...groups].sort(([a], [b]) => lexical(a, b)).map(([, group]) => group);
}

function sufficient(states, fields, decisions) {
  return partition(states, fields).every(({ members }) =>
    members.every(({ id }) => decisions.get(id) === decisions.get(members[0].id)));
}

function witness(states, fields, decisions) {
  let best = null;
  for (const { members } of partition(states, fields)) {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const left = members[i], right = members[j];
        if (decisions.get(left.id) === decisions.get(right.id)) continue;
        const differingFields = Object.keys(left.attributes).sort(lexical)
          .filter((field) => keyOf(left.attributes[field]) !== keyOf(right.attributes[field]));
        const next = { leftStateRef: left.id, rightStateRef: right.id, differingFields };
        if (!best || differingFields.length < best.differingFields.length) best = next;
      }
    }
  }
  return best;
}

function combinations(fields, count, offset = 0, chosen = []) {
  if (chosen.length === count) return [chosen];
  const out = [];
  for (let i = offset; i <= fields.length - (count - chosen.length); i++) {
    out.push(...combinations(fields, count, i + 1, [...chosen, fields[i]]));
  }
  return out;
}

/** Exhaustive finite instrument. The caller supplies a pure reference evaluator;
 * this module neither interprets approval records nor executes any operation. */
export function analyzeProjection({ states, visibleFields, candidateFields, decide }) {
  const visible = fieldList(visibleFields), candidates = fieldList(candidateFields);
  if (visible.some((field) => candidates.includes(field))) throw new TypeError("Visible and candidate fields must be disjoint");
  if (!Array.isArray(states) || !states.length || states.length > 4096 || candidates.length > 16) {
    throw new RangeError("Finite instrument requires 1..4096 states and at most 16 candidate fields");
  }
  if (typeof decide !== "function") throw new TypeError("A reference evaluator is required");
  const ordered = states.map((state) => {
    if (!state || typeof state.id !== "string" || !state.id || !state.attributes
        || Object.getPrototypeOf(state.attributes) !== Object.prototype) throw new TypeError("Invalid state");
    return { id: state.id, attributes: canonical(state.attributes) };
  }).sort((a, b) => lexical(a.id, b.id));
  if (new Set(ordered.map(({ id }) => id)).size !== ordered.length) throw new TypeError("State IDs must be unique");
  const attributes = Object.keys(ordered[0].attributes).sort(lexical);
  for (const state of ordered) {
    if (keyOf(Object.keys(state.attributes).sort(lexical)) !== keyOf(attributes)) throw new TypeError("State attribute sets must agree");
    projectState(state.attributes, [...visible, ...candidates]);
  }
  // Exactly one reference evaluation per state, persisted by its stable ID.
  const decisions = new Map(ordered.map((state) => {
    const result = decide(structuredClone(state));
    if (!["executable", "blocked"].includes(result)) throw new TypeError("Invalid reference decision");
    return [state.id, result];
  }));
  const fibers = partition(ordered, visible).map(({ visibleValue, members }) => {
    const decisionValues = [...new Set(members.map(({ id }) => decisions.get(id)))].sort(lexical);
    const decisionState = decisionValues.length === 1 ? decisionValues[0] : "needs_refinement";
    let refinement = null;
    if (decisionState === "needs_refinement") {
      let allMinimumRefinements = [];
      for (let size = 1; size <= candidates.length; size++) {
        allMinimumRefinements = combinations(candidates, size)
          .filter((extra) => sufficient(members, [...visible, ...extra], decisions));
        if (allMinimumRefinements.length) break;
      }
      const canonicalRefinement = allMinimumRefinements[0] ?? [];
      refinement = {
        minimumCardinality: allMinimumRefinements.length ? canonicalRefinement.length : null,
        allMinimumRefinements,
        canonicalRefinement,
        necessityWitnesses: canonicalRefinement.map((field) => ({
          field,
          ...witness(members, [...visible, ...canonicalRefinement.filter((other) => other !== field)], decisions),
        })),
      };
    }
    return {
      visibleValue,
      stateRefs: members.map(({ id }) => id),
      decisionValues,
      decisionState,
      enforcementDisposition: decisionState === "executable" ? "allow" : "block",
      ambiguityWitness: decisionValues.length > 1 ? witness(members, visible, decisions) : null,
      refinement,
    };
  });
  return { globallySufficient: fibers.every(({ decisionState }) => decisionState !== "needs_refinement"), fibers };
}

export function receiptSha256(receipt) {
  const { replay: _replay, ...body } = receipt;
  return canonicalSha256(body);
}

/** Applicability does not erase a historically correct receipt. Integrity here
 * is consistency of bytes/structure, not a signature, truth, or authority. */
export function inspectReceiptApplicability(receipt, currentBindings) {
  try {
    canonical(receipt);
    const bindings = receipt.bindings;
    if (!bindings || !receipt.replay || receiptSha256(receipt) !== receipt.replay.receiptSha256) {
      return { decisionState: "invalid", enforcementDisposition: "block" };
    }
    const fields = ["stateSpaceSha256", "querySha256", "projectionSha256", "evaluatorSha256"];
    if (fields.some((field) => !/^[a-f0-9]{64}$/.test(bindings[field] ?? "")
      || !/^[a-f0-9]{64}$/.test(currentBindings?.[field] ?? ""))) {
      return { decisionState: "invalid", enforcementDisposition: "block" };
    }
    if (fields.some((field) => bindings[field] !== currentBindings[field])) {
      return { decisionState: "stale", enforcementDisposition: "block" };
    }
    if (!["executable", "blocked", "needs_refinement"].includes(receipt.result?.decisionState)
      || receipt.result.enforcementDisposition !== (receipt.result.decisionState === "executable" ? "allow" : "block")) {
      return { decisionState: "invalid", enforcementDisposition: "block" };
    }
    return { ...receipt.result };
  } catch {
    return { decisionState: "invalid", enforcementDisposition: "block" };
  }
}
