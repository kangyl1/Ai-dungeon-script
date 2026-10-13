/* Conservative current-input lookup. No inference from generated narration. */
var FamilyReferences=(function(){
  const key=s=>String(s||'').trim().toLowerCase();
  function remember(text){
    const d=state.continuityKit01;
    d.familyRequest=null;
    const s=String(text||'');
    // Quoted/reported dialogue and commands are deliberately withheld.
    const reportCheck=s.replace(/^\s*(?:>\s*)?I\s+(?:ask|tell|say|write)\b/i,'');
    if(s.length>4000||/["“”«»]/.test(s)||/(?:^|\s)'[^']*'/.test(s)||/^\s*\//.test(s)||/\b(?:says?|said|asks?|asked|tells?|told|wrote|writes|quotes?|quoted)\b/i.test(reportCheck))return;
    const roles=[];
    if(/\bmy\s+(?:father|dad|papa)\b/i.test(s))roles.push('Father');
    if(/\bmy\s+(?:mother|mom|mum|mama)\b/i.test(s))roles.push('Mother');
    if(roles.length)d.familyRequest={roles,turn:info.actionCount};
  }
  function candidates(opts){
    const d=state.continuityKit01,r=d.familyRequest,p=d.profile;
    if(opts.familyReferences===false||!r||!p?.captured||r.turn!==info.actionCount)return [];
    // Names must be explicit profile values, never extracted from prose.
    // A described adoptive/step family makes generic parent terms ambiguous.
    if(/\b(?:adopt\w*|step\w*|foster\w*|guardian\w*)\b/i.test(p.fields.Family||'')){
      d.references.push('Family reference withheld: multiple possible parent roles.');return [];
    }
    const wanted=new Map();
    for(const role of r.roles){
      const name=key(p.fields[role]);
      if(!name||/\b(?:unknown|none|unspecified|deceased|missing|possibly|maybe|or)\b|[,;:/\n{}]/i.test(name))continue;
      wanted.set(name,role);
    }
    const found=new Map(),counts=new Map();
    for(const c of storyCards){const k=key(c?.title);if(wanted.has(k)){counts.set(k,(counts.get(k)||0)+1);found.set(k,c);}}
    const result=[];
    for(const [name,role] of wanted){
      const c=found.get(name);
      if(counts.get(name)!==1||c?.type==='Brain'||/^__continuity_control/.test(c?.keys||'')){
        d.references.push(role+': family reference skipped (missing or ambiguous exact title).');continue;
      }
      result.push({card:c,why:'saved profile '+role.toLowerCase()+' referenced in current player input'});
    }
    return result;
  }
  function clear(){state.continuityKit01.familyRequest=null;}
  return {remember,candidates,clear};
})();
