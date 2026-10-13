# Continuity Kit 0.6.4 — player character card update

## Install or upgrade

Back up the scenario scripts and adventure first. Test on a duplicate adventure when possible.

- From Continuity Kit 0.4.2–0.6.3: replace the complete **Library** script with `Library.js`. Keep the existing Input, Context and Output wrappers unless they were customized.
- Fresh install: replace all four script tabs with `Library.js`, `Input.js`, `Context.js` and `Output.js`.
- Do not paste `PlayerCharacter.js` or the other developer modules into extra AI Dungeon script tabs. They are already bundled into `Library.js`.
- Do not install a second copy beside the old Library. This release preserves the existing `continuityKit01` state namespace, profile, review archive, settings and cards.

After saving, take one normal story turn containing a valid `[PLAYER PROFILE]`. Confirm that **Continuity Control** says version 0.6.5 and that these cards exist:

- `PLAYER — <name>`
- `Player Character Review`

If the control card still reports an older version, stop and restore the backup. The update may not have reached that adventure.

## What the player card owns

The script-created `PLAYER — <name>` card is the authoritative source for the main character. It separates:

- **Stable profile:** identity, origin, family/background, innate gifts, appearance and other creator-authored starting facts. These change only through the existing `/ck profile replace` workflow.
- **Dynamic starting state:** training, limitations and starting relationship fields from the profile.
- **Confirmed persistent changes:** acquired or lost abilities/equipment, lasting conditions, relationships, ranks/status and achievements approved by the player.

On ordinary narrative turns, the script supplies this card even when the player's name is not mentioned. It is withheld from scene-extraction, Auto-Cards generation/compression and NPC-thought maintenance turns. If the platform context is already full, the original context is preserved and the card stays stored for the next turn; the script does not destructively truncate core instructions to force it in.

## Safe change review

Narrative wording can create a pending candidate, but it cannot directly change the player card. Quoted claims, hypothetical wording and maintenance output are excluded by conservative checks. Detection is deliberately incomplete and can miss changes or produce false positives.

Open **Player Character Review**, edit its single `Request:` line, save, and take a normal turn:

```text
Request: confirm 1
Request: dismiss 1
Request: correct 1 Kai permanently lost sight in his left eye.
Request: add equipment Kai carries the Moonlit Blade.
Request: replace 2 Kai carries the reforged Moonlit Blade.
Request: remove 2
```

Valid add categories are `ability`, `equipment`, `condition`, `relationship`, `status`, and `achievement`. `replace` deactivates the specified confirmed change and creates a new one; `remove` deactivates it. Superseded records remain in saved script state for audit but are not shown in the authoritative card.

## Ownership and synchronization rules

- The player card owns player profile and confirmed persistent player changes.
- Continuity scene state owns temporary time, location, presence, stage and pending-scene facts.
- Event Memory owns player-reviewed historical events, not current player statistics.
- Generic Story Cards and Auto Cards may continue to handle NPCs, places, organizations and objects.
- A generic card whose exact title equals the saved player name is excluded from Continuity Kit supplemental retrieval. It is not deleted or rewritten.
- The script restores protected card contents around bundled Auto-Cards operations. The player card and its review card are never attached to Auto-Cards memory updates.

AI Dungeon's internal Auto Cards API is not assumed or controlled. The kit cannot prevent the platform itself from displaying or retrieving a separately created duplicate player card outside the script's hooks. Remove or disable such duplicates manually after backing up; do not add the authoritative player card to `Memory cards` or `Always-include cards`.

Optional Continuity Control settings (both default on):

```text
Player character card: true
Character change tracking: true
```

Disabling change tracking stops new automatic candidates without deleting confirmed changes. Disabling the player card falls back to the older saved-profile injection behavior.

## Limits and validation

The card is capped at 5,000 characters, candidate/change text at 400 characters, pending candidates at 20, and confirmed change records at 40. No extra AI calls, random events or silent confirmations are added.

All 163 local tests pass, including 94 integrated tests and the existing focused suites. New regressions cover initialization, stable/dynamic separation, persistence without name mention, confirmation/correction/replacement/removal, maintenance isolation, competing player-card exclusion, protected card contents and full-context fallback.

These are mocked local hook tests. This package has not been installed or validated in a live AI Dungeon adventure, and it does not claim control over undocumented platform Auto Cards behavior.
