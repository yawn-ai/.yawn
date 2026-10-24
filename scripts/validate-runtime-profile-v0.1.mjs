import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRuntimeProfile } from "../lib/runtime-profile-v0.1.mjs";

// Shape/data conformance only. This command has no trusted authority or skill
// store and deliberately does not provide permissive host verification hooks.
const root = fileURLToPath(new URL("../", import.meta.url));
const paths = process.argv.slice(2);
let count = 0;
if (paths.length) {
  for (const path of paths) {
    parseRuntimeProfile(await readFile(resolve(path), "utf8"));
    count++;
  }
} else {
  const fixture = JSON.parse(await readFile(resolve(root, "fixtures/runtime-profile.v0.1.json"), "utf8"));
  for (const profile of fixture.profiles) {
    parseRuntimeProfile(JSON.stringify(profile));
    count++;
  }
  parseRuntimeProfile(await readFile(resolve(root, "templates/runtime-profile.yawn"), "utf8"));
  count++;
}
console.log(`Runtime Profile 0.1: ${count} data/shape checks passed; authority and execution are not established.`);
