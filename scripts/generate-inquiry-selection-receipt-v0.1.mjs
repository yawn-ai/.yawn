import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { selectNextOrientationQuestion } from "../lib/inquiry-selection-receipt-v0.1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const inquirySelectionFixtureRankingOptions = Object.freeze({ limit: 3 });
export const inquirySelectionFixtureReceiptOptions = Object.freeze({
  receiptId: "receipt:fixture:orientation-selection",
  createdAt: "2026-08-27T12:00:01Z",
  createdBy: { kind: "actor", id: "system:orientation-selector" },
  representationMedium: "accessible-text",
  answerInputAdapter: "typed-text",
});

export function buildInquirySelectionFixtureReceipt(orientationMap) {
  return selectNextOrientationQuestion(
    orientationMap,
    inquirySelectionFixtureRankingOptions,
    inquirySelectionFixtureReceiptOptions,
  );
}

async function generate() {
  const orientationMap = JSON.parse(await readFile(
    join(root, "fixtures/orientation-map.v0.1.json"),
    "utf8",
  ));
  const receipt = buildInquirySelectionFixtureReceipt(orientationMap);
  await writeFile(
    join(root, "fixtures/inquiry-selection-receipt.v0.1.json"),
    `${JSON.stringify(receipt, null, 2)}\n`,
  );
  console.log(`Generated Inquiry Selection Receipt V0.1: ${receipt.receiptId}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generate();
}
