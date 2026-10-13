/* Guidance only: no semantic validator, presence inference, or extra AI calls. */
var CanonConsistency=(function(){
  const guidance='\n[CHARACTER CONSISTENCY]\nUse supplied character references at the adventure starting timeline, then apply established played developments and explicit player corrections. Preserve core personality, speech habits, appearance, values and world role unless a supported change explains otherwise. Do not rewrite identity to fill a convenient plot role or to make combat dramatic. Relationships and beliefs may evolve through experience; do not force future canon or reset earned development.\nA reference, mention, remembered event, or private NPC thought does not establish current presence. Before introducing a character, require a plausible route from established whereabouts, an opportunity to travel, and a reason consistent with their routine, duties, motives and knowledge. Unknown whereabouts remain unknown; do not invent prior meetings, followers, allegiances or a feared reputation. Usual locations are not permanent confinement. Prefer a fitting minor original NPC when a canon character would not fit.\nOnly current scene evidence establishes participation; an older snapshot may be stale. A name mentioned in dialogue is a reference, not an arrival. Do not teleport characters or give them knowledge of unwitnessed events without a plausible source.\nCard secrets are author background, not viewpoint knowledge. Reveal names, identities, powers and affiliations only when learned or observable. Describe unfamiliar people by visible features. Do not hint at secrets through omniscient phrasing or invent player observations, actions or reactions. If references conflict or are missing, omit the uncertain detail instead of inventing canon.\n[/CHARACTER CONSISTENCY]\n';
  function enrich(context,opts,max){
    const d=state.continuityKit01;
    if(opts.canon===false){d.canonStatus='Disabled';return context;}
    if(context.includes('[CHARACTER CONSISTENCY]')){d.canonStatus='Already supplied';return context;}
    if(max&&context.length+guidance.length>max){d.canonStatus='Skipped: insufficient context space';return context;}
    d.canonStatus='Guidance supplied; identity and presence are not mechanically verified';
    return context+guidance;
  }
  return {enrich};
})();
