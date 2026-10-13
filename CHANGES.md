# 0.6.4
- Creates a dedicated `PLAYER — <name>` card from the saved `[PLAYER PROFILE]` and separates stable creator facts, dynamic starting state and confirmed persistent changes.
- Supplies the authoritative player card on normal narrative turns without requiring a name mention; withholds it from scene, Auto-Cards and NPC maintenance turns.
- Adds `Player Character Review`. Detected ability, equipment, lasting-condition, relationship, status and achievement changes remain pending until the player confirms or corrects them. Explicit add, replace and remove requests are supported.
- Keeps profile replacement as the only route for stable-field changes. Dynamic replacement deactivates the previous record instead of presenting both as current.
- Excludes the script-owned cards and generic exact player-name cards from Continuity Kit mention/recall and Auto-Cards attachment paths. Protected-card restoration keeps bundled Auto-Cards operations from overwriting the authoritative entries.
- Adds no extra AI calls and makes no assumptions about an undocumented AI Dungeon Auto Cards API. Platform-created duplicate cards outside script hooks may still require manual cleanup.
- Preserves the original context at hard budget limits, all 0.6.3 behavior and saved state. Adds six integrated regression tests; 163 local tests pass. Live AI Dungeon validation has not been performed.

# 0.6.0
- Adds bounded, provisional event detection using literal English patterns, no additional model calls.
- Persistent pending review queue and /memory commands for confirmation, correction, dismissal, manual entries and pagination.
- Recalls up to three relevant confirmed historical records inside the existing supplemental character budget.
- Spaced optional review notices; no scene/card maintenance detection. Limits 200 records and 20 pending with explicit overflow notices.
- Existing archive entries are not automatically retracted by undo/retry; review is required. No semantic deduplication or automatic fact confirmation claimed.
- 127 local tests pass; live integration unverified.

# 0.5.5
- Evidence matching tolerates one matched surrounding quotation pair only after literal matching fails; enclosed words must still match exactly.
- Shared by dedicated and inline scene updates. Retains evidence length checks, player locks and raw diagnostics. Does not replay rejected updates.
- 115 local tests pass. No live platform verification.

# 0.5.4
- Suppress exact whole-block base duplicates, identical formatted references and repeated identical clarification blocks without deleting incoming context.
- Preserve new attributed changes and distinct selected-card identities; no fuzzy deduplication.
- Clarification guidance discourages repeating answered/unanswered questions without caching permanent relationship assumptions.
- Keep six cards / 6,000 supplemental characters, no extra AI calls. 110 local tests pass; not live tested.

# 0.5.3
- Current-input exact-title and explicit alias lookup, with duplicate/shared-match withholding and no factual writes.
- Adds singular relationship profile labels and conditional in-scene clarification guidance. Conversation replies never automatically rewrite the saved profile.
- Reuses supplemental budgets and maintenance suppression; no new AI calls or durable clarification database.
- Adds Mention references switch. 99 local tests pass; no live platform verification.

# 0.5.2
- Adds conservative current-input parent references resolved against explicit saved Mother/Father profile fields and unique exact card titles throughout the deck.
- Skips detected quotes/reported speech, ambiguous names and households, missing titles and duplicate titles. Adds no family traversal or AI calls.
- Shares existing supplemental context limits; preserves cards and native memory; clears requests after output and excludes maintenance turns.
- Defaults on; disable with `Family references: false` in Continuity Control Entry.
- Passes 77 integrated and 10 focused family tests. No live platform verification claimed.

# 0.5.1
- Captures a bounded, labelled `[PLAYER PROFILE]` block from a rendered Multiple Choice or Character Creator opening and persists recognised creator answers in adventure state.
- Reinjects the saved profile only on ordinary narrative turns after the opening leaves context; no additional AI calls or maintenance turns are added.
- Preserves exact parents, origin, ancestry, appearance, connection to Rudeus, birth details and selected gifts without requiring manual Continuity Control facts.
- Treats aptitude as potential rather than mastery. Birth routes with `Starting training: None` must learn through play; one primary gift has the strongest potential while secondary gifts remain weaker, incomplete, dormant or harder to develop.
- Protects the saved profile from silent replacement. Adds `/ck profile status`, `/ck profile replace`, and `/ck profile clear`.
- Accepts up to 20 recognised fields, 500 characters per value and 3,500 formatted characters. Unknown or malformed fields are ignored; fewer than two recognised fields are rejected.
- Withholds profile guidance from scene extraction, Auto-Cards generation/compression and NPC-thought maintenance turns, and preserves original context when it cannot fit.
- All 67 prior tests plus eight profile-specific tests pass (75 total).

# 0.5.0
- Adds an optional deterministic guided-arc layer using up to 40 exact existing story-card titles in player-authored order.
- Supplies only the current milestone and 0-2 lookahead cards on narrative turns, with explicit instructions not to trigger later events early or treat the plan as completed history.
- Preserves major canon when the player merely accompanies or assists, but honors materially changed causes and their consequences instead of forcibly restoring canon.
- Adds `/ck arc status`, `next`, `altered`, `skip`, `back`, `goto Exact Card Title`, and `reset`. Progress never advances merely because turns passed.
- Makes no extra AI calls, generates no freeform outline, and adds no random events. Existing context is never trimmed for arc guidance.
- Caps arc guidance at 3,800 characters and 1,400 characters per card; checks only the configured exact titles across the deck and excludes duplicates.
- Defaults off and is withheld from scene extraction, Auto-Cards generation/compression, and NPC-thought maintenance turns.
- All 60 prior tests plus seven guided-arc tests pass (67 total).

# 0.4.2
- Adds up to four exact-title always-include cards.
- Adds optional allowlisted word-overlap recall for up to 40 titles. An empty list now automatically selects suitable unique, non-system titles; an explicit list overrides it. Recall requires three distinctive matching title words and 20% coverage, returns at most one fallback, and withholds tied best scores.
- Adds optional `parent=Exact Card Title` triggers with two-level traversal, missing-parent handling and cycle detection.
- Shares a 6,000-character/six-card supplemental budget with a 2,500-character formatted-card cap; indexes only the first 500 cards and excludes duplicate titles.
- Keeps direct references ahead of parent references and preserves original context when additions do not fit.
- Does not add AI calls, random events or a fact archive. New retrieval options default off/empty and do not run on maintenance turns.
- The 50 prior tests plus ten feature tests pass (60 total). The supplied 169-card reference deck was inspected but not modified. No live AI Dungeon verification is claimed.

# 0.4.1
- Optional canon-consistency guidance with diagnostics; on by default.
- Separates reference retrieval from scene presence; reinforces stable identity, plausible entry, earned development and viewpoint limits through instructions.
- No new extraction calls or persistent world-state archive.
- Fresh defaults no longer contain Lookism character names or timeline examples.
- Preserves 0.4.0 hooks, card contents and state; 50 local tests pass.

# 0.4.0
Bounded character reference retrieval from existing configured cards; separate protected player-maintained changes; reference diagnostics; expiring pronoun routing and labelled native summaries. Seven new tests, 46 total. No live verification claimed. See README for limits and installation.

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

## 0.2.0
- Default dedicated scene extraction; normal narrative has no mixed scene-prefix task.
- Explicit /ck refresh, batched quote-validated updates, atomic rejection, cooldown after failure.
- Temporary extraction context contains recent evidence and current record only; normal context restored next generation.
- Common invented-player-intention guard and utility filtering.
- 26 local tests; live model compliance unverified.

# 0.1.1 compatibility patch

Card creation now resolves the created card from the live storyCards array. Tested native returns: index, object, string ID, undefined, boolean and copied object. The original 16 integration tests plus six new compatibility/recovery cases pass (22 total). The live screenshot identified the failing assumption; exact live return shape remains unobserved.

# Changes from upstream

Source: LewdLeah/Inner-Self, src/library.js, main fetched 2026-10-05 UTC.
Git blob SHA-1: fa6314244db0c13ff67f6ca5d4eadd3dc0ad33c9
Includes Inner Self 1.0.2 and bundled Auto-Cards 1.1.3. Original source is retained in upstream/inner-self.js; build.py applies explicit checked replacements.

## Reused

- Inner Self's coordinated Auto-Cards integration, entity detection, scheduling, card generation, memory collection/compression and recall.
- NPC key-value thought storage and prefix-operation parsing, optional by default.

## Changed

- Fixed the Memories cleaner's conditional-expression precedence so it retains the cleaned Memories section rather than discarding it.
- Rebuild the used-title cache on each Auto-Cards invocation because the local set of automatic-card names is not persistent.
- Prioritize explicit hook names over incidental info.maxChars presence.
- Provide a documented three-argument addStoryCard compatibility layer for vendor title/notes and returnCard usage.
- Enable Auto-Cards and new-card memory updates; disable NPC thoughts by default, lower their brain allowance to 10%, thought chance to 25%, and lookback to two actions.
- Replace the instruction to invent new facts; preserve actual chronology and uncertainty when compressing.
- Replace NPC meta-goal framing with limited character knowledge. Avoid novelty for its own sake.
- Protect core_ and locked_ NPC keys from model overwrite, rename and deletion. Exclude a known player name from NPC triggering.
- Interpret only a validated leading NPC task; return the original prose remainder, bypassing broad vendor line deletion for ordinary narration.
- Defer optional context operations instead of the vendor last-resort removal of core context. Recent-story trimming remains.
- Preserve established card entries and original note prefixes during vendor operations; allow managed memory-note updates.
- Attach selected existing characters to card-memory collection without replacing their original notes or creating duplicate character entries.
- Add a small five-field scene snapshot with exact recent-source quote validation; no second long-term event archive.
- Add editable corrections/settings and diagnostics in a control card. Disable/migrate the previous /hm recorder conservatively.

## Validation

16 simulated integration tests pass using isolated Node VM hooks and JSON-serialized persistent state. They cover installation, native-memory preservation, grounded scene parsing, locks, malformed/missing output, legacy migration, full-context fallback, visible undo invalidation, card memory collection and deduplication, generated cards, task scheduling, optional NPC updates, protected identity keys, player exclusion and a 159-card deck.

These tests use supplied model-output fixtures. They are not proof of model compliance or AI Dungeon runtime compatibility. The bundled upstream script is substantial; the local test maximum hook was approximately 132 ms, not a platform performance guarantee. Live deployment/installation has not been performed.
