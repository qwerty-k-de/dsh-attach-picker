import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const client = readFileSync(path.join(root, "lib", "client.js"), "utf8");

/**
 * DSH 0.2 renamed the composer's draft-image API to draft attachments. The 0.1.1
 * fix must keep calling the published verbs; a regression here is invisible at
 * build time and only shows up as a dead button inside the composer.
 */
test("calls the published DSH 0.2 attachment verbs", () => {
  assert.match(client, /conversation\.createDrafts\(/, "must create drafts via conversation.createDrafts(sessionId, files)");
  assert.match(client, /inputActions\.addAttachments\(/, "must admit drafts via inputActions.addAttachments(ids)");
  assert.match(client, /releaseDraftAttachments\(/, "must release drafts when admission refuses");
});

test("keeps the removed 0.1 verbs only behind a capability probe", () => {
  assert.match(client, /typeof\s+conversation\.createDraftImages\s*[!=]==\s*"function"/, "legacy createDraftImages must be feature-detected");
  assert.match(client, /typeof\s+inputActions\.addImages\s*[!=]==\s*"function"/, "legacy addImages must be feature-detected");
  // The probe must gate the call: the legacy verbs may only appear after a failed
  // "drafts"/"addFiles" check, never on the primary path.
  const draftsAt = client.indexOf("conversation.createDrafts(");
  const legacyAt = client.indexOf("conversation.createDraftImages(files)");
  assert.ok(draftsAt > 0 && legacyAt > draftsAt, "the 0.2 path must precede the legacy fallback");
});

test("exposes a build/pipeline marker for DOM diagnosis", () => {
  const build = /BUILD_ID\s*=\s*"([^"]+)"/.exec(client);
  assert.ok(build, "BUILD_ID is missing");
  assert.equal(build[1], pkg.version, "BUILD_ID must track package.json version");
  assert.match(client, /"data-dsh-attach-picker"\s*:/, "marker attribute is missing");
});

test("registers into the composer slot with a stable identity", () => {
  assert.match(client, /__ModuleLoader__\.load\(/);
  assert.match(client, /id:\s*"dsh-attach-picker"/);
  assert.match(client, /"conversation\.input\.left"/);
  assert.match(client, /order:\s*-50/);
});
