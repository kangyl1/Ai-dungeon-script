# Local validation — 0.6.4

163 tests passed on the bundled Node runtime:

- 94 full-library and isolated hook tests, including player-card initialization, stable/dynamic separation, confirmed updates, ownership isolation, settings integration and maintenance-turn exclusion.
- 19 universal timeline-selector tests.
- 11 clutter/deduplication tests.
- 10 event-memory tests.
- 10 family-reference tests.
- 10 mention-reference tests.
- 9 Memory Review reliability tests.

Checks include preserving core context, a shared 6,000-character reference ceiling, no guessed clock persistence, excluding birth years and future dates, withholding ambiguous date-only matches, opt-in behavior, two-reference maximum, and suppressing the old Guided Arc injection when the new selector is enabled.

These are local mocked-runtime tests, not an AI Dungeon live integration or story-quality test. They do not verify all canon details or guarantee that the narrative model obeys guidance.
