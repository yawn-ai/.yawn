#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";

import { compileNewYawnWorkbenchView } from "./compile-new-yawn-workbench-v0.1.mjs";

const DEFAULT_EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  "node_modules",
  ".turbo",
]);

function usage() {
  console.error(
    "Usage: node scripts/backfill-new-yawn-workbench-v0.1.mjs [--source-root <dir>] [--out <dir>] [--limit <n>] [--root-coordinate <coordinate>]",
  );
  console.error("Without --out the compiler performs a dry run and prints only the summary.");
  process.exit(2);
}

function parseArgs(argv) {
  const args = {
    sourceRoot: ".",
    out: null,
    limit: Number.POSITIVE_INFINITY,
    rootCoordinate: "yawn.bot/draft",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source-root") args.sourceRoot = argv[++index] ?? args.sourceRoot;
    else if (arg === "--out") args.out = argv[++index] ?? null;
    else if (arg === "--limit") {
      const value = Number(argv[++index]);
      if (!Number.isSafeInteger(value) || value < 1) throw new Error("--limit must be a positive integer");
      args.limit = value;
    } else if (arg === "--root-coordinate") args.rootCoordinate = argv[++index] ?? args.rootCoordinate;
    else if (arg === "--help" || arg === "-h") usage();
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

async function collectYawnFiles(root, excludedOutput) {
  const files = [];

  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (DEFAULT_EXCLUDED_DIRECTORIES.has(entry.name)) continue;
        if (excludedOutput && resolve(path) === excludedOutput) continue;
        await walk(path);
      } else if (entry.isFile() && entry.name.endsWith(".yawn")) {
        files.push(path);
      }
    }
  }

  await walk(root);
  return files;
}

function summarize(views) {
  const levels = {};
  const cells = {};
  for (const view of views) {
    const level = String(view.orientationResolutionLevel);
    levels[level] = (levels[level] ?? 0) + 1;
    for (const cell of view.cells) {
      cells[cell.cellKey] ??= {};
      cells[cell.cellKey][cell.status] = (cells[cell.cellKey][cell.status] ?? 0) + 1;
    }
  }
  return {
    recordCount: views.length,
    canonicalWrites: 0,
    graphMutations: 0,
    providerConnections: 0,
    authorityGrants: 0,
    externalEffects: 0,
    levelDistribution: levels,
    cellStatusDistribution: cells,
  };
}

export async function backfillNewYawnWorkbenchViews({
  sourceRoot = ".",
  out = null,
  limit = Number.POSITIVE_INFINITY,
  rootCoordinate = "yawn.bot/draft",
} = {}) {
  const absoluteRoot = resolve(sourceRoot);
  const absoluteOut = out ? resolve(out) : null;
  const paths = await collectYawnFiles(absoluteRoot, absoluteOut);
  const selected = paths.slice(0, limit);
  const views = [];

  for (const path of selected) {
    const raw = await readFile(path, "utf8");
    const sourcePath = relative(absoluteRoot, path).split(sep).join("/");
    views.push(compileNewYawnWorkbenchView(raw, sourcePath, rootCoordinate));
  }

  const summary = summarize(views);
  const manifest = {
    schemaVersion: "yawn.new-yawn-coordinate-workbench-backfill.v0.1",
    canonicalState: false,
    projectionStatus: "proposed",
    compilerVersion: "yawn.new-yawn-workbench-compiler.v0.1",
    sourceRoot: absoluteRoot,
    rootCoordinate,
    ...summary,
    records: views.map((view) => ({
      viewId: view.viewId,
      source: view.source,
      draftCoordinate: view.draftIdentity.coordinate,
      orientationResolutionLevel: view.orientationResolutionLevel,
    })),
  };

  if (absoluteOut) {
    if (absoluteOut === absoluteRoot || absoluteRoot.startsWith(`${absoluteOut}${sep}`)) {
      throw new Error("Output directory cannot be the source root or an ancestor of it.");
    }
    await rm(absoluteOut, { recursive: true, force: true });
    await mkdir(join(absoluteOut, "views"), { recursive: true });

    for (const view of views) {
      const id = createHash("sha256").update(view.viewId).digest("hex").slice(0, 24);
      await writeFile(join(absoluteOut, "views", `${id}.json`), `${JSON.stringify(view, null, 2)}\n`);
    }
    await writeFile(join(absoluteOut, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  }

  return { manifest, views };
}

async function runCli() {
  const args = parseArgs(process.argv.slice(2));
  const { manifest } = await backfillNewYawnWorkbenchViews(args);
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedPath === import.meta.url) {
  await runCli();
}
