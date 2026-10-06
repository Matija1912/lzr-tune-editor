# TODO

## Undo / redo (Ctrl+Z / Ctrl+Y)

Not implemented yet. Not hard to add given the current architecture:

- The whole calibration binary is only 128KB (`m4cExpectedBinarySize` in the web app), so a
  stack of full `binData` snapshots (not granular diffs) is cheap enough to just use directly —
  a few hundred undo steps would cost a few MB at most.
- Snapshot `binData` *before* each edit, at the same points `markModified()` already fires
  throughout `useAppState.ts` / `MainArea.tsx` / `ValueEditor.tsx` — that's the natural
  "one committed edit" boundary already used everywhere else in the app.
- Undo = pop the last snapshot off the undo stack, push current `binData` onto a redo stack,
  restore the popped snapshot. Redo is the mirror operation.
- Wire a global `keydown` listener for Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y), same pattern already
  used in `CategoryTree.tsx` for arrow-key navigation.
- Key design decision: snapshot per *committed* edit, not per keystroke — snapshotting on every
  keystroke would make undo annoyingly fine-grained (undo one typed digit at a time instead of
  one finished edit).
