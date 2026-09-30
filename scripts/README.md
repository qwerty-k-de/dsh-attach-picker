# scripts

- `npm-check.mjs` — probe npm for whether candidate plugin names are still free,
  and print a sample entry from the community plugin index. Run it directly:

  ```sh
  node scripts/npm-check.mjs
  ```

> Removed during the 0.1.2 cleanup: an older `smoke-test.mjs` that exercised the
> pre-0.2 `createDraftImages` / `addImages` verbs and hard-coded a workspace path
> that no longer exists. Its role is covered by `test/client-contract.test.mjs`,
> which pins the current host contract and runs in CI.
