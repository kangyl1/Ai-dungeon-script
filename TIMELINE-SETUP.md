# Continuity Kit 0.6.6 — player-approved timeline setup

Add these lines to **Continuity Control → Details → Entry**:

```text
Timeline helper: true
Timeline approval: true
Guided arc: false
```

When the latest eligible story passage matches a valid `[CANON EVENT]` card by its cue, or by a compatible explicit current year and location, the event is held back. After that narrative response, a fixed approval notice appears. Use one command:

```text
/ck event allow       # canon form may be supplied if prerequisites still fit
/ck event alter       # only an altered form consistent with played history
/ck event postpone    # withhold and offer again after three eligible story turns
/ck event skip        # persistently withhold this event
/ck event status      # show the waiting event and decision counts
/ck event reset       # clear all timeline decisions
```

AI Dungeon treats these as safe maintenance inputs: the command is removed from narrative history, its decision is saved immediately, and a normal story continuation is generated. The fixed command result is appended after that continuation. This avoids the live platform failure caused by stop-only input responses.

Decisions are stored in the adventure's script state and keyed by the structured event ID. Deleting an event card also removes its stale saved decision on the next timeline evaluation. Approval does not claim that the event happened; it only permits reference guidance on later matching turns. Played history, prerequisites and player agency still take priority.

The notice is removed from the continuity layer's later source text. It is paced rather than printed on every output. Maintenance turns do not receive timeline guidance or notices. Set `Timeline approval: false` only if you deliberately want the older automatic-reference behavior.

This feature requires structured `[CANON EVENT]` cards. It cannot convert ordinary lore cards into events, infer a reliable calendar from the player's birth year, or guarantee that AI Dungeon's model follows guidance. Local mocked-runtime tests passed; no live AI Dungeon validation is claimed.

---

# Historical 0.6.1 experimental Mushoku timeline notes

## What is ready

An optional automatic selector for 17 broad canon reference periods, plus a separate 887-card export with 14 entries revised to remove several known timeline conflicts. No live adventure has been changed. This is a test release, not a fully verified canon encyclopedia.

The selector needs no `/ck arc next` and no `/memory confirm`. It supplies up to two short references, inside the existing shared 6,000-character supplemental budget, without a separate AI request. Character/family references retain priority when space is tight. Existing Auto-Cards/scene-extraction features retain their own behavior; this update does not remove their maintenance turns.

## Install in a test copy first

1. Save a backup of your current scripts and cards. Use a separate test scenario/adventure before replacing a live game.
2. Replace the Shared Library with `Library.js` from this package. The three hook files are included; their content is unchanged from 0.6.0. Do not paste individual source modules into the hook boxes.
3. In the Continuity Control card's Entry, add or update these lines (do not leave duplicate conflicting settings):

```text
Mushoku timeline: true
Character references: true
Guided arc: false
Event tracking: false
Event reminders: false
```

This opts out of the separate confirmation-based event tracker. Existing saved event records are not deleted. Word-overlap recall is not required. Mushoku timeline is off by default so other scenarios are unaffected.

4. The revised `mushoku-timeline-reviewed-0.6.1.json` is a complete 887-card deck for a clean test scenario, NOT a 14-card append-only update. Do not import it on top of an existing deck and create duplicates. For an existing adventure with custom edits or memories, use the before/after change log to update only the relevant entries after reviewing your differences. Do not delete your adventure's generated memory cards to install this.
5. Play a normal turn, then check Continuity Control's Notes under CANON TIMELINE. It reports the selection, ambiguity, or insufficient space. The helper does not print reminders into the story.

## What it can and cannot infer

It checks the latest eligible narrative passage, up to 3,000 characters, for distinctive topic phrases. Broad names alone do not trigger a future arc. It can also combine a location with an explicit current-year declaration such as `Current year: K422.` or `The year is K422.` A manually maintained `time: K422` correction takes priority if you already use one; it is optional, not a requirement.

It does not calculate the date from birth year, player age, “months passed”, or a future plan. If the period is unclear, it supplies nothing. It does not save an inferred clock, so undo cannot leave a guessed year stuck in memory. It does not currently consume the scene tracker's potentially stale date.

Explicit dates outside an event's working range exclude that reference. Therefore heavily altered chronology can cause missed references. Topic-only matches can also be about a memory or discussion rather than the current arc; all results are labelled background, never proof that an event is happening.

The story AI—not a guaranteed script-level event ledger—still checks whether an event happened, was prevented, or no longer fits. There is no automatic completion/prevention detector in this release. The same reference can remain relevant across several turns; instructions discourage replay, but cannot guarantee generation behavior.

The helper scans its small embedded event list, not the 887-card deck. Other existing components and AI Dungeon's own card retrieval still work independently. This cannot prevent the platform from retrieving an unrelated spoiler card.

## Research status

Publisher summaries verify broad light-novel arc order, not all calendar years. Windows are provisional. The authored web novel provides a useful cross-check but is explicitly not treated as an exact substitute for the light novels. Child birth dates, some late chronology, and the rest of the 887-card lore remain unaudited. The corrected export reduces identified contradictions; it does not certify every sentence.

See `TIMELINE-SOURCES.md` for source links. Legacy README/CHANGES files describe inherited functionality; this document governs the new timeline feature.

## Rollback

Set `Mushoku timeline: false` to disable the new selector without deleting any state or cards. Restore your backed-up Library if you want to revert the whole script. Card edits require their separate backup/change log; disabling the selector does not revert card content.
