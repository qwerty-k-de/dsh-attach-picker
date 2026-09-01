import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

test("package.json declares a dsh.bundle manifest", () => {
  assert.ok(pkg.dsh?.bundle?.patch, "dsh.bundle.patch is missing");
  const patchPath = path.join(root, pkg.dsh.bundle.patch);
  assert.ok(existsSync(patchPath), `bundle patch file missing: ${patchPath}`);
});

test("bundle patch inserts the plugin", () => {
  const patch = readFileSync(path.join(root, pkg.dsh.bundle.patch), "utf8");
  assert.match(patch, /insert:/);
  assert.match(patch, new RegExp(pkg.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("client export resolves to an existing file", () => {
  const client = pkg.exports?.["./client"];
  assert.ok(client, "exports['./client'] is missing");
  const file = path.join(root, typeof client === "string" ? client : client.default);
  assert.ok(existsSync(file), `client file missing: ${file}`);
});

test("repo ships README.md, README.zh.md and LICENSE", () => {
  for (const f of ["README.md", "README.zh.md", "LICENSE"]) {
    assert.ok(existsSync(path.join(root, f)), `${f} is missing`);
  }
});

test("package identity is dsh-attach-picker", () => {
  assert.equal(pkg.name, "dsh-attach-picker");
  assert.ok(pkg.repository?.url?.includes("github.com"), "repository field must point to GitHub");
});
