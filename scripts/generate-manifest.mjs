// Keep yawn.yawn's link tables complete against the filesystem.
// Dependency-free on purpose. `--check` fails closed; `--write` appends what is missing.
//
// Why this exists. yawn.yawn is the machine-addressable manifest, and it was
// hand-maintained. On 2026-09-12 it was dated two days AFTER readme.yawn and
// still lacked observation.v1 and question-proposal.v1 in schema_links, and
// several records/ files in record_links. An agent landing here reads the
// manifest first and gets a stale map. The filesystem is the source of truth
// for MEMBERSHIP; this script makes the manifest agree with it.
//
// What it deliberately does not do: it never rewrites or removes an existing
// entry. Hand-chosen keys (core_loop, legacy_automation_loop_alias) and the
// keys other tests read by name (record_links.interception_*) stay exactly as
// they are. It only appends missing files, with a derived key, at the end of
// the block they belong to, and it fails on any path that no longer exists so
// a dead link is fixed by a person rather than silently dropped.
import { readFile, writeFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "yawn.yawn");
const WRITE = process.argv.includes("--write");

// block -> which files must appear in it. node.yawn files belong to
// folder_node_links; everything else in a folder belongs to its folder block.
const BLOCKS = {
  core_links:             { dirs: ["core"],             exts: [".yawn"] },
  schema_links:           { dirs: ["schemas"],          exts: [".json"] },
  spec_links:             { dirs: ["spec"],             exts: [".md"] },
  shape_links:            { dirs: ["shape"],            exts: [".yawn"] },
  start_links:            { dirs: ["start"],            exts: [".yawn"] },
  interface_links:        { dirs: ["interface"],        exts: [".yawn"] },
  question_links:         { dirs: ["questions"],        exts: [".yawn"] },
  observation_links:      { dirs: ["observations"],     exts: [".yawn"] },
  automation_links:       { dirs: ["automation"],       exts: [".yawn"] },
  record_links:           { dirs: ["records"],          exts: [".yawn"] },
  question_packet_links:  { dirs: ["question-packets"], exts: [".yawn"] },
  template_links:         { dirs: ["templates"],        exts: [".yawn"] },
  example_links:          { dirs: ["examples"],         exts: [".yawn"] },
  fixture_links:          { dirs: ["fixtures"],         exts: [".json"] },
  agent_links:            { dirs: ["agents"],           exts: [".yawn"] },
  reference_links:        { dirs: ["references"],       exts: [".yawn"] },
  migration_links:        { dirs: ["migrations"],       exts: [".yawn"] },
  decision_links:         { dirs: ["decisions"],        exts: [".yawn"], after: "migration_links" },
  dave_links:             { dirs: ["dave"],             exts: [".yawn"], recursive: true, after: "decision_links" },
};
const NODE_BLOCK = "folder_node_links";

const SKIP_DIRS = new Set(["node_modules", "build", "output", "backup", ".git"]);

async function listFiles(dir, exts, recursive) {
  const abs = path.join(ROOT, dir);
  let entries;
  try { entries = await readdir(abs, { withFileTypes: true }); } catch { return []; }
  const out = [];
  for (const e of entries) {
    if (e.isDirectory()) { if (recursive && !SKIP_DIRS.has(e.name)) out.push(...(await listFiles(path.join(dir, e.name), exts, true))); continue; }
    if (exts.some((x) => e.name.endsWith(x))) out.push(path.join(dir, e.name).split(path.sep).join("/"));
  }
  return out.sort();
}

function deriveKey(rel, taken) {
  let base = path.basename(rel).replace(/\.(yawn|json|md)$/, "").replace(/\.schema$/, "");
  base = base.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/-\d{4}-\d{2}-\d{2}$/, "");
  if (rel.startsWith("dave/") && base === "model") base = path.basename(path.dirname(rel));
  let key = base.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
  if (/^\d/.test(key)) key = "r_" + key;
  let k = key, n = 2;
  while (taken.has(k)) k = `${key}_${n++}`;
  return k;
}

function parseBlock(lines, name) {
  const start = lines.findIndex((l) => l === `${name}:`);
  if (start < 0) return null;
  let end = start + 1;
  const entries = new Map();
  while (end < lines.length && (/^\s+\S/.test(lines[end]) || lines[end].trim() === "")) {
    const m = lines[end].match(/^\s+([A-Za-z0-9_]+):\s*(\S+)\s*$/);
    if (m) entries.set(m[1], m[2]);
    if (lines[end].trim() === "" && end + 1 < lines.length && /^\S/.test(lines[end + 1])) break;
    end++;
  }
  // trim trailing blank lines from the block span
  while (end > start + 1 && lines[end - 1].trim() === "") end--;
  return { start, end, entries };
}

const lines = (await readFile(MANIFEST, "utf8")).split("\n");
const problems = [];
const additions = [];

// 1. every existing link path must resolve (dead links are a person's job)
for (const l of lines) {
  const m = l.match(/^\s+[A-Za-z0-9_]+:\s*([A-Za-z0-9_./-]+\.(?:yawn|json|md|cff))\s*$/);
  if (!m) continue;
  try { await access(path.join(ROOT, m[1])); } catch { problems.push(`dead link: ${m[1]}`); }
}

// 2. every folder-backed block must contain every file in its folder
const plan = []; // {name, after, newLines[]}
for (const [name, cfg] of Object.entries(BLOCKS)) {
  const files = [];
  for (const d of cfg.dirs) files.push(...(await listFiles(d, cfg.exts, !!cfg.recursive)));
  const wanted = files.filter((f) => path.basename(f) !== "node.yawn");
  const block = parseBlock(lines, name);
  const have = new Set(block ? [...block.entries.values()] : []);
  const taken = new Set(block ? [...block.entries.keys()] : []);
  const missing = wanted.filter((f) => !have.has(f));
  if (!missing.length) continue;
  const newLines = missing.map((f) => { const k = deriveKey(f, taken); taken.add(k); additions.push(`${name}.${k}: ${f}`); return `  ${k}: ${f}`; });
  plan.push({ name, after: cfg.after, newLines, exists: !!block });
}
// 3. every */node.yawn must be in folder_node_links
{
  const nodes = (await listFiles(".", [".yawn"], true)).filter((f) => path.basename(f) === "node.yawn" && f !== "node.yawn");
  const block = parseBlock(lines, NODE_BLOCK);
  const have = new Set(block ? [...block.entries.values()] : []);
  const taken = new Set(block ? [...block.entries.keys()] : []);
  const missing = nodes.filter((f) => !have.has(f));
  if (missing.length) {
    const newLines = missing.map((f) => {
      let k = path.dirname(f).replace(/^\.\//, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
      let kk = k, n = 2; while (taken.has(kk)) kk = `${k}_${n++}`; taken.add(kk);
      additions.push(`${NODE_BLOCK}.${kk}: ${f}`); return `  ${kk}: ${f}`;
    });
    plan.push({ name: NODE_BLOCK, newLines, exists: !!block });
  }
}

if (problems.length) { console.error(problems.join("\n")); process.exitCode = 1; }

if (!plan.length) {
  if (!problems.length) console.log("[manifest] yawn.yawn is complete against the filesystem");
} else if (!WRITE) {
  console.error(`[manifest] yawn.yawn is missing ${additions.length} link(s); run: node scripts/generate-manifest.mjs --write`);
  for (const a of additions) console.error(`  + ${a}`);
  process.exitCode = 1;
} else {
  // apply: append inside existing blocks; create new blocks after their anchor
  let out = [...lines];
  for (const p of plan) {
    const block = parseBlock(out, p.name);
    if (block) { out.splice(block.end, 0, ...p.newLines); continue; }
    const anchor = parseBlock(out, p.after) ?? parseBlock(out, "migration_links");
    const at = anchor ? anchor.end : out.length;
    out.splice(at, 0, "", `${p.name}:`, ...p.newLines);
  }
  await writeFile(MANIFEST, out.join("\n"));
  console.log(`[manifest] wrote ${additions.length} link(s) into yawn.yawn:`);
  for (const a of additions) console.log(`  + ${a}`);
}
