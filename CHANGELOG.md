# Changelog

## 0.1.2 (2026-09-30)

- Move releases into GitHub Actions: pushing a `v*` tag publishes via npm Trusted
  Publishing (OIDC) with a provenance attestation, so no long-lived npm token is needed.
- Add a client-contract test that pins the published 0.2 attachment verbs, keeping the
  fallbacks behind capability probes.
- Fix the CI test invocation (`node --test "test/*.test.mjs"`); the bare directory form
  does not resolve on current Node versions.
- No runtime behaviour change from 0.1.1.

## 0.1.1 (2026-09-30)

- Fix silent failure on DSH 0.2: the composer rewrite renamed the draft-image API, so
  `conversation.createDraftImages` / `inputActions.addImages` no longer exist. Picks were
  dropped after the file dialog closed.
- Fill the draft rail through the published 0.2 contract instead:
  `conversation.createDrafts(sessionId, files)` + `inputActions.addAttachments(ids)`,
  releasing the drafts via `conversation.releaseDraftAttachments` when admission refuses.
- Keep `addFiles` (parent composer entry) and the 0.1 verb pair as fallbacks, so one
  artifact serves every host generation; the pipeline is probed at render time.
- Add a `data-dsh-attach-picker="<build>:<pipeline>"` marker for DOM-level diagnosis.
- Refresh both READMEs to describe the current pipeline.

## 0.1.0 (2026-09-01)

- Add a picture button to the DSH Web composer toolbar.
- Open the native OS file dialog to pick one or more images (no drag-and-drop needed).
- Feed selections into the same draft-image rail as drag-and-drop and paste.
- Enforce the host's `imageLimits`: media types, max images per message, max bytes per image.
- Disable the button while a request is in flight. Browser-side only, no dependencies.
