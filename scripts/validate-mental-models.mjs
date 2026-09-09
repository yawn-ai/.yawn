// Self-scan for dave/<slug>/ mental models: record <-> page <-> node coherence.
// Dependency-free on purpose. Fails closed on drift.
import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "dave");
const REQUIRED_KEYS = ["id", "kind", "principal_ref", "arena", "questions", "concept", "show", "embody", "assumptions", "proof", "lacunae", "sources"];
const TEMPLATE_KEYS = ["role", "relevance", "definition", "inside", "show", "assumptions", "proof", "lacuna"];
const errors = [];
const fail = (m) => errors.push(m);

const node = await readFile(path.join(DIR, "node.yawn"), "utf8");
const holds = [...(node.match(/^holds:\n((?:\s{2}-\s+\S+\n)+)/m) || ["", ""])[1].matchAll(/^\s{2}-\s+(\S+)\s*$/gm)].map((m) => m[1]);
const entries = (await readdir(DIR, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);

for (const slug of entries) if (!holds.includes(slug)) fail(`dave/node.yawn: holds is missing ${slug}`);
for (const slug of holds) if (!entries.includes(slug)) fail(`dave/node.yawn: holds ${slug} but dave/${slug}/ does not exist`);

for (const slug of entries) {
  const base = `dave/${slug}`;
  let record;
  try { record = await readFile(path.join(DIR, slug, "model.yawn"), "utf8"); } catch { fail(`${base}/model.yawn missing`); continue; }
  for (const key of REQUIRED_KEYS) if (!new RegExp(`^${key}:`, "m").test(record)) fail(`${base}/model.yawn: missing ${key}`);
  if (!/^kind:\s*mental-model\s*$/m.test(record)) fail(`${base}/model.yawn: kind must be mental-model`);
  const id = (record.match(/^id:\s*(\S+)/m) || [])[1];
  if (id !== `mental-model:dave:${slug}`) fail(`${base}/model.yawn: id must be mental-model:dave:${slug}`);
  const keys = [...record.matchAll(/^\s{2}-\s+key:\s*(\S+)/gm)].map((m) => m[1]);
  if (keys[0] !== "role") fail(`${base}/model.yawn: first question must be role`);
  if (keys[1] !== "relevance") fail(`${base}/model.yawn: second question must be relevance`);
  for (const k of TEMPLATE_KEYS) if (!keys.includes(k)) fail(`${base}/model.yawn: question ${k} missing`);
  if (!/falsifier:/.test(record)) fail(`${base}/model.yawn: proof needs a falsifier`);

  let html;
  try { html = await readFile(path.join(DIR, slug, "index.html"), "utf8"); } catch { fail(`${base}/index.html missing`); continue; }
  if (!html.includes(`data-model="${id}"`)) fail(`${base}/index.html: data-model must equal ${id}`);
  if (!html.includes('href="../../assets/site.css"')) fail(`${base}/index.html: must use assets/site.css`);
  if (/<style|<script|\sstyle=/.test(html)) fail(`${base}/index.html: no inline style, style attributes, or scripts; use global tokens`);
  const pageKeys = [...html.matchAll(/data-q="([^"]+)"/g)].map((m) => m[1]);
  if (pageKeys.join(",") !== keys.join(",")) fail(`${base}/index.html: data-q order ${pageKeys.join(",")} != record ${keys.join(",")}`);
  const glyphs = (record.match(/^\s+glyph:/gm) || []).length;
  if ((html.match(/class="glyph"/g) || []).length < glyphs) fail(`${base}/index.html: fewer glyphs than the record`);
  for (const rel of ["../", "../../"]) if (!html.includes(`href="${rel}"`)) fail(`${base}/index.html: missing link ${rel}`);
}

for (const f of ["dave/index.html", "templates/mental-model.yawn"]) {
  try { await access(path.join(ROOT, f)); } catch { fail(`missing ${f}`); }
}
const site = await readFile(path.join(ROOT, "sitemap.xml"), "utf8");
for (const slug of entries) if (!site.includes(`/dave/${slug}/`)) fail(`sitemap.xml: missing /dave/${slug}/`);

// Apertures under sophia/: door + game pages must stay bounded, unlisted, and tied to their record.
const SDIR = path.join(ROOT, "sophia");
const snode = await readFile(path.join(SDIR, "node.yawn"), "utf8");
const sholds = [...(snode.match(/^holds:\n((?:\s{2}-\s+\S+\n)+)/m) || ["", ""])[1].matchAll(/^\s{2}-\s+(\S+)\s*$/gm)].map((m) => m[1]);
const sdirs = (await readdir(SDIR, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
for (const slug of sdirs) if (!sholds.includes(slug)) fail(`sophia/node.yawn: holds is missing ${slug}`);
for (const slug of sholds) if (!sdirs.includes(slug)) fail(`sophia/node.yawn: holds ${slug} but sophia/${slug}/ does not exist`);
const hub = await readFile(path.join(ROOT, "index.html"), "utf8");
if (/href="[^"]*sophia\//.test(hub)) fail("index.html: the hub must not link into sophia/ apertures");
if (site.includes("/sophia/")) fail("sitemap.xml: sophia/ apertures are provisioned, never listed");
for (const slug of sdirs) {
  const base = `sophia/${slug}`;
  let ap;
  try { ap = await readFile(path.join(SDIR, slug, "aperture.yawn"), "utf8"); } catch { fail(`${base}/aperture.yawn missing`); continue; }
  const apId = (ap.match(/^id:\s*(\S+)/m) || [])[1];
  if (apId !== `aperture:sophia:${slug}`) fail(`${base}/aperture.yawn: id must be aperture:sophia:${slug}`);
  for (const key of ["kind", "principal_ref", "guardian_ref", "provisioned_to", "routes", "teaches", "notice", "chrome", "proof", "lacunae"]) if (!new RegExp(`^${key}:`, "m").test(ap)) fail(`${base}/aperture.yawn: missing ${key}`);
  const routes = [...ap.matchAll(/^\s{2}-\s+route:\s*(\S+)/gm)].map((m) => m[1]);
  if (!routes.length) fail(`${base}/aperture.yawn: no routes`);
  const teaches = [...ap.matchAll(/^\s{2}-\s+(mental-model:\S+)/gm)].map((m) => m[1]);
  for (const route of routes) {
    const file = path.join(SDIR, slug, route, "index.html");
    let html;
    try { html = await readFile(file, "utf8"); } catch { fail(`${base}/${route}/index.html missing`); continue; }
    if (!html.includes(`data-aperture="${apId}"`)) fail(`${base}/${route}: data-aperture must equal ${apId}`);
    if (!/<meta name="robots" content="noindex, nofollow">/.test(html)) fail(`${base}/${route}: must be noindex, nofollow`);
    if (!/assets\/site\.css/.test(html)) fail(`${base}/${route}: must use assets/site.css`);
    if (/<script src=|<link[^>]+href="https?:/.test(html)) fail(`${base}/${route}: no external scripts or stylesheets`);
    if (!html.includes('href="https://yawn.bot/lacuna"')) fail(`${base}/${route}: every aperture surface keeps the lacuna door`);
    if (route.endsWith("game")) {
      for (const t of teaches) if (!html.includes(t)) fail(`${base}/${route}: data-teaches must name ${t}`);
      if (!/id="notice"/.test(html)) fail(`${base}/${route}: the game needs its notice`);
      const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !h.startsWith("#") && !h.includes("assets/site.css"));
      const allowed = links.every((h) => h === "../" || h === "https://yawn.bot/lacuna");
      if (!allowed) fail(`${base}/${route}: the only ways out are ../ and the lacuna: ${links.join(" ")}`);
    }
  }
}

if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(`Mental models coherent: ${entries.length} model(s) under dave/, ${sdirs.length} aperture(s) under sophia/.`);
