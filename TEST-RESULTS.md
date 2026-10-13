# Local validation — 0.6.7

171 tests passed on the bundled Node runtime:

- 95 full-library and isolated hook tests, including visible timeline approval, command consumption, allowed/altered guidance, player-card initialization, stable/dynamic separation, confirmed updates, ownership isolation and maintenance-turn exclusion.
- 26 universal timeline-selector tests, including cue-only cards with no time/location fields, cue matching independent of chronology/geography, withholding before approval, persistent allow/alter/skip decisions, three-turn postponement, paced notices, notice cleanup and legacy automatic-reference opt-out.
- 11 clutter/deduplication tests.
- 10 event-memory tests.
- 10 family-reference tests.
- 10 mention-reference tests.
- 9 Memory Review reliability tests.

The timeline checks confirm that undecided events are not supplied to the narrator, universal cards omit time/location labels, approved events remain subject to prerequisites and played history, and utility notices do not become continuity evidence. Core context and the shared 6,000-character supplemental ceiling remain protected.

These are local mocked-runtime tests, not an AI Dungeon live integration or story-quality test. They do not verify every canon detail or guarantee that the narrative model obeys supplied guidance.
