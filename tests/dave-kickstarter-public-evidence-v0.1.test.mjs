import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const evidence = JSON.parse(
  await readFile(
    new URL(
      "../fixtures/dave-kickstarter-nestheads.public-campaign-evidence.v0.1.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

test("Nestheads public evidence preserves two campaign relationships", () => {
  assert.equal(evidence.schemaVersion, "yawn.public-source-evidence.v0.1");
  assert.equal(evidence.campaigns.length, 2);
  assert.equal(new Set(evidence.campaigns.map((campaign) => campaign.campaignRef)).size, 2);

  const cancelled = evidence.campaigns.find(
    (campaign) => campaign.status === "cancelled_by_creator",
  );
  const funded = evidence.campaigns.find((campaign) => campaign.status === "funded");

  assert.equal(cancelled.backers, 303);
  assert.equal(cancelled.pledgedUsd, 14417);
  assert.equal(cancelled.goalUsd, 60000);
  assert.equal(funded.backers, 266);
  assert.equal(funded.pledgedUsd, 14651);
  assert.equal(funded.goalUsd, 10000);
  assert.equal(funded.visibleUpdates, 10);
  assert.equal(funded.visibleComments, 18);
  assert.equal(funded.lastVisibleUpdate, "2025-04-15");
});

test("campaign counts and obligation states cannot be collapsed", () => {
  assert.equal(evidence.cohortRelationship.uniquePersonCount, null);
  assert.equal(evidence.cohortRelationship.cohortOverlap, "unknown");
  assert.equal(evidence.cohortRelationship.countsMayBeSummedAsUniquePeople, false);
  assert.equal(evidence.cohortRelationship.campaignPromisesMayBeMerged, false);
  assert.equal(evidence.cohortRelationship.campaignRewardsMayBeMerged, false);
  assert.equal(evidence.cohortRelationship.campaignCommunicationMayBeMerged, false);
  assert.equal(evidence.projectionGuidance.prohibitedCombinedClaim, "569 unique backers");
});

test("public source evidence grants no contact, publication, legal, or fulfillment effect", () => {
  assert.deepEqual(evidence.boundary, {
    privateBackerDataIncluded: false,
    cohortOverlapInferred: false,
    legalConclusionEstablished: false,
    fulfillmentEstablished: false,
    contactAuthorized: false,
    publicationAuthorized: false,
    externalEffectsAuthorized: false,
  });
});
