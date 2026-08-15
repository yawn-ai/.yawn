import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contractUrl = new URL("../interface/local-observation-art-v0.1.yawn", import.meta.url);
const interfaceIndexUrl = new URL("../interface/node.yawn", import.meta.url);
const readmeUrl = new URL("../README.md", import.meta.url);

test("local observation art keeps observation, intention, projection, and consequence distinct", async () => {
  const contract = await readFile(contractUrl, "utf8");

  for (const required of [
    "what_arrived",
    "visual_intention",
    "rendered_projection",
    "observed_consequence",
    "generated imagery never backfills what_arrived",
  ]) {
    assert.match(contract, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("rendering requires a bounded local grant and cannot promote itself", async () => {
  const contract = await readFile(contractUrl, "utf8");

  assert.match(contract, /issued_through: explicit-user-action/);
  assert.match(contract, /external_network_egress: false/);
  assert.match(contract, /canonical_state_mutation: false/);
  assert.match(contract, /automatic_promotion: false/);
  assert.match(contract, /required_separate_approval:/);
});

test("ComfyUI and Phaser remain adapters over the same hashed proposal", async () => {
  const contract = await readFile(contractUrl, "utf8");

  assert.match(contract, /comfyui_candidate_adapter:/);
  assert.match(contract, /origin: server-configured-loopback-only/);
  assert.match(contract, /never duplicate a known prompt id/);
  assert.match(contract, /phaser_projection:/);
  assert.match(contract, /role: presentation-only/);
  assert.match(contract, /become another graph or state store/);
});

test("the proposed contract is reachable from the interface index and README", async () => {
  const [interfaceIndex, readme] = await Promise.all([
    readFile(interfaceIndexUrl, "utf8"),
    readFile(readmeUrl, "utf8"),
  ]);

  assert.match(interfaceIndex, /interface\/local-observation-art-v0\.1\.yawn/);
  assert.match(readme, /Local observation-art contract/);
});
