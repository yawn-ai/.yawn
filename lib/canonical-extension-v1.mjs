export const CANONICAL_YAWN_PRODUCT = "YAWN";
export const CANONICAL_YAWN_EXTENSION = ".yawn";

// These are transcription aliases only inside an already-established YAWN context.
// yawn-invalid-alias-guard:start
export const INVALID_YAWN_SCHEMA_ALIASES = Object.freeze([".ion", ".yon"]);
export const INVALID_YAWN_PRODUCT_ALIASES = Object.freeze(["ION", "Yon"]);
// yawn-invalid-alias-guard:end

const replacementRules = Object.freeze([
  { id: "product-host-ai", pattern: /\b(?:ion|yon)\.ai\b/giu, replacement: "YAWN.ai" },
  { id: "product-host-bot", pattern: /\b(?:ion|yon)\.bot\b/giu, replacement: "YAWN.bot" },
  { id: "dotted-extension", pattern: /\.(?:ion|yon)\b/giu, replacement: CANONICAL_YAWN_EXTENSION },
  { id: "spoken-dot-extension", pattern: /\bdot\s+(?:ion|yon)\b/giu, replacement: CANONICAL_YAWN_EXTENSION },
  {
    id: "schema-noun-extension",
    pattern: /\b(?:ion|yon)\s+(?=(?:file|files|schema|schemas|record|records|format|formats|extension|extensions)\b)/giu,
    replacement: CANONICAL_YAWN_EXTENSION,
  },
  {
    id: "product-noun",
    pattern: /\b(?:ion|yon)\s+(?=(?:protocol|protocols|platform|platforms|system|systems|app|apps|ai|bot)\b)/giu,
    replacement: CANONICAL_YAWN_PRODUCT,
  },
]);

function applyRule(value, rule) {
  let count = 0;
  const normalized = value.replace(rule.pattern, () => {
    count += 1;
    return rule.replacement;
  });
  return { normalized, count };
}

/**
 * Normalize common speech-to-text substitutions for YAWN naming.
 * The caller MUST establish YAWN context first.
 */
export function normalizeYawnLexemes(rawInput, { yawnContext = false } = {}) {
  if (typeof rawInput !== "string") throw new TypeError("rawInput must be a string");

  if (!yawnContext) {
    return Object.freeze({
      rawInput,
      normalizedInput: rawInput,
      changed: false,
      corrections: Object.freeze([]),
      contextApplied: false,
    });
  }

  let normalizedInput = rawInput;
  const corrections = [];

  for (const rule of replacementRules) {
    const result = applyRule(normalizedInput, rule);
    normalizedInput = result.normalized;
    if (result.count > 0) {
      corrections.push(Object.freeze({ ruleId: rule.id, replacements: result.count }));
    }
  }

  const trimmed = normalizedInput.trim();
  if (/^(?:ion|yon)$/iu.test(trimmed)) {
    const index = normalizedInput.indexOf(trimmed);
    normalizedInput = `${normalizedInput.slice(0, index)}${CANONICAL_YAWN_PRODUCT}${normalizedInput.slice(index + trimmed.length)}`;
    corrections.push(Object.freeze({ ruleId: "standalone-product-name", replacements: 1 }));
  }

  return Object.freeze({
    rawInput,
    normalizedInput,
    changed: normalizedInput !== rawInput,
    corrections: Object.freeze(corrections),
    contextApplied: true,
  });
}

export function assertCanonicalYawnPath(path) {
  if (typeof path !== "string" || path.length === 0) {
    throw new TypeError("path must be a non-empty string");
  }

  // yawn-invalid-alias-guard:start
  if (/\.(?:ion|yon)$/iu.test(path)) {
    throw new Error(`Invalid YAWN record extension in path: ${path}`);
  }
  // yawn-invalid-alias-guard:end

  return path;
}
