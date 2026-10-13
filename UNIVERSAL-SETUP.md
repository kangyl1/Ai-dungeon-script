# Continuity Kit 0.6.2 — universal timeline reference helper

Script-first test release. No Mushoku events or other setting-specific event data are embedded in the new helper. Existing story cards have not been converted or changed. Keep 0.6.1 as a backup.

## Installation

Back up your scripts and try a separate test adventure first. Replace Shared Library with Library.js. Input.js, Context.js and Output.js are included; the three hook wrappers remain unchanged. Do not paste individual modules into hook boxes.

In Continuity Control's Entry, add/update (avoid duplicate setting lines):

```text
Timeline helper: true
Character references: true
Guided arc: false
Event tracking: false
Event reminders: false
```

`Timeline helper: false` disables this feature. It defaults off. The old `Mushoku timeline` setting does not activate it. Event tracking/reminders are a separate inherited feature; disabling them avoids confirmation prompts and does not delete its records.

The universal helper does nothing without properly formatted event cards. Your existing prose-only canon cards remain usable by the normal game but do not become structured timeline records automatically. No event-card import is needed just to install the script. Event-card preparation is the next separate step.

## Event-card format

Put a single JSON object between the following markers in the card's Entry. This is a fictional format example, not canon for any setting:

```text
[CANON EVENT]
{
  "schema": 1,
  "id": "harbor-rescue",
  "title": "Harbor rescue",
  "calendar": "AD",
  "years": [2025, 2026],
  "certainty": "approximate",
  "cues": ["harbor rescue", "missing harbor courier"],
  "locations": ["North Harbor"],
  "participants": ["Mira"],
  "prerequisites": ["Mira is still missing", "The search has reached North Harbor"],
  "changes": ["Mira has already been rescued", "Mira never went missing in this adventure"],
  "summary": "In baseline canon, allies attempt to rescue Mira at North Harbor.",
  "source": "Fictional example, not published canon"
}
[/CANON EVENT]
```

All fields are required. Use empty arrays where appropriate. `years` may be `null` for unknown/relative chronology; put relative timing in prerequisites. `certainty` must be `verified`, `approximate`, or `uncertain`; this is the card author's label, not script verification. IDs must be unique, ignoring case. Calendar identifiers should be short letters/words without spaces, e.g. K, AD, or Imperial. Exact date selection currently supports integer years, not month/day chronology.

Limits: 200 event cards, 6,000 characters per marked entry, summary 800, title 120, source 240, ID 80, calendar 40. Arrays contain up to eight nonempty strings: prerequisites/changes 200 characters each; other arrays 100 each. At least one cue or location is required. Duplicate IDs and invalid records are skipped with diagnostics. More than 200 marked entries disables selection until the collection is reduced. Keep cards concise; an event too large for the output budget is withheld intact, not truncated.

Use distinctive cues, not common words like “fight”. Participants are reference information, not automatic triggers or proof of presence. Avoid broad platform trigger keys if you do not want AI Dungeon's independent retrieval to inject event cards prematurely. This script does not control the platform's native retrieval or spoiler filtering.

## Selection and load

The helper checks card entries for the marker each narrative context turn and parses only marked entries. It does not send the entire deck to the AI. It chooses at most two references, with a 2,800-character timeline ceiling inside the existing shared 6,000-character supplemental ceiling. Character/family references retain priority. No additional AI call or maintenance turn is introduced by this helper.

It uses distinctive phrase matches in the latest eligible narrative passage (up to 4,000 characters). For date/location matching, it recognises a line beginning `Current year: AD2025.` or an optional existing time correction such as `time: AD2025`. Calendar names must match. Birth year, age and vague elapsed-time prose do not establish current time. It does not persist a guessed clock or arc position.

An explicit topic can retrieve a reference outside its baseline date range, labelled as such—useful for discussion or changed chronology. Date/location-only ties are withheld. A topic mention can still be hypothetical or historical; every reference is therefore background, not a scheduled event. It cannot automatically understand arbitrary prose or infer every relative prerequisite.

## Canon versus adventure truth

The narrator is instructed to check prerequisites, completed events and player-caused changes against played history. The script does NOT automatically mark events completed/prevented, does NOT verify source accuracy, and does NOT guarantee the AI follows those instructions. It does not add a confirmation queue. An event reference may remain selected for several turns without meaning that the event should repeat.

Notes in Continuity Control show selected IDs, errors and budget withholding. Maintenance turns do not receive timeline references. Changing/removing cards takes effect at the next selection; there is no stale event index to reset. Disabling the helper leaves story cards, profiles and memories untouched.

## Reuse and rollback

For a new setting, use its own event/lore cards and instructions, preferably in a fresh adventure. No code changes are needed. Do not import the illustrative event above into real canon unless deliberately testing it.

To roll back, disable `Timeline helper`, or restore the backed-up Library and previous settings. No live script or adventure was changed while preparing this package.
