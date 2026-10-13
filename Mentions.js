/* Retrieval hints only: never writes relationships, outcomes or scene presence. */
var MentionReferences=(function(){
  const key=s=>String(s||'').trim().toLowerCase();
  const match=(s,n)=>n.length>=3&&new RegExp('(?:^|[^a-z0-9])'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^a-z0-9])','i').test(s);
  function remember(text){
    const d=state.continuityKit01,s=String(text||'');
    d.mentionRequest=!/^\s*\//.test(s)&&s.length<=4000?{text:s,turn:info.actionCount}:null;
  }
  function resolve(opts){
    const d=state.continuityKit01,r=d.mentionRequest;
    if(opts.mentionReferences===false||!r||r.turn!==info.actionCount)return {items:[],hint:''};
    const names=new Map(),titles=new Map(),items=[],issues=[],seen=new Set();
    const register=(map,n,c)=>{n=key(n);if(n.length<3)return;if(!map.has(n))map.set(n,[]);if(!map.get(n).includes(c))map.get(n).push(c);};
    for(const c of storyCards){
      if(!c||c.type==='Brain'||/^__continuity_control/.test(c.keys||'')||(typeof PlayerCharacter!=='undefined'&&(PlayerCharacter.isOwned(c)||PlayerCharacter.isPlayerTitle(c.title)))||/Configure (Auto-Cards|Inner Self)|Debug Data|Generation Prompt|Compression Prompt|Banned Titles|Auto-Cards Guide|Memory Review|Continuity Control/i.test(c.title||''))continue;
      register(titles,c.title,c);register(names,c.title,c);
      // Explicit alias metadata only; ordinary keyword triggers are not names.
      for(const part of String(c.keys||'').split(/[,;\n]/)){const m=/^\s*alias\s*=\s*(.+?)\s*$/i.exec(part);if(m)register(names,m[1],c);}
    }
    const add=c=>{if(!seen.has(key(c.title))){seen.add(key(c.title));items.push({card:c,why:'explicit input reference (not a confirmed fact)'});}};
    const hits=[...names.keys()].filter(n=>match(r.text,n));
    for(const n of hits){
      if(hits.some(long=>long!==n&&long.includes(n)&&match(long,n)))continue;
      const cs=names.get(n);
      if(cs.length===1&&(titles.get(key(cs[0].title))||[]).length===1)add(cs[0]);
      else issues.push('An explicitly mentioned name has multiple card matches.');
    }
    // Only explicit first-person ownership; do not resolve an NPC's "my brother".
    const safe=!/["“”«»]/.test(r.text)&&!/(?:^|\s)'[^']*'/.test(r.text)&&! /\b(?:says?|said|asks?|asked|tells?|told|writes?|wrote)\b/i.test(r.text.replace(/^\s*(?:>\s*)?I\s+(?:ask|tell|say|write)\b/i,''));
    if(safe){
      const roles=['brother','sister','sibling','grandfather','grandmother','guardian','mentor','partner','friend','rival','crew','father','dad','mother','mom','mum'];
      const f=d.profile?.captured?d.profile.fields:{};
      for(const role of roles){
        if(!new RegExp('\\bmy\\s+'+role+'\\b','i').test(r.text))continue;
        if(opts.familyReferences===false&&['father','dad','mother','mom','mum'].includes(role))continue;
        const label=({dad:'Father',mom:'Mother',mum:'Mother'})[role]||role[0].toUpperCase()+role.slice(1);
        const value=key(f[label]),cs=titles.get(value)||[];
        const household=['Father','Mother'].includes(label)&&/\b(?:adopt\w*|step\w*|foster\w*|guardian\w*)\b/i.test(f.Family||'');
        if(value&&cs.length===1&&!household&&!/[,;\n]|\b(?:unknown|none|or)\b/.test(value))add(cs[0]);
        else issues.push('The reference "my '+role+'" has no unique verified card match.');
      }
    }
    const hint=issues.length?'\n[REFERENCE CLARIFICATION]\n'+[...new Set(issues)].slice(0,3).join('\n')+'\nA missing card is not proof the story lacks an answer. First use clearly established recent conversation and the saved profile. Do not repeat an already answered question about the same referent, or keep pressing an unanswered one; preserve uncertainty without guessing. Ask again only if identity matters and the referent or situation has changed. Otherwise ask at most one brief natural question if needed. Respect speaker knowledge; do not assume several siblings exist. Invent no relatives, names, player dialogue or present speaker. Without a suitable NPC, use brief narrator clarification only if necessary. Answers apply to this conversation, not permanent profile changes. Claims and memories do not prove events or presence.\n[/REFERENCE CLARIFICATION]\n':'';
    return {items,hint};
  }
  function clear(){state.continuityKit01.mentionRequest=null;}
  return {remember,resolve,clear};
})();
