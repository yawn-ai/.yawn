import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_YAWN_EXTENSION,
  CANONICAL_YAWN_PRODUCT,
  assertCanonicalYawnPath,
  normalizeYawnLexemes,
} from "../lib/canonical-extension-v1.mjs";

test("exposes one canonical product and extension", () => {
  assert.equal(CANONICAL_YAWN_PRODUCT, "YAWN");
  assert.equal(CANONICAL_YAWN_EXTENSION, ".yawn");
});

test("normalizes dotted and spoken extension substitutions in established YAWN context", () => {
  // yawn-invalid-alias-guard:start
  const result = normalizeYawnLexemes(
    "Import the .ion file, then create a dot yon schema.",
    { yawnContext: true },
  );
  // yawn-invalid-alias-guard:end

  assert.equal(result.normalizedInput, "Import the .yawn file, then create a .yawn schema.");
  assert.equal(result.changed, true);
  assert.equal(result.rawInput.includes(".ion"), true);
  assert.ok(result.corrections.length >= 2);
});

test("normalizes bare extension nouns without consuming separators", () => {
  // yawn-invalid-alias-guard:start
  const result = normalizeYawnLexemes(
    "Import the ion file, then create a yon schema.",
    { yawnContext: true },
  );
  // yawn-invalid-alias-guard:end

  const replacementCount = result.corrections.reduce(
    (total, correction) => total + correction.replacements,
    0,
  );

  assert.equal(result.normalizedInput, "Import the .yawn file, then create a .yawn schema.");
  assert.equal(replacementCount, 2);
});

test("normalizes product hosts and product nouns", () => {
  // yawn-invalid-alias-guard:start
  const result = normalizeYawnLexemes(
    "Send the Yon protocol to yon.bot and inspect it on ion.ai.",
    { yawnContext: true },
  );
  // yawn-invalid-alias-guard:end

  assert.equal(result.normalizedInput, "Send the YAWN protocol to YAWN.bot and inspect it on YAWN.ai.");
});

test("preserves similar ordinary language outside YAWN context", () => {
  const chemistry = "A sodium ion channel opened.";
  const person = "Yon reviewed the document.";

  assert.equal(normalizeYawnLexemes(chemistry, { yawnContext: false }).normalizedInput, chemistry);
  assert.equal(normalizeYawnLexemes(person, { yawnContext: false }).normalizedInput, person);
});

test("does not rewrite a chemical use merely because YAWN context is enabled", () => {
  const chemistry = "A sodium ion channel opened.";
  assert.equal(normalizeYawnLexemes(chemistry, { yawnContext: true }).normalizedInput, chemistry);
});

test("preserves the raw transcript and records every correction", () => {
  // yawn-invalid-alias-guard:start
  const rawInput = "The .yon record belongs in ion.bot.";
  // yawn-invalid-alias-guard:end
  const result = normalizeYawnLexemes(rawInput, { yawnContext: true });

  assert.equal(result.rawInput, rawInput);
  assert.equal(result.normalizedInput, "The .yawn record belongs in YAWN.bot.");
  assert.equal(result.contextApplied, true);
  assert.equal(result.corrections.length, 2);
});

test("rejects invalid record paths", () => {
  assert.equal(assertCanonicalYawnPath("dave/arena.yawn"), "dave/arena.yawn");

  // yawn-invalid-alias-guard:start
  assert.throws(() => assertCanonicalYawnPath("dave/arena.ion"));
  assert.throws(() => assertCanonicalYawnPath("dave/arena.yon"));
  // yawn-invalid-alias-guard:end
});
