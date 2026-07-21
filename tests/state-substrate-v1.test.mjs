import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { canonicalJson, createStateUpdate, hashCanonical, normalizeLegacyYawn, reduceAuthorizedEvents } from "../lib/state-substrate-v1.mjs";

const loadFixture = async (name) => JSON.parse(await readFile(new URL(`../fixtures/${name}`, import.meta.url), "utf8"));

test("canonical serialization and replay hashes are deterministic", () => {
  assert.equal(canonicalJson({ b: 2, a: { d: 4, c: 3 } }), canonicalJson({ a: { c: 3, d: 4 }, b: 2 }));
  assert.equal(hashCanonical({ b: 2, a: 1 }), hashCanonical({ a: 1, b: 2 }));
});

test("only authorized events update canonical materialized state", () => {
  const events = [
    {schemaVersion:1,eventId:"event:2",eventCursor:2,eventType:"snapshot.proposed",occurredAt:"2026-07-21T00:00:00Z",actorRef:"agent:yawn",authorityStatus:"proposed",sourceRefs:["source:v1"],evidenceRefs:[],payload:{operation:"set_snapshot",snapshotRef:"snapshot:unauthorized"}},
    {schemaVersion:1,eventId:"event:1",eventCursor:1,eventType:"source.attached",occurredAt:"2026-07-21T00:00:00Z",actorRef:"principal:dave",authorityStatus:"authorized",sourceRefs:["source:v1"],evidenceRefs:[],payload:{operation:"add_source",sourceRef:"source:v1"}},
    {schemaVersion:1,eventId:"event:3",eventCursor:3,eventType:"claim.accepted",occurredAt:"2026-07-21T00:00:00Z",actorRef:"principal:dave",authorityStatus:"authorized",sourceRefs:["source:v1"],evidenceRefs:[],payload:{operation:"accept_empirical_claim",claimRef:"claim:no-evidence"}},
    {schemaVersion:1,eventId:"event:4",eventCursor:4,eventType:"claim.accepted",occurredAt:"2026-07-21T00:00:00Z",actorRef:"principal:dave",authorityStatus:"authorized",sourceRefs:["source:v1"],evidenceRefs:["proof:v1"],payload:{operation:"accept_empirical_claim",claimRef:"claim:proved"}},
    {schemaVersion:1,eventId:"event:5",eventCursor:5,eventType:"presentation.applied",occurredAt:"2026-07-21T00:00:00Z",actorRef:"principal:dave",authorityStatus:"authorized",sourceRefs:[],evidenceRefs:[],payload:{operation:"apply_presentation",format:"quotes"}}
  ];

  const first = reduceAuthorizedEvents("yawn:test", events);
  const replayed = reduceAuthorizedEvents("yawn:test", [...events].reverse());
  assert.deepEqual(replayed, first);
  assert.deepEqual(first.currentSnapshotRefs, []);
  assert.deepEqual(first.acceptedClaimRefs, ["claim:proved"]);
  assert.deepEqual(first.sourceCoverage, ["source:v1"]);
  assert.equal(first.asOfEventCursor, 5);
});

test("legacy desired possible becomes attributed desire plus proposed attain target", () => {
  const normalized = normalizeLegacyYawn({
    observer: { name: "principal:dave" },
    source: { source_refs: ["source:legacy:v1"] },
    frame: { current: "The source exists.", possible: "The source is understood.", possible_kind: "desired" },
    measurement: { desired: ["A quiet review."] },
  }, { rootId: "yawn:legacy" });

  assert.equal(normalized.snapshots[0].description, "The source exists.");
  assert.equal(normalized.desires.length, 2);
  assert.equal(normalized.targets.length, 1);
  assert.equal(normalized.targets[0].mode, "attain");
  assert.equal(normalized.targets[0].ratificationStatus, "proposed");
});

test("legacy possible that is not desired remains possibility, not target", () => {
  const normalized = normalizeLegacyYawn({ currentState: "Current", desiredState: undefined, frame: { possible: "Rain may arrive.", possible_kind: "feared" } });
  assert.equal(normalized.targets.length, 0);
  assert.equal(normalized.snapshots[1].modalRole, "possible");
  assert.equal(normalized.snapshots[1].motivationalRole, "feared");
});

test("optional-target fixtures cover non-goal Yawns", async () => {
  const fixtures = await loadFixture("optional-target-yawns.v1.json");
  assert.deepEqual(fixtures.map((fixture) => fixture.kind), ["source", "inquiry", "safety", "maintenance", "archive", "relationship", "holding"]);
  assert.ok(fixtures.filter((fixture) => fixture.targets.length === 0).length >= 4);
  assert.ok(fixtures.some((fixture) => fixture.targets.some((target) => target.mode === "maintain")));
  assert.ok(fixtures.some((fixture) => fixture.targets.some((target) => target.mode === "hold_open")));
});

test("target modes remain exact and do not imply attain", async () => {
  const schema = JSON.parse(await readFile(new URL("../schemas/target-condition.v1.schema.json", import.meta.url), "utf8"));
  assert.deepEqual(schema.properties.mode.enum, ["attain", "maintain", "restore", "prevent", "avoid", "understand", "decide", "reconcile", "hold_open"]);
});

test("multi-principal desires preserve privacy and cannot self-ratify a shared target", async () => {
  const fixture = await loadFixture("multi-principal-family.v1.json");
  const target = fixture.targets[0];
  const privateDesire = fixture.desires.find((desire) => desire.visibility === "private");
  assert.equal(privateDesire.authoredBy, "principal:sam");
  assert.notDeepEqual(target.requiredRatifiers.sort(), target.ratifiedBy.sort());
  assert.equal(target.ratificationStatus, "partially_ratified");
  assert.equal(fixture.move.mayDeclareSuccess, false);
  assert.equal(fixture.proof.status, "waiting");
  assert.equal(fixture.recurringCommitments[0].revocable, true);
});

test("state update separates authorized events and semantic changed paths", () => {
  const prior = reduceAuthorizedEvents("yawn:update", []);
  const event = {eventId:"event:source",eventCursor:1,authorityStatus:"authorized",payload:{operation:"add_source",sourceRef:"source:v1"}};
  const next = reduceAuthorizedEvents("yawn:update", [event]);
  const update = createStateUpdate(prior, next, [event.eventId]);
  assert.deepEqual(update.authorizedEventRefs, ["event:source"]);
  assert.deepEqual(update.changedPaths, ["/sourceCoverage"]);
  assert.equal(update.priorStateHash, prior.stateHash);
  assert.equal(update.nextStateHash, next.stateHash);
});
