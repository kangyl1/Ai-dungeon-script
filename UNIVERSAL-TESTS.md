# 0.6.2 validation

148 local tests passed: 88 full-library/hook tests, 19 universal timeline tests, 11 clutter tests, and 10 each for event memory, family references and mention references.

New checks cover opt-in behavior, legacy switch remaining inert, no embedded canon, two different calendars including negative years, unknown dates, outside-date topic reference labelling, ambiguous date matches, invalid records, duplicate IDs, large normal lore decks, marked-card cap, card edits/deletions, undo, oversized entries, two-reference ceiling, shared budget, literal punctuation and non-English cues. Hook tests confirm structured cards work with the inherited library and maintenance turns receive no timeline block.

No live AI Dungeon session was modified or tested. Model adherence, source correctness and fully automatic completion/prevention recognition are not guaranteed. The new helper has no completion ledger and adds no extra AI calls. Event cards have not been authored or converted in this release.

Changes from 0.6.1: replaced embedded Mushoku events with versioned structured-card parsing; added Timeline helper setting; preserved the inherited shared supplemental budget and normal hooks. Legacy Guided Arc is not injected when the universal helper is enabled. All older builds remain unchanged.
