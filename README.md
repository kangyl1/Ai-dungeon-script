# Continuity Kit 0.6.6 — live command compatibility hotfix

Version 0.6.6 fixes the live AI Dungeon failure triggered by `/ck event ...` commands. Timeline commands are now consumed without the unreliable stop-only input response. The decision is saved immediately, the fixed result is appended after the resulting ordinary story continuation, and the command itself is excluded from narrative history. All 0.6.5 timeline and player-card behavior remains available.

# Continuity Kit 0.6.5 — player-approved canon events

Version 0.6.5 adds an approval gate to the structured canon timeline. When a matching `[CANON EVENT]` approaches, it is withheld from narrator guidance and a fixed notice asks the player to choose:

```text
/ck event allow
/ck event alter
/ck event postpone
/ck event skip
```

`allow` permits the canon form if its prerequisites still fit. `alter` permits only a version consistent with played history. `postpone` offers it again after three eligible story turns. `skip` persistently withholds it. `/ck event status` shows the current decision and `/ck event reset` clears all saved timeline decisions. The script never guesses that an event occurred.

Enable it in **Continuity Control → Details → Entry**:

```text
Timeline helper: true
Timeline approval: true
Guided arc: false
```

The scenario must contain valid `[CANON EVENT]` cards. Existing control cards that do not contain `Timeline approval:` use the safe approval behavior by default. Set `Timeline approval: false` only to restore the earlier automatic-reference behavior. Replace only the Library tab when upgrading from an earlier standard Continuity Kit installation.

This is locally simulated and regression-tested; it has not been live-validated in AI Dungeon.

---

# Continuity Kit 0.6.4 — authoritative player character card

Version 0.6.4 creates a persistent `PLAYER — <name>` story card from `[PLAYER PROFILE]`, separates stable profile data from dynamic state, supplies the card on ordinary narrative turns, and requires player confirmation before persistent character changes are written. It also excludes generic player-named cards from the kit's supplemental retrieval so Auto Cards, story-card retrieval and the continuity layer do not compete for player ownership.

See [PLAYER-CARD-UPDATE.md](PLAYER-CARD-UPDATE.md) for installation, review commands, limits, ownership rules and validation. This release is built on the latest 0.6.3 reliability code; it supersedes the requested 0.4.2 base without discarding later fixes.

---

# Continuity Kit 0.6.0 — lightweight event review

Replace only Library in an existing Continuity Kit 0.5.x adventure with `Library.js`. Keep your other hooks, cards and settings. This adds an event archive in script state, not another always-included story card. Different/custom scripts need a compatibility review before replacing their Library.

## How it works

On normal narrative outputs, inexpensive English pattern checks look for sentences containing a recognised full story-card title or saved player name plus event verbs such as defeated, won, joined, discovered, prevented or interrupted. At most two new candidates are stored per output. These are literal excerpts, not AI summaries. Every automatic candidate is PENDING, even when its wording sounds confident. The detector is intentionally limited: it can miss nuanced events, pronoun-only/short-name references and canon divergence, and it can flag false positives. It does not prove outcomes or determine which ending occurred.

The first pending candidate triggers a brief out-of-story notice. Further reminders are spaced at least eight distinct narrative outputs apart. They do not consume a separate AI call or stop the narrative. Commands expose the queue directly; no clickable buttons or guaranteed generated questions are promised.

## Commands

```text
/memory
/memory pending
/memory page 2
/memory confirm 1
/memory correct 1 Zack Lee won; Zephyr withdrew.
/memory dismiss 1
/memory add Zephyr joined Big Deal after meeting its leader.
```

Review shows ten records per page with IDs and status. Confirm accepts the excerpt as a historical record. Correct supplies a replacement (up to 400 characters) and confirms it; the previous text is retained on the record. Dismiss keeps the candidate excluded from recall and prevents the same exact excerpt from reappearing. Add explicitly stores player-written history. If an identical record already exists, add reports its existing status rather than silently confirming it. Commands stop generation; no new story response is requested.

Only CONFIRMED records can be recalled. Up to three latest records whose tagged full names appear in the current input share the existing 6,000-character supplemental budget with reference cards and clarification guidance. The six-card allowance remains unchanged. This can displace lore; it does not add a second allowance. Pending/dismissed records are not fed to the story AI as facts. Historical events are not proof of current presence or public knowledge. Empty Continue turns do not trigger event recall by themselves.

## Controls and safeguards

Add these settings to Continuity Control Entry if desired:

```text
Event tracking: false
Event reminders: false
```

Both features default on. Tracking false disables automatic detection, recall and notices without deleting records; commands remain available. Reminders false silences notices while keeping detection and recall. Character references false also disables event recall because they share the supplemental context layer.

Limits: 200 total records, 20 pending, 400 characters per excerpt. At capacity, new candidates are skipped with a capacity notice; saved/unresolved records are never silently evicted. Confirm/dismiss pending items frees pending slots, not total archive slots. The archive is bounded rather than an unlimited lifetime memory. Duplicate suppression is exact apart from case and surrounding whitespace, not semantic merging. Correction does not silently reconcile other records.

No extra model calls or model extraction tasks are added. Checks scan at most the last 12,000 characters / 40 sentence fragments of each output; repeated hook output is guarded by a bounded recent cache. Maintenance outputs are excluded. Utility notices and command replies are stripped from the coordinator's future context and scene-extraction sources; platform/vendor memory behavior remains independent and may still encounter displayed notices. Existing Auto-Cards memory remains AI-written and fallible, separate from this confirmed archive.

Undo/retry does not automatically retract records: review/dismiss events from discarded story branches. The detector is not a complete chronology or contradiction engine. It never silently writes permanent relationships or ranks, and you still approve important outcomes. Reminder questions are fixed review notices, not semantic questions generated from the story.

Validation: 127 local tests (86 integrated, 10 family, 10 mention, 11 clutter, 10 event). Live AI Dungeon behavior, especially utility display and undo/retry, still needs a test adventure.

---

# Continuity Kit 0.5.5 — quoted evidence fix

Upgrade from 0.5.x: replace only Library with `Library.js`, save, then request `/ck refresh` in the adventure to try a fresh scene update. Existing rejected updates are not replayed or automatically accepted. If the quoted words are absent from the recent source window, the update will still be rejected.

The evidence checker first tries the literal excerpt. If that fails, it permits removal of ONE matched pair of surrounding straight double/single quotes, curly double/single quotes, or guillemets. The enclosed text must still match exactly and satisfy the minimum evidence length. Internal wording, punctuation and spacing are not rewritten. Both dedicated and inline scene updates use the fix; locks and source tracking remain intact. Original model output is preserved in diagnostics.

No change to retrieval budgets, AI calls, cards or saved profile. Exact excerpt matching remains a limited safeguard, not proof that the proposed scene interpretation is correct. Local simulated validation: 115 tests passed, including wrapper acceptance and rejection of paraphrases, mismatched quotes, short excerpts and changed whitespace. Not live-tested in AI Dungeon.

---

# Continuity Kit 0.5.4 — conservative clutter reduction

Upgrade from Continuity Kit 0.5.x by replacing only the Library tab with `Library.js`. Keep your hooks, cards and settings. Do not overwrite a different/custom Library without checking compatibility.

The six-card / 6,000-character supplemental allowance and 2,500-character per-card cap are unchanged. No new AI calls or persistent relationship state are added.

Changes:

- Skip a whole reference when its exact full base is already supplied and it has no unsupplied update. Do not add an empty “already supplied” wrapper.
- Keep new `[CK CHANGES]` updates even when base lore is already present. Suppression of a repeated update requires its attributed, labelled representation—not just the same sentence appearing as a claim elsewhere.
- Avoid reinserting an identical formatted reference, including the same truncated representation, or identical clarification guidance already in the incoming context.
- Use case-sensitive whole-block matching, not similarity or summarization. Partial matches and differently worded lore are retained. Identical descriptions for different newly selected cards keep their separate attribution.
- Clarification guidance now explicitly discourages repeating answered questions or pressing unanswered ones. Preserve uncertainty; reconsider when the referent or situation changes. This is AI guidance using visible conversation, not a permanent “resolved” flag, and it cannot guarantee dialogue never repeats.

Only selected supplemental cards are checked against context; this does not compare every deck card with every other card. Original context is never deleted. The existing name/alias scan remains. No changes are made to AI Dungeon's independent retrieval or existing Auto-Cards memory. Duplication already present in platform context is left intact. Whole-block matching deliberately misses some differently formatted duplicates rather than guessing.

Validation: 79 integrated + 10 family + 10 mention + 11 clutter tests (110 total), locally simulated. No live AI Dungeon verification.

---

# Continuity Kit 0.5.3 — explicit mentions and natural clarification

Replace only Library with this package's `Library.js` if already using Continuity Kit 0.5.x. Leave hooks and cards intact. For a different/custom Lookism script, merge only after checking compatibility; this is a complete Library replacement, not an append-only snippet.

New behavior (on by default):

- Current input mentioning an exact card title retrieves that reference across the deck. Quoted names and remembered claims are eligible, but do not establish events, relationships, knowledge or scene presence.
- To register a short name, add `alias=Gojo` to Satoru Gojo's card triggers, separated from other triggers by a comma. Ordinary keyword triggers are not treated as aliases by this layer. Duplicate titles/shared aliases are withheld. Full names take priority over contained shorter names.
- Explicit `my brother`, `my sister`, `my sibling`, `my grandfather`, `my grandmother`, `my guardian`, `my mentor`, `my partner`, `my friend`, `my rival`, and `my crew` can resolve matching singular profile labels. Mother/Father remain supported. These optional labels are now recognized by profile capture; existing profiles are not rewritten. Multiple names in one field are not guessed between.
- When a relationship or matched name is unresolved, bounded guidance asks the AI to use recent context first, and ask ONE natural question only when necessary. It must respect NPC knowledge and avoid inventing relatives or assuming several siblings exist. Missing card data alone does not mean the identity is unknown in the story.
- A reply such as `I mean Daniel Park` retrieves that card without changing your saved profile. Ongoing conversational resolution relies on the normal story context: there is no new durable clarification/family database.

Limits: this is English text matching, not semantic understanding. Unknown names with no matching title/alias cannot be detected as ambiguous; first names are not guessed. Quoted/reported relationship phrases and `your brother` are deliberately not resolved. The AI determines whether and how to clarify; wording and perfect compliance cannot be guaranteed. Existing platform card triggers and legacy configured retrieval still operate independently. This feature does not block their retrieval or change Auto-Cards' existing AI-written memory behavior.

New setting in Continuity Control Entry: `Mention references: false` disables this layer. `Family references: false` disables parent-role resolution; explicit names still work. The existing master reference switch disables supplemental retrieval. No additional AI calls; shared six-card/6,000-character budget, original context preserved, maintenance turns excluded. Each eligible input scans titles/explicit aliases across the deck; this is not a new cached catalog or an overall performance optimization.

Validation: 79 integrated, 10 parent, and 10 mention tests pass (99 total). Local simulated hooks only; not live AI Dungeon verification.

---

# Continuity Kit 0.5.2 — conservative family references

## Upgrade from 0.5.1

Replace only the **Library** script tab with `Library.js`, then save. Keep your existing Input, Context and Output hooks. No story-card reimport is needed. Existing cards, profile, settings and memories are preserved.

On ordinary narrative turns, an explicit current input such as `I ask my dad about childhood.` can retrieve the card whose title exactly matches the saved `Father` field. Supported references are `my father/dad/papa` and `my mother/mom/mum/mama`. Matching ignores capitalization and surrounding spaces; it does not guess names or use aliases. The saved profile must already be captured.

This feature defaults on. Add `Family references: false` to Continuity Control Entry to disable it. The existing master reference switch also disables it.

Safeguards and limits:

- Uses current input only, not generated narration or historical dialogue. Quotes, commands and detected reported speech are withheld. These are conservative text heuristics, not a complete speaker parser; some legitimate requests will be skipped. Rewritten `your father` actions are not supported by this initial version.
- Unknown or ambiguous profile values and duplicate exact card titles are skipped. Described adoptive/step/foster households are conservatively withheld rather than choosing a parent.
- Checks titles across the deck for the specific parent names, including cards beyond position 500. It does not send the whole deck to the AI. It adds a title scan on eligible requests; it does not replace or optimize the existing retrieval engine.
- Reuses the existing six-card/6,000-character supplemental budget and 2,500-character per-card limit. No family-tree or parent-link traversal is added. Original context is not removed to fit cards.
- Clears the request after output and withholds this lookup on maintenance turns. No extra AI calls or cards are created by this feature.
- A retrieved card is reference material, not proof that the parent is present or that the character knows everything on it. The AI still interprets the supplied context; retrieval does not guarantee flawless narration.

Validation: 77 integrated tests and 10 focused family tests pass (87 total). This is local simulated-hook validation, not a live AI Dungeon test.

---

# Continuity Kit 0.5.1 — persistent creator profiles

## Upgrade from 0.5.0

Replace only the **Library** script tab with `Library.js`, then save. Existing memories, cards, locks, guided-arc progress and settings remain in place.

Version 0.5.1 can capture one explicit creator profile from a rendered `[PLAYER PROFILE]` block. It stores recognised player-authored fields in adventure state and resupplies them on ordinary narrative turns after the opening leaves context. This removes the need to copy parents and origin into Continuity Control manually when a Multiple Choice child route formats its questionnaire answers correctly.

Put a block like this in each playable child route's opening prompt, using route-appropriate placeholders:

```text
[PLAYER PROFILE]
Name: ${What is your character's name?}
Gender: ${What is your gender?}
Origin: Reincarnated at birth
Previous life: ${Describe your previous life in one or two sentences.}
Mother: ${What is your mother's exact name?}
Father: ${What is your father's exact name?}
Ancestry: ${Describe your ancestry.}
Connection to Rudeus: ${Describe your relationship to Rudeus and age difference, or write unrelated.}
Primary gift: ${Choose your strongest innate gift or talent.}
Secondary gifts: ${List any additional weaker, incomplete, dormant, or difficult-to-develop gifts. Write none if desired.}
Starting training: None
Appearance: ${Describe the appearance you will grow into.}
Personality: ${Optionally describe your personality.}
Birth year: ${Choose a year.}
Starting location: ${Where does your life begin?}
[/PLAYER PROFILE]
```

Use `Starting training: None` for native-born and reincarnated-at-birth routes. A summoned or teleported route may record justified previous-world training, but local magic and sword-school mastery should still be learned unless explicitly established. The profile rules treat aptitude as potential rather than mastery, preserve one primary gift at full potential, and keep additional gifts weaker or dormant. No romance-preference field is requested or recognised.

Recognised labels include Name, Gender, Pronouns, Origin, Previous life, Mother, Father, Parents, Family, Ancestry, Race, Connection to Rudeus, Primary gift, Secondary gifts, Innate talents, Starting training, Appearance, Personality, Birth year, Starting age, Starting location, Background, Limitations and Goal. Unknown labels are ignored. At least two recognised fields are required. The saved formatted profile is capped at 3,500 characters, 20 fields and 500 characters per value.

Profile commands:

```text
/ck profile status
/ck profile replace
/ck profile clear
```

A different profile block cannot silently overwrite the saved profile. Use `replace` only after intentionally editing the profile source. `clear` removes it and disables automatic recapture until `replace` is used. Full saved values and capture status appear in Continuity Control Notes.

Profile guidance is withheld from dedicated scene extraction, Auto-Cards generation/compression and NPC-thought maintenance turns. It adds no AI calls, cards or random events, and never deletes original context to make itself fit.

Validation: all 67 previous tests plus eight creator-profile tests pass (75 total). Tests cover capture and persistence, family and Rudeus-connection retention, aptitude versus mastery, weaker secondary gifts, replacement protection, clearing/recapture, malformed fields, context boundaries, command behavior, diagnostics and maintenance-turn suppression. This remains simulated-hook validation rather than live AI Dungeon proof.

---

# Continuity Kit 0.5.0 — guided authored story arcs

## Upgrade from 0.4.2

Replace only the **Library** script tab with `Library.js`, then save. Existing memory, story cards, settings and adventure state remain in place. The new guided-arc feature defaults off, so upgrading does not change story behavior until you configure it.

Guided arcs reuse ordinary story cards as an ordered milestone plan. Unlike a freeform arc generator, this feature makes no extra AI calls, never removes a milestone just because several turns passed, and never asks the model to invent a replacement outline. On normal narrative turns it can supply the current milestone and up to two later milestones, clearly labelling later material so it is not started early. Scene extraction, Auto-Cards generation/compression and NPC-thought maintenance turns receive no arc guidance.

Add or edit these lines in **Continuity Control** Entry:

```text
Guided arc: true
Arc lookahead: 2
Arc cards: Exact First Card Title, Exact Second Card Title, Exact Third Card Title
```

- `Arc cards:` accepts up to 40 exact titles in intended order. Titles must be unique. Arc lookup checks only these configured titles across the deck, so late Chronicle cards remain usable without expanding the older 500-card supplemental-reference index.
- `Arc lookahead:` accepts 1 to 3 and defaults to 2. Only the current card is labelled current; later cards are warnings about direction, not events to trigger immediately.
- Arc material is capped at 3,800 characters, with at most 1,400 characters from each card. Existing context is never removed to make it fit.
- Played events always outrank the plan. Merely accompanying or helping the canon cast should preserve the major causal milestone. If the player materially prevents or changes its cause, the guidance tells the model to honor the consequences rather than undoing the player's action.

Progress is deliberately explicit instead of guessed from prose:

```text
/ck arc status
/ck arc next
/ck arc altered
/ck arc skip
/ck arc back
/ck arc goto Exact Card Title
/ck arc reset
```

Use `next` when the milestone occurred without a major causal change, `altered` when player action materially changed it, and `skip` when it no longer applies. These commands update state without becoming player actions or generating a story continuation. The current position and diagnostics appear in Continuity Control Notes.

Validation: the previous 60 tests plus seven guided-arc tests pass (67 total). Coverage includes ordering/lookahead, unchanged-canon versus material-divergence guidance, manual progression and rewind, context boundaries, text caps, duplicate/missing/late-deck titles, defaults, native hook behavior and maintenance-turn suppression. This is simulated-hook validation, not live model-compliance proof.

---

# Continuity Kit 0.4.2 — bounded supplemental retrieval

## Install or upgrade

Back up the scenario scripts and export its story cards first. Adventures made from the same AI Dungeon scenario may share scripts.

- Upgrade from 0.4.1: replace only the **Library** script tab with `Library.js`, then save. Keep the existing Input, Context and Output tabs. Existing memory, cards, control settings and adventure state are retained.
- Fresh install: replace the four script tabs with `Library.js`, `Input.js`, `Context.js` and `Output.js`, then save. Do not paste `References.js`, `Coordinator.js` or other developer modules into extra tabs; they are already bundled into `Library.js`.
- Play one normal turn, then open the **Continuity Control** story card. Settings belong in Entry; Notes are regenerated diagnostics.

For an existing 0.4.1 control card, add these lines if you want to configure the new features:

```text
Always-include cards:
Word-overlap recall: false
Recall cards:
Parent links: false
```

The safe defaults are an empty always-include list, word-overlap recall off, and parent links off. Existing name-based references configured under `Memory cards:` continue to work. `Character references: false` disables all supplemental reference delivery, including always-include cards.

## New optional retrieval controls

- `Always-include cards:` accepts up to four comma-separated exact card titles. These cards can be supplied without a name mention.
- `Word-overlap recall: true` enables one conservative fallback. If `Recall cards:` is empty, the script automatically selects the first 40 unique, non-system card titles that contain at least three distinctive words. You can instead put exact titles in `Recall cards:` to override that automatic allowlist. At least three distinctive title words must occur in the recent context and cover at least 20% of the title's distinctive words. Common words and words shorter than three characters are ignored. A tied best score supplies no fallback.
- `Parent links: true` follows a card trigger written as `parent=Exact Card Title`. It follows at most two ancestor levels and stops on missing cards or cycles. Example: `Daniel Park,Daniel,parent=J High Students`.

Directly selected cards are considered before parent cards. Across name mentions, always-includes, the single recall fallback and parents, one shared addition is capped at 6,000 characters, six cards, and 2,500 characters per formatted card. Only the first 500 story cards are indexed. Case-insensitive duplicate titles are excluded instead of choosing one arbitrarily. Existing context is never deleted or rewritten to make an optional reference fit.

These additions run only on narrative context turns. Dedicated scene extraction, Auto-Cards generation/compression and optional NPC-thought maintenance turns do not receive narrative supplemental references. The implementation makes no extra AI calls, introduces no random events, and creates no new archive. It reuses the existing story cards, native Memories context, hooks and card-memory behavior.

The supplied 169-card scenario export was inspected as a compatibility/reference deck: all 169 titles were unique, it fit below the 500-card index bound, and it was not modified. Parent links are not added automatically; edit triggers only where you deliberately want a relationship.

Validation: all 50 tests from 0.4.1 and ten new retrieval-specific tests pass (60 total). The tests cover always-inclusion without mentions, automatic and explicit recall allowlists, budget boundaries and original-context preservation, duplicate and out-of-range titles, parent cycles/missing/depth limits, direct priority, recall false positives/ties/transitions, native memory/cards/hooks, and maintenance-turn suppression. This is local simulated-hook validation, not live AI Dungeon or narrative-accuracy proof.

## Previous documentation (historical 0.4.1 details)

# Continuity Kit 0.4.1 — character consistency

UPGRADE FROM 0.4.0: Replace only the Library script tab with Library.js. Input.js, Context.js and Output.js are unchanged. Do not paste Canon.js or other module files separately. Existing control settings, memories and cards are retained. Back up installed scripts before replacing them.

Canon consistency defaults to enabled, including existing installations. In Continuity Control Entry, add `Canon consistency: false` to disable, or `Canon consistency: true` to enable. Diagnostics report whether guidance was supplied, disabled, or skipped for lack of context space. This mode applies to story generation, not dedicated extraction, card compression or NPC-thought maintenance turns.

This adds generic identity, speech, world-role, scene-entry and viewpoint guidance. It contains no Lookism or other franchise facts. Story cards still supply those facts. It does NOT classify mentions into confirmed presence, create a whereabouts tracker, validate canon, detect personality changes, redact secrets, or guarantee model compliance. Do not treat a retrieved name as a presence record. Accurate character cards remain necessary. Prior incorrect passages or archived memories are not repaired by installing this update.

No extra model calls, full-history scans, or separate fact archive are added. A constant block (under 2,000 characters) is appended only if context space permits, before optional character references. Existing context is never truncated to fit it. The extra prompt does consume context space; it can reduce available supplemental references. Existing engine costs and model fallibility remain.

Fresh installations now use a blank Memory cards list and a generic timeline example. Configure Memory cards with your desired exact card titles. Existing configurations keep their names. No story cards or canon facts are automatically imported. Scene extraction remains manual by default (`/ck refresh`).

Validation: 50 local tests passed, including context budget, optional mode, no duplicate guidance, preserved native memory and original regression suite. Not live-tested in AI Dungeon; narrative improvements require playtesting.

## Previous documentation (historical 0.4.0 details)

# Continuity Kit 0.4.0 — character references

Replace the AI Dungeon Library tab with Library.js in this package. Keep the existing Input, Context and Output hooks. Library.js already includes all modules; do not paste References.js or Targeted.js separately. Keep a backup of your installed scripts. No adventure restart is required.

## Setup
In the Continuity Control card Entry, set `Memory cards:` to the exact titles of existing character cards you want tracked (comma-separated, at most 30). Add Mary Kim, Vasco, etc. as appropriate. The defaults are Daniel Park, Zack Lee, Mira Kim, Zoe Park. Set Player name to your character name. Correct base appearances in the cards themselves; this script does not research or verify canon.

Supplemental references default on. To disable, add `Character references: false` to the control card Entry. No new setting is required to enable existing adventures.

## What changed
- Recently named configured characters can have their existing base card brought back even when ordinary triggers miss it. Maximum four candidates, 6,000 characters total and 2,500 per character block; existing context is never removed to make room for these additions.
- Lookback is only three eligible actions. Candidates are explicitly not proof of physical presence. Some transition phrases clear the candidate list. This is conservative name-based retrieval, not a fully automatic active-cast detector.
- Separate player-maintained changes override conflicting starting details without rewriting the base entry. Put this optional block at the TOP of a character card's Notes, BEFORE the Auto-Cards marker:

[CK CHANGES]
Appearance: Hair was cut short at the salon.
Temporary condition: Left wrist bandaged after the fight.
Relationship: Accepted an invitation; romantic feelings not established.
[/CK CHANGES]

Use only changes established in your adventure. Remove or revise temporary conditions when resolved. The script does not auto-fill this block or reliably infer permanence. It is protected with the existing creator-notes prefix. Newer explicitly played events should override outdated starting details.

- Automatic card memory remains labelled source excerpts. Native summaries are now labelled fallible interpretations. These labels guide the model; they do not prove meaning or independently classify all dialogue inside narration.
- Pronoun-only memory attribution expires after two new passages without a named refresh, and clears on selected scene-transition phrases. Ambiguous multiple-character attribution is skipped. An unnamed newcomer can still cause a mistake; inspect affected notes if this happens.
- Diagnostics show supplied/skipped character references, current changes, and last memory write/header-recall candidates. Candidate lists do not prove which sentences the model used.

## Flexible play (optional AI Instructions addition)
Listed skills describe established capabilities, not an exhaustive menu. Allow creative applications and experiments. Judge attempts using established world rules, demonstrated ability, resources and circumstances. Do not invent an unlock requirement merely because an action is unfamiliar. Do not guarantee success or invent player choices. Preserve world lore and character identity, while allowing played events to change future canon.

This is an instruction, not a new scripted progression mechanic. No arc engine, forced quests or automatic power upgrades are introduced.

## Limits and validation
46 local tests pass, including missing-base retrieval, separate changes, expiry, ambiguous names, context budget and previous memory regression tests. Not tested inside live AI Dungeon yet. Names mentioned in dialogue can retrieve a reference without proving presence. Some scene changes will not be detected. Oversized or budget-exceeding references are skipped and reported. Secrets in a card still reach the model when that card is retrieved; viewpoint guidance is not a technical secrecy barrier.

Scene refresh remains manual (`/ck refresh`) unless explicitly enabled. Automatic scene extraction still uses the model and can misinterpret evidence. Existing compressed card memories are not automatically undone when story actions are edited or retried. Correct those notes manually when necessary.

The core reference remains the existing story-card entry; there is no duplicate permanent character database. No existing memory bank is deleted or reset. Automatic cards may still use maintenance turns for generation/compression.

---
Historical documentation below describes earlier releases; the 0.4.0 instructions above take precedence.

## 0.3.0 — incremental card-memory routing

Upgrade: replace only the Library tab with Library.js and save. Other hook tabs are unchanged. Existing card entries and memory notes remain. The first pass starts with six recent available actions; older events are not exhaustively backfilled. Existing native summaries can be copied as they appear in context. Add exact existing card titles (e.g. Mary Kim) to Memory cards in Continuity Control to enable their memory bank; otherwise only already managed Auto-Cards cards are eligible.

Changes: replaces the global pairwise native-memory similarity pass with an incremental queue. Per invocation it considers at most eight unseen history actions and twelve unseen native-memory lines, delivers at most four queued excerpt/card pairs across two cards, and keeps unprocessed deliveries for later. Exact deduplication is used within the destination bank; bounded similarity remains for other vendor entry-generation operations. Matching uses full card title or a unique first name of at least three characters. Pronoun-only passages can carry forward one prior named character, but this heuristic is fallible; ambiguous passages are not assigned. There is no additional model call for copying excerpts. An excerpt is not a semantic relationship update or confirmed fact. Speech is labelled as a statement; attempted actions do not imply success. Narration may itself contain errors.

Recall still uses existing active card headers and banks. Only cards participating in current recall or queued updates are considered for memory compression. Compression and new-card generation still use the vendor's model-dependent maintenance turns and may interrupt play. Scene refresh remains manual by default (/ck refresh); this patch does not make scene extraction invisible or automatic.

Limits: queue capacity 128 passages, processed fingerprint cache 1024, recent source window 80 actions, per-action/native-line size 4000 characters. Full queue retries still-visible passages later; oversized passages are left to native memory with a diagnostic warning, not silently truncated. Unprocessed events that fall outside available history cannot be recovered reliably. Queue diagnostics appear in Continuity Control Notes. Undo removes detectable pending history excerpts but does not retract already written/compressed card memories. Context rollback restores the queue alongside cards. Broad card discovery/recall still scans card metadata; this patch is not a guarantee against every timeout. More verbatim excerpts can grow card notes faster and require compression.

Validation: 39 local tests pass, including real card-note writes, deduplication on repeat, unrelated-card preservation, two-card limit, backlog draining, saturation retry, disabled-card recall, ambiguous pronouns, and queue rollback. No live adventure was modified or live model tested. Historical instructions below are superseded by this section.

## 0.2.4 — multi-field parsing and manual scene refresh by default
Plain-text Field/Value/Evidence blocks are parsed independently, up to five blocks. Invalid evidence, malformed blocks and locked fields are skipped with specific diagnostics while valid independent updates can be saved. Legacy JSON remains atomic. A location change clears old present/pending fields unless replaced by valid updates. Exact quote matching does not establish semantic support for every word in the interpreted value.

Automatic scene extraction is now OFF by default, including existing control cards that omit the new setting. Use /ck refresh at a convenient break; it consumes a generation and shows a short notice, then Continue resumes. Add Automatic scene updates: true to Entry only if you want the previous periodic interruptions. Scene tracking must remain true to allow refresh. Existing snapshots and locks are retained and continue to be injected, so manually refresh after meaningful scene changes; they can otherwise become stale. Auto-Cards and optional NPC behaviour are unchanged and may still use their own maintenance turns.

Replace ONLY Library.js in the Library tab. No restart needed. 33 local tests pass, including a supplied-output regression and default/manual scheduling. No new live platform test was performed. The historical documentation below is superseded where it conflicts with this section.

## 0.2.3 — plain-text compatibility trial
The live 0.2.2 output hook received zero characters. This does not establish whether generation was empty or platform processing removed content. Dedicated extraction now requests three plain-text lines (Field, Value, Evidence), or No change, rather than JSON. Evidence and lock validation are unchanged; legacy JSON remains accepted. Empty output is explicitly diagnosed. 31 local tests pass, live compatibility unverified. Replace only Library.js, save, and submit /ck refresh once.
Correction: live Inspect Input shows AI Dungeon still prepends AI Instructions to dedicated extraction. The script does not control that platform-added section.

## 0.2.2 — diagnostic revision, not a confirmed live fix
Requests one short field per extraction to reduce output length. Saves the first 1800 characters of the raw scene response and its full character count in Continuity Control Notes, even when parsing fails. This allows distinguishing truncation from formatting or instruction failures. 29 local tests pass; live success remains unverified. Replace Library.js, save, submit /ck refresh once, then inspect LAST RAW SCENE RESPONSE in Continuity Control Notes if rejected.

## 0.2.1 — quote-wrapper compatibility
Accepts matched triple-backtick, triple-single-quote and triple-double-quote JSON fences and JSON-encoded array strings. Invalid/incomplete JSON still rejected. Errors are brief and separated from prose. 28 local tests pass; live model compliance remains unverified. Replace only Library.js, save, then submit /ck refresh to test immediately.

# Continuity Kit 0.2.0

## Upgrade from 0.1.1
Replace ONLY the Library tab with Library.js, save, and press Continue once. Input.js, Context.js and Output.js are unchanged. Coordinator.js is already inside Library.js; do not install it separately. No adventure restart is required.

## What changed
Scene tracking now defaults to a dedicated bookkeeping turn. It requests a JSON array using only recent eligible story actions and the current record, without the normal storytelling instructions or lore deck. This is an intentional temporary extraction prompt, not a change to stored AI Instructions, cards, Plot Essentials or built-in memory. Normal story context is restored on the following turn.

A bookkeeping turn shows a short [Continuity update: ...] notice. Press Continue to resume. This consumes a generation; it is not a hidden background API call. It may interrupt the next story response after a player action; the action remains in history. A first update runs immediately, then every eight eligible story turns by default. Existing Scene interval settings are respected with a minimum of six for dedicated updates. Type /ck refresh to request one immediately. Set Scene tracking: false to disable this feature while retaining the card integration.

Updates can cover up to five fields. Every quote must match recent eligible story text; the entire batch is rejected on invalid data or a locked-field update. Failed updates retain the previous record and observe the cooldown. When location changes, stale present/pending fields are cleared unless replaced in the same valid batch. Utilities are excluded from scene evidence. A phrase filter rejects common invented player intentions; it is not a complete semantic verifier. Source matching proves the quote exists, not that the interpretation is correct. Existing source narration can itself be wrong.

Use Player name in Continuity Control to exclude your character from optional NPC simulation. Edit locked corrections in Entry, not Notes. Remove time locks when the timeline advances. NPC thoughts remain disabled by default. Legacy inline mode can be explicitly selected with Scene mode: inline, but it is not recommended for the reported DeepSeek failure.

Validation: 26 local integration tests pass (22 prior integration checks run with explicit legacy mode, plus four dedicated-mode tests). DeepSeek live compliance is not yet verified. No live adventure was modified by this download. Card memories and NPC thoughts remain model-dependent; undo support is limited as described below.

---
## Earlier documentation (historical; the upgrade instructions above take precedence)

# Update 0.1.1: card-creation compatibility fix

If you installed 0.1, replace only the Library tab with the new Library.js and Save. The other three tabs are unchanged. This fixes the undefined-title error when the platform returns a card object or ID instead of an array index. Saved records and settings remain.

# Continuity Kit 0.1 — first test build

One installation combining a compact current-scene tracker with modified Inner Self 1.0.2 and its bundled Auto-Cards 1.1.3. Based on LewdLeah's MIT-licensed work. This replaces the earlier Human Memory script; do not stack both installations.

## Install

1. Back up your current script tabs and export your story cards. For an isolated trial, duplicate the **scenario**, not just its adventure: adventures from the same scenario share its scripts.
2. In the scenario scripting editor, replace all four tabs with the corresponding files: Library.js, Input.js, Context.js, Output.js. Save.
3. Play one normal turn. Open Story Cards and search for **Continuity Control**. Settings and corrections are in Entry; the current scene and diagnostics are in Notes.
4. Set **Player name:** to your character's chosen name. This is especially important before enabling NPC thoughts.
5. For this Lookism start, add the following under LOCKED CORRECTIONS if it is still accurate:

   `time: Daniel Park's first day at J High.`

   Remove that line when story time should advance automatically. Locked means the script cannot update that field; it does not prevent the model ignoring an instruction.

If your existing adventure has the old humanMemoryV2 state, the installer disables that recorder and copies its latest player-confirmed present fields into editable locks. It does not import its entire archive, delete its records, or rewrite past adventure text. No /hm commands are required. Some old utility messages are filtered from the prompt; manually edited or separately summarised copies may remain.

## Default behaviour

- Auto-Cards: on. It can generate cards for recurring named subjects, collect matching memories exposed in the built-in `Memories:` context section, and compress/recall card memories.
- Current scene: on. Usually requests one small update every two available story turns (every available turn while no automatic scene is recorded). Card-generation and NPC-thought turns take priority. A scene update describes the situation **before** the accompanying continuation, so it can lag; newer narrative takes precedence over unlocked fields.
- NPC thoughts: off initially. They are included and tested, but optional because they use context and introduce subjective interpretations.
- Existing card memory attachment: exact titles Daniel Park, Zack Lee, Mira Kim and Zoe Park. Change **Memory cards:** to match the titles in your deck; up to 30 titles, comma separated. No new duplicate character card is needed. Titles not found are simply skipped.

Attaching adds a `{title: Name}` entry header and a memory section below the original notes. Existing entry content and original notes are preserved. Later hook processing protects those entries and original notes while allowing memory-section updates. This also blocks automatic regeneration/deletion of an established card through the vendor script; edit the card directly when intentional changes are needed. Removing a name from Memory cards prevents new attachment but does not detach one already attached; change its notes header to `{updates: false, limit: 3200}` to stop new memory collection. Already stored memories may still be recalled.

The entry of Continuity Control is a settings surface, not an event archive. Do not remove its reserved trigger. Notes are regenerated; write your corrections in Entry instead.

## Corrections

Supported fields: `time`, `location`, `present`, `stage`, `pending`, plus `fact1` through `fact8` for broader player-confirmed corrections. Each value is capped at 240 characters during injection.

Example:

```text
location: J High courtyard
fact1: Daniel and the player had never met before today.
pending: Daniel is waiting for the player's answer.
```

These lines are locked while present. Delete a line to release that lock. Use `pending: none` to explicitly state no unresolved interaction. Old automatic values can reappear when a lock is removed; check the Notes display.

Automatic fields require a short exact quote found in the last six eligible recent actions. Say actions are not accepted as direct scene evidence. A location change clears unlocked automatically stored people-present and pending-interaction fields rather than carrying them across rooms. Unknown is preferable to inventing missing information. The evidence check verifies text presence, not the truth of the model's interpretation; quoted dialogue within narrative is not semantically distinguished by code.

## Optional NPC thoughts

In **Configure Inner Self**, enable Inner Self, set the player name, and list NPC first names at the bottom of Notes, e.g. Daniel, Zack, Mira, Zoe on separate lines. Do not list your player. The Continuity Control player name provides an additional exclusion check.

Defaults: 10% brain allowance relative to recent story, 25% thought chance, two recent actions searched. Do/Say/Story turns halve that chance. Names mentioned in discussion can trigger an NPC even if physically absent; this is not a presence detector.

Each NPC has a Brain card. Thoughts are subjective, not confirmed world facts. Prefix a manually authored key with `core_` or `locked_` to prevent model overwrite, rename or deletion, e.g. `core_identity: I am Daniel, a new transfer student.` Edit those keys yourself in Notes. Ordinary thoughts remain AI-editable. Prompt rules restrict knowledge to witnessed/learned information, but cannot mathematically enforce privacy of facts visible to the model.

## How to check it

After a few normal turns, inspect Continuity Control Notes:

- **Mode: scene**: a current-scene update was requested.
- **Recorded location/time/etc.**: a grounded-format update was saved.
- **Valid empty scene update**: the model chose not to record a change.
- **Missing / incomplete / rejected**: no automatic scene update was saved; the reason is shown.
- **Mode: cards**: Auto-Cards owns this generation; scene tracking yields.
- **Mode: npc**: an optional NPC-thought task owns it.
- **Mode: bypass**: optional work was skipped rather than trimming core instructions.
- **Built-in Memories section seen: no**: card-memory harvesting may have nothing to collect. It cannot access the entire hidden Memory Bank. Check that the platform is supplying memories; context formatting may differ by model/settings.

The tracker is considered live-verified only after your actual model emits a supported update and it appears in Notes. Simulated tests do not establish this.

## Limits and trade-offs

- The built-in summary and Memory Bank are not directly overwritten. Recalled card memories and tracker instructions still consume context and can indirectly influence future native summaries.
- New card generation/compression can consume turns and affect story pacing. Scene and NPC task prefixes use response tokens. This is not a second free background model call.
- Current scene, NPC opinions and card memories have separate roles, but semantic contradictions can still occur. There is no universal automatic contradiction resolver.
- Scene source edits/undos are detected only within visible overlapping history; unknown non-overlap clears automatic scene fields. Auto-Cards and NPC memory reuse vendor behaviour and do **not** provide a complete transactional rewind of every card edit. Review after substantial retries/rewinds.
- Manual corrections are enforced for matching scene fields; corrections about broader facts guide the model but do not automatically purge conflicting passages from all card memories.
- Original card entries are protected, but AI-written memory notes can still contain mistakes. Compression is lossy. Review important developments.
- The coordinator defers work when it cannot fit. Vendor recent-story trimming remains, but fallback removal of leading/core sections was changed to defer. Token limits are estimated from the platform's character budget.
- This does not guarantee Lookism canon accuracy, stop every hallucination, or remember unlimited history.
- Local Node tests use mocked AI Dungeon hooks and model outputs. AI Dungeon's actual two-second/16 MB sandbox, DeepSeek output behaviour and optimized-context compatibility still require a live test.

## Developer files

`Library.js` is the complete installable script. `Coordinator.js`, `build.py`, `upstream/inner-self.js`, `tests/test.cjs`, CHANGES.md and LICENSE are included for inspection/rebuilding. Run `python build.py`, then `node tests/test.cjs`. Do not paste the developer files into extra script tabs.

Upstream: https://github.com/LewdLeah/Inner-Self and https://github.com/LewdLeah/Auto-Cards. This is an independent modified build, not an official upstream release.
