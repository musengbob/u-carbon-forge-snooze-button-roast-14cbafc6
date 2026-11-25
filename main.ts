// Snooze Button Roast — u-carbon-forge-snooze-button-roast-14cbafc6
// Writes a single roast line (<=200 chars) to the entry file.
//
// Output path resolution (in priority order):
//   1. $MAKEFUN_OUTPUT_DIR
//   2. $OUTPUT_PATH
//   3. /output when MAKEFUN_BOT_DIR is set (grader sandbox)
//   4. local ./output/ (development fallback)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const MIN_CHARS = 1;
const MAX_CHARS = 200;

const ENTRY =
  "My alarm rang at 6 AM on a Saturday like it had a shift to clock into — buddy, it's the weekend, even the snooze button filed for overtime.";

function resolveOutputPath(): string {
  const fromEnv =
    process.env.MAKEFUN_OUTPUT_DIR || process.env.OUTPUT_PATH || "";
  if (fromEnv.trim()) {
    return join(fromEnv, "entry.txt");
  }
  if (process.env.MAKEFUN_BOT_DIR) {
    return join("/output", "entry.txt");
  }
  return join("output", "entry.txt");
}

function validateEntry(text: string): void {
  if (!text || !text.trim()) {
    throw new Error("entry must not be blank");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
    throw new Error(
      `entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${text.length}`
    );
  }
}

function main(): void {
  const outPath = resolveOutputPath();
  validateEntry(ENTRY);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, ENTRY, "utf8");
  // Read back and verify: the file on disk must be byte-identical to the
  // entry we validated, with no trailing newline or extra whitespace.
  const written = readFileSync(outPath, "utf8");
  if (written !== ENTRY) {
    throw new Error("round-trip check failed: written entry differs");
  }
  validateEntry(written);
  console.log(`wrote ${ENTRY.length} chars to ${outPath}`);
}

main();
