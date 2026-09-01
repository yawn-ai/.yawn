#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";

const CELL_DEFINITIONS = [
  ["identity", ["scope", "perspective", "principal", "coordinate"]],
  ["intelligence", ["provider_binding", "delegate_relationship", "capability", "provenance"]],
  ["relationship", ["placement", "perspective", "relationship"]],
  ["arena", ["placement", "current-state", "arena", "horizon"]],
  ["state", ["current-state"]],
  ["purpose", ["intent", "objective_candidate"]],
  ["lacuna", ["lacuna"]],
  ["boundary", ["boundary", "authority"]],
  ["movement", ["movement", "affordance", "candidate_move"]],
  ["proof", ["proof", "consequence", "update"]],
];

const PATTERNS = {
  relationship: /\b(with|wife|husband|partner|friend|family|team|customer|client|parent|child|relationship|between)\b/i,
  arena: /\b(at|in|within|home|work|company|project|market|frontier|school|community|system|world)\b/i,
  purpose: /\b(want|need|goal|purpose|trying|should|must|protect|learn|build|create|make|become)\b/i,
  lacuna: /\?|\b(unknown|unclear|missing|don't know|do not know|not sure|confus|gap|lacuna|wonder)\b/i,
  boundary: /\b(consent|permission|privacy|private|public|budget|limit|must not|cannot|can't|forbidden|authority|safe|risk)\b/i,
  movement: /\b(build|create|make|ship|research|learn|fix|implement|ask|wait|leave|test|try|connect|organize|map|start|stop)\b/i,
  proof: /\b(proof|prove|test|measure|verify|evidence|done|success|result|outcome|know when|falsif)\b/i,
};

function usage() {
  console.error("Usage: node scripts/compile-new-yawn-workbench-v0.1.mjs --source <file> [--root yawn.bot/draft]");
  process.exit(2);
}

function parseArgs(argv) {
  const parsed = { source: null, root: "yawn.bot/draft" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source") parsed.source = argv[++index] ?? null;
    else if (arg === "--root") parsed.root = argv[++index] ?? parsed.root;
    else if (arg === "--help" || arg === "-h") usage();
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!parsed.source) usage();
  return parsed;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { fields: {}, body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { fields: {}, body: raw };
  const header = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const fields = {};
  for (const line of header.split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    fields[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
  return { fields, body };
}

function compact(value, max = 220) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 7)
    .join("-") || "untitled";
}

function sourceStatus(id, text, fields) {
  if (id === "identity") return fields.coordinate || text.trim() ? "proposed" : "missing";
  if (id === "state") return text.trim() ? "proposed" : "missing";
  if (id === "intelligence") {
    const binding = fields.provider_binding || fields.provider || fields.recorded_by;
    return binding ? "proposed" : "unknown";
  }
  return PATTERNS[id]?.test(text) ? "proposed" : "missing";
}

function compile(raw, sourcePath, root) {
  const { fields, body } = parseFrontmatter(raw);
  const exactSource = body.trim() || raw.trim();
  const labelSource = fields.title || exactSource.split(/[\n.!?]/)[0] || "Untitled Yawn";
  const draftCoordinate = fields.coordinate || `${root.replace(/\/+$/, "")}/${slugify(labelSource)}`;
  const cells = CELL_DEFINITIONS.map(([cellKey, mapsTo]) => ({
    cellKey,
    mapsTo,
    status: sourceStatus(cellKey, exactSource, fields),
    assertedBy: fields.actor || fields.recorded_by || "system:unknown",
    epistemicStatus: fields.epistemic_status || "inferred",
    sourceExcerpt: exactSource ? compact(exactSource) : null,
  }));
  const representedBeyondIdentity = cells.filter(
    (cell) => cell.cellKey !== "identity" && !["missing", "unknown"].includes(cell.status),
  ).length;
  const resolutionLevel = Math.max(1, Math.min(10, 1 + representedBeyondIdentity));
  const sourceSha256 = createHash("sha256").update(raw).digest("hex");
  const compilerVersion = "yawn.new-yawn-workbench-compiler.v0.1";
  const viewId = `view:${createHash("sha256")
    .update(`${sourcePath}\n${sourceSha256}\n${compilerVersion}`)
    .digest("hex")
    .slice(0, 24)}`;

  return {
    schemaVersion: "yawn.new-yawn-coordinate-workbench-view.v0.1",
    canonicalState: false,
    projectionStatus: "proposed",
    compilerVersion,
    viewId,
    source: { path: sourcePath, sha256: sourceSha256 },
    draftIdentity: {
      name: compact(labelSource, 100),
      coordinate: draftCoordinate,
      lifecycle: fields.lifecycle_status || "local_draft",
      principalStatus: fields.principal || fields.actor || "unknown",
    },
    orientationResolutionLevel: resolutionLevel,
    cells,
    boundaries: {
      persistence: false,
      graphMutation: false,
      providerConnection: false,
      authorityGrant: false,
      externalEffects: false,
    },
  };
}

const args = parseArgs(process.argv.slice(2));
const raw = await readFile(args.source, "utf8");
process.stdout.write(`${JSON.stringify(compile(raw, args.source, args.root), null, 2)}\n`);
