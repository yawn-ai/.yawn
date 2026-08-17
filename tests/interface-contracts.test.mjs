import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const brandPath = new URL("../interface/yawn-brand-v1.yawn", import.meta.url);
const chromePath = new URL("../interface/yawn-chrome-v1.yawn", import.meta.url);
const observationPath = new URL("../interface/yawn-observation-view-v1.yawn", import.meta.url);
const localArtPath = new URL("../interface/local-observation-art-v0.1.yawn", import.meta.url);

test("the public interface contracts preserve one canonical palette and quiet root shell", async () => {
  const [brand, chrome] = await Promise.all([
    readFile(brandPath, "utf8"),
    readFile(chromePath, "utf8"),
  ]);

  for (const color of [
    "#000000",
    "#181716",
    "#ffffff",
    "#e8ff03",
    "#2fe3f4",
    "#fd49ac",
    "#ff7300",
    "#64ff03",
  ]) {
    assert.match(brand, new RegExp(color));
  }

  assert.match(chrome, /public_root:/);
  assert.match(chrome, /public_view:/);
  assert.match(chrome, /member:/);
  assert.match(chrome, /desktop_height: 56px/);
  assert.match(chrome, /mobile_height: 52px/);
  assert.match(chrome, /github protocol link/);
  assert.match(chrome, /public-root simplicity supersedes universal expanded Public View header requirements/);
});

test("the observation View keeps one portable holon and attributed preference inheritance", async () => {
  const observation = await readFile(observationPath, "utf8");

  assert.match(observation, /holon_kind: observation_record/);
  assert.match(observation, /observation_valid_without_yawn: true/);
  assert.match(observation, /promotion_creates_distinct_yawn: true/);
  assert.match(observation, /primary_object_count: 1/);
  assert.match(observation, /system_defaults/);
  assert.match(observation, /principal_preferences/);
  assert.match(observation, /agent_space_preferences/);
  assert.match(observation, /arena_preferences/);
  assert.match(observation, /yawn_ancestry_preferences/);
  assert.match(observation, /observation_or_view_override/);
  assert.match(observation, /absence_distinct_from_explicit_reset: true/);
  assert.match(observation, /private_values_on_public_route: forbidden/);

  for (const node of ["source", "observation", "inference", "lacuna", "proof"]) {
    assert.match(observation, new RegExp(`- ${node}`));
  }

  assert.match(observation, /persistenceAuthorized: false/);
  assert.match(observation, /modelCallAuthorized: false/);
});

test("local observation art keeps Question, candidate, Projection, and View distinct", async () => {
  const contract = await readFile(localArtPath, "utf8");
  assert.match(contract, /organized_open_question_proposal/);
  assert.match(contract, /rendered_as_accessible_text: required/);
  assert.match(contract, /rendered_only_as_image_pixels: forbidden/);
  assert.match(contract, /reflective_agent_not_authority/);
  assert.match(contract, /candidate artifacts/);
  assert.match(contract, /displaying a candidate by an attributed Agent in a review Arena is a Projection/);
  assert.match(contract, /page composition and serialization are rebuildable Views/);
  assert.match(contract, /automatic_acceptance_or_publish_or_promotion: forbidden/);
});
