# Continuity Kit 0.6.3 — Memory Review reliability update

## Install safely

Back up your current scripts and adventure before installing. Replace the entire scenario Library with Library.js from this package; do not append it and do not install a second copy as an additional adventure script. Input.js, Context.js and Output.js retain their existing two-line wrappers. Story cards do not need re-importing.

This package has not been installed in your account. We have not verified whether editing the source scenario updates your existing adventure's inherited script. Test on a duplicate first if available. After a normal story turn, Continuity Control should identify version 0.6.3 and a Memory Review card should appear when tracking is enabled. If it still says 0.6.2, stop: do not assume the upgrade reached that adventure, and do not stack another script on top.

In Continuity Control's Entry, use one line for each setting:

```text
Event tracking: true
Event reminders: false
```

## Review without commands

1. Play a normal turn after installing the update.
2. Open the Memory Review story card. Its Notes/description lists pending IDs and text, plus the latest five resolved entries.
3. In its Entry, replace the blank `Request:` line with ONE request:

```text
Request: confirm 1
```

Or `Request: dismiss 1`, or `Request: correct 1 The fight was interrupted.` Replace 1 with the displayed ID. Read the candidate before confirming it.

4. Save the card, then take your next normal story turn. The request is applied during input processing and cleared. Check Notes for the result. The review itself does not require a separate AI call; the normal turn still generates normally.

Ignoring reviews never intentionally blocks generation. Pending records are not recalled as confirmed facts. The card is a view of saved script state, not its sole storage. Do not pin it. Editing Notes does not edit the archive. No past events are reconstructed by this update.

## Changes

- Missing tracker and coordinator fields are initialised without replacing existing records or profile data.
- Optional tracker failures are caught; narrative output is returned unchanged and an error is saved. This does not guarantee protection against platform failures, resource limits or errors in unrelated script features.
- Repeated reminders for the same pending event are removed. Reminders default to quiet; explicit `Event reminders: true` allows a notice only when new candidates are added.
- Memory Review shows whether tracking is enabled, the last narrative action inspected, queue counts, last request result and the last tracker error. Errors are retained for diagnosis rather than silently cleared.
- Legacy Story-mode `/memory` commands put results in Memory Review Notes instead of returning stop:true. They now continue normal generation and may consume a normal AI turn. Prefer editing the card. Do/Say-wrapped commands are not supported.
- Confirmed records, their IDs, pending candidates, profile and scene data remain in the original state namespace.

## Important limits

Detection is still the old bounded wording-based candidate detector; it can miss events or flag unsuitable ones. Improved semantic detection and historical catch-up are not included. Confirmation is not automatic. This update does not scan the previous 963 actions, fix all canon dates, or change timeline-helper behaviour.

The live failure was not reproduced in the editor. This release removes the suspected memory-command stop path and adds fault isolation; it is a mitigation requiring live testing, not a proven diagnosis of the original platform error. Other `/ck` commands still use their previous behaviour.

## Validation

Local integrated and module tests are supplied in tests/. The new review tests cover partial state, confirm/correct/dismiss requests, invalid requests, quiet reminders, disabled mode, damaged archives, card API failure and legacy command feedback. Existing tests for the original event detector still test that underlying module; the review adapter supersedes its reminders and public command feedback.
