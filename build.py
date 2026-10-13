from pathlib import Path
root=Path(__file__).parent
s=(root/'upstream/inner-self.js').read_text()
def replace(old,new,n=None):
 global s
 assert old in s,old[:100]
 s=s.replace(old,new) if n is None else s.replace(old,new,n)
replace('IS_INNER_SELF_ENABLED_BY_DEFAULT: true','IS_INNER_SELF_ENABLED_BY_DEFAULT: false')
replace('DEFAULT_NEW_CARDS_DO_MEMORY_UPDATES: false','DEFAULT_NEW_CARDS_DO_MEMORY_UPDATES: true')
replace('IS_AC_ENABLED_BY_DEFAULT: false','IS_AC_ENABLED_BY_DEFAULT: true')
replace('PERCENTAGE_OF_RECENT_STORY_USED_FOR_BRAINS: 30','PERCENTAGE_OF_RECENT_STORY_USED_FOR_BRAINS: 10')
replace('THOUGHT_FORMATION_CHANCE_PER_TURN: 60','THOUGHT_FORMATION_CHANCE_PER_TURN: 25')
replace('NUMBER_OF_ACTIONS_TO_LOOK_BACK_FOR_TRIGGERS: 5','NUMBER_OF_ACTIONS_TO_LOOK_BACK_FOR_TRIGGERS: 2')
replace('"- Create new information based on the context and story direction",','"- Record only information explicitly established in the played adventure; unknown stays unknown. Never invent new facts, future canon, prior meetings or player feelings.",')
replace('"- The paragraph below pertains to old events from far earlier in the story",','"- Preserve the actual chronology and uncertainty; do not assume the events are distant history. Retain corrections, negations, promises and unresolved plans.",')
replace('- Never repeat, novelty and uniqueness are top priorities','- Preserve established identity and continuity; never invent developments just to create a new thought')
replace('- ${agent.name} is both the namesake character in the story AND an agentic language model with meta goals.', '- ${agent.name} is a fictional NPC with limited knowledge, not an omniscient narrator.')
replace('- ${agent.name} dynamically adapts to achieve meta goals without ${ownership(config.player)} awareness.', '- ${agent.name} may form subjective opinions only from witnessed events or information plausibly learned. Do not read player thoughts or hidden canon. Suspicion is not fact.')
# Fix a precedence error in the bundled AC cleaner that discarded the Memories section.
replace(') + (right !== "") ? ("\\n\\n" + right) : "");', ') + ((right !== "") ? ("\\n\\n" + right) : ""));')
# Used-title cache persists while the local auto-card set does not. Rebuild per invocation.
replace('    O.f(AC);', '    AC.database.titles.used = [];\n    O.f(AC);')
# Explicit hook names take priority over incidental info properties.
replace('(hook === "context") || Number.isInteger(info.maxChars)', '(hook === "context") || ((typeof hook !== "string") && Number.isInteger(info.maxChars))')
# Surface vendor-caught errors in our control card as well as the console.
replace('log(error.message);','log(error.message); if (globalThis.ContinuityKit) ContinuityKit.notice(error.message);')
# Do not nominate the player as a simulated NPC even if accidentally configured.
replace('const agentLower = config.agents[a].toLowerCase();','const agentLower = config.agents[a].toLowerCase();\n                if (agentLower === String(config.player).toLowerCase() || (globalThis.ContinuityKit && ContinuityKit.isPlayer(agentLower))) continue;')
# Block deletions/renames/overwrites for manually protected NPC keys.
replace('if (!altered.has(delKey)) {','if (!altered.has(delKey) && !/^(locked_|core_)/i.test(delKey)) {')
replace('delete agent.brain[oldKey];','delete agent.brain[oldKey];')
replace('operations.push(() => {\n                    agent.brain[key] = agent.brain[oldKey];', 'if (/^(locked_|core_)/i.test(key) || /^(locked_|core_)/i.test(oldKey)) continue;\n                operations.push(() => {\n                    agent.brain[key] = agent.brain[oldKey];')
replace('        // Queue an assign operation\n        operations.push', '        // Protected player-authored identity keys cannot be overwritten automatically.\n        if (/^(locked_|core_)/i.test(key)) continue;\n        // Queue an assign operation\n        operations.push')
# Parse only the leading task, never arbitrary parentheses in dialogue.
# On overflow, defer instead of throwing away instructions/cards.
replace('                    context = context.slice(context.length - AC.signal.maxChars + 1);', '                    throw new Error("Continuity Kit: Auto-Cards context overflow; task deferred.");')
start=s.index('            // Phase 2: Truncate above the recent story')
end=s.index('        // Replace transient boundary markers',start)
s=s[:start]+'''            // Never remove plot components to fit optional thoughts.
            throw new Error("Continuity Kit: NPC context overflow; task deferred.");
        }
'''+s[end:]
# Bound duplicate comparison used by entry generation.
start=s.index('        function similarityScore(strA, strB) {')
end=s.index('        function splitBySentences', start)
s=s[:start]+(root/'similarity.js').read_text()+s[end:]
# Incremental target routing replaces the global memory-pair scan.
start=s.index('            const cardEvents = (function() {')
end=s.index('            // Remove auto card title headers',start)
s=s[:start]+"            const cardEvents = TargetedMemory.events(context, auto);\n"+s[end:]
replace('} else if (exceedsMemoryLimit()) {','} else if (cardEvents.has((card.entry.match(/^{title: *([^}]+)}/)||[])[1]?.toLowerCase()) && exceedsMemoryLimit()) {',1)
replace('                        const oldMemories = isolateMemories(extractCardMemories().text);','                        const oldMemories = isolateMemories(extractCardMemories().text);\n                        const exactMemories = new Set(oldMemories.map(m => m.replace(/^-\\s*/, "").trim()));',1)
replace('} else if (!oldMemories.some(oldMemory => (\n                                (0.8 < similarityScore(oldMemory, cardEvent.pendingMemories[i]))\n                            ))) {','} else if (!exactMemories.has(cardEvent.pendingMemories[i].trim())) {',1)
replace('                        AC.database.memories.associations[titleKey][1] = associationsHashed.latest(3500).serialize();','                        TargetedMemory.ack(titleKey, cardEvent.pendingMemories);\n                        AC.database.memories.associations[titleKey][1] = associationsHashed.latest(3500).serialize();',1)
(root/'Library.js').write_text('/*\n'+(root/'LICENSE').read_text()+'*/\n'+'/* Continuity Kit 0.6.6 — adapted Inner Self 1.0.2 / bundled Auto-Cards 1.1.3.\n * Upstream: LewdLeah, MIT; see LICENSE and CHANGES.md. */\n'+s+'\n'+(root/'Targeted.js').read_text()+'\n'+(root/'Canon.js').read_text()+'\n'+(root/'References.js').read_text()+'\n'+(root/'Profile.js').read_text()+'\n'+(root/'PlayerCharacter.js').read_text()+'\n'+(root/'GuidedArc.js').read_text()+'\n'+(root/'Coordinator.js').read_text())
library=root/'Library.js'
library.write_text(library.read_text()+'\n'+(root/'Family.js').read_text())
library.write_text(library.read_text()+'\n'+(root/'Mentions.js').read_text())
library.write_text(library.read_text()+'\n'+(root/'Events.js').read_text())
library.write_text(library.read_text()+'\n'+(root/'Review.js').read_text())
library.write_text(library.read_text()+'\n'+(root/'Timeline.js').read_text())
for name in ['Input','Context','Output']:
 (root/(name+'.js')).write_text('const modifier = (text) => ContinuityKit.run("'+name.lower()+'", text);\nmodifier(text);\n')
