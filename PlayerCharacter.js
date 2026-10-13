/* Authoritative, always-supplied player card with player-confirmed dynamic changes. */
var PlayerCharacter=(function(){
  'use strict';
  const CARD_KEY='__ck_player_character__',REVIEW_KEY='__ck_player_character_review__';
  const MAX_CARD=5000,MAX_CHANGE=400,MAX_PENDING=20,MAX_CHANGES=40;
  const stableLabels=new Set(['Name','Gender','Pronouns','Origin','Previous life','Mother','Father','Parents','Family','Ancestry','Race','Brother','Sister','Sibling','Grandfather','Grandmother','Guardian','Connection to Rudeus','Primary gift','Secondary gifts','Innate talents','Appearance','Personality','Birth year','Starting age','Starting location','Background','Goal']);
  const dynamicLabels=new Set(['Mentor','Partner','Friend','Rival','Crew','Starting training','Limitations']);
  const common=new Set(('the a an and or but with without from into onto upon their his her your you they them this that these those has have had was were is are became becomes become gained learned mastered unlocked acquired obtained received found earned tamed equipped wielded lost destroyed broke broken suffered healed recovered joined left married befriended allied betrayed promoted demoted permanent permanently current currently new ability abilities technique techniques power powers skill skills item items equipment injury injuries relationship relationships status achievement player character').split(' '));
  const key=s=>String(s||'').trim().toLowerCase();
  function data(){
    const root=state.continuityKit01||(state.continuityKit01={}),d=root.playerCharacter||(root.playerCharacter={});
    const defaults={version:1,candidates:[],changes:[],nextCandidate:1,nextChange:1,seen:[],last:'Waiting for a valid [PLAYER PROFILE].'};
    for(const k of Object.keys(defaults))if(d[k]===undefined)d[k]=defaults[k];
    if(!Array.isArray(d.candidates)||!Array.isArray(d.changes)||!Array.isArray(d.seen))throw Error('Invalid player-character state; existing data preserved.');
    return d;
  }
  function profile(){const p=state.continuityKit01?.profile;return p?.captured?p:null;}
  function findCard(k){return storyCards.find(c=>c.keys===k);}
  function create(k,entry,type){addStoryCard(k,entry,type);const c=findCard(k);if(!c)throw Error('AI Dungeon did not expose player-character card '+k+'.');return c;}
  function category(text){
    const s=key(text);
    if(/\b(?:learned|mastered|unlocked|ability|technique|power|skill|tamed)\b/.test(s))return 'ability';
    if(/\b(?:acquired|obtained|received|found|earned|equipped|wielded|lost|destroyed|broke|item|equipment|weapon|tool)\b/.test(s))return 'equipment';
    if(/\b(?:injur|wound|scar|blind|crippl|lost (?:an? |the )?(?:arm|leg|eye)|healed|recovered)\w*/.test(s))return 'condition';
    if(/\b(?:married|befriended|allied|betrayed|relationship|partner|friend|rival|mentor)\b/.test(s))return 'relationship';
    if(/\b(?:joined|left|promoted|demoted|rank|title|status|faction|clan|guild)\b/.test(s))return 'status';
    return 'achievement';
  }
  function topic(text,cat){
    const player=key(profile()?.fields?.Name).split(/\s+/);
    const words=(key(text).match(/[a-z0-9]+/g)||[]).filter(w=>w.length>=3&&!common.has(w)&&!player.includes(w));
    return cat+':'+[...new Set(words)].slice(-5).sort().join('|');
  }
  function activeChanges(){return data().changes.filter(x=>x.active!==false);}
  function cardText(){
    const p=profile(),d=data();if(!p)return '';
    const stable=[],initial=[];
    for(const label of p.order||[]){const line=label+': '+p.fields[label];if(stableLabels.has(label))stable.push(line);else if(dynamicLabels.has(label))initial.push(line);}
    const confirmed=activeChanges().map(x=>'#'+x.id+' ['+x.category+'] '+x.text);
    let out='[PLAYER CHARACTER — AUTHORITATIVE]\nStable profile (changes only through explicit profile replacement):\n'+(stable.join('\n')||'None supplied.')+'\n\nDynamic starting state:\n'+(initial.join('\n')||'None supplied.')+'\n\nConfirmed persistent changes (newer entries override older conflicting facts):\n'+(confirmed.join('\n')||'None confirmed.')+'\n[/PLAYER CHARACTER]';
    if(out.length>MAX_CARD)out=out.slice(0,MAX_CARD-26).trimEnd()+'\n[card truncated safely]';
    return out;
  }
  function ensure(){
    const p=profile();if(!p)return null;
    const d=data(),name=p.fields.Name||'Main Character';let c=findCard(CARD_KEY)||create(CARD_KEY,'','Character');
    c.title='PLAYER — '+name;c.type='Character';c.entry=cardText();
    c.description='Continuity Kit authoritative player card. Always supplied on normal story turns by the script; do not add it to Auto-Cards or Memory cards. Stable fields come from [PLAYER PROFILE]. Dynamic changes appear only after player confirmation in Player Character Review. Generic player-named cards are not synchronized or treated as authoritative.\n\nLast result: '+d.last;
    let r=findCard(REVIEW_KEY)||create(REVIEW_KEY,'Request:','Continuity');r.title='Player Character Review';r.type='Continuity';
    const pending=d.candidates.filter(x=>x.status==='pending');
    r.description='PLAYER CHARACTER REVIEW — optional. Edit Entry with ONE request, then take a normal turn.\nRequest: confirm 1 | dismiss 1 | correct 1 New factual text | add category Factual text | replace CHANGE_ID New factual text | remove CHANGE_ID\nCategories: ability, equipment, condition, relationship, status, achievement. Nothing below changes the player card until confirmed.\n\nPENDING CANDIDATES:\n'+(pending.map(x=>'#'+x.id+' ['+x.category+'] '+x.text).join('\n')||'None')+'\n\nACTIVE CONFIRMED CHANGES:\n'+(activeChanges().map(x=>'#'+x.id+' ['+x.category+'] '+x.text).join('\n')||'None')+'\n\nLast result: '+d.last;
    return c;
  }
  function addChange(text,cat,source,replaceId){
    const d=data();text=String(text||'').trim();cat=cat||category(text);if(!text||text.length>MAX_CHANGE)return 'Change text must be 1–'+MAX_CHANGE+' characters.';
    if(!['ability','equipment','condition','relationship','status','achievement'].includes(cat))return 'Unknown category.';
    if(d.changes.length>=MAX_CHANGES)return 'Confirmed-change capacity reached; remove an old change first.';
    if(replaceId!==undefined){const old=d.changes.find(x=>x.id===replaceId&&x.active!==false);if(!old)return 'No active change #'+replaceId+'.';old.active=false;old.supersededBy=d.nextChange;}
    const t=topic(text,cat),same=d.changes.find(x=>x.active!==false&&key(x.text)===key(text));if(same)return 'Change #'+same.id+' is already active.';
    const r={id:d.nextChange++,category:cat,text,topic:t,source,active:true};d.changes.push(r);return 'Confirmed player change #'+r.id+'.';
  }
  function applyRequest(){
    const d=data(),r=findCard(REVIEW_KEY);if(!r)return;
    const lines=String(r.entry||'').split(/\r?\n/),requests=lines.filter(x=>/^Request:\s*\S/i.test(x));
    if(requests.length!==1){if(requests.length>1)d.last='Use one Request line; nothing changed.';return;}
    const raw=requests[0].replace(/^Request:\s*/i,'').trim();let m;
    if((m=/^(confirm|dismiss|correct)\s+(\d+)(?:\s+([\s\S]+))?$/i.exec(raw))){
      const candidate=d.candidates.find(x=>x.id===Number(m[2])&&x.status==='pending');
      if(!candidate)d.last='No pending candidate #'+m[2]+'.';
      else if(key(m[1])==='dismiss'){candidate.status='dismissed';d.last='Dismissed candidate #'+candidate.id+'.';}
      else {const text=key(m[1])==='correct'?String(m[3]||'').trim():candidate.text;if(!text)d.last='Correct requires replacement factual text.';else {d.last=addChange(text,category(text)||candidate.category,'player confirmation');candidate.status=d.last.startsWith('Confirmed')?'confirmed':'pending';}}
    }else if((m=/^add\s+(ability|equipment|condition|relationship|status|achievement)\s+([\s\S]+)$/i.exec(raw)))d.last=addChange(m[2],key(m[1]),'player entry');
    else if((m=/^replace\s+(\d+)\s+([\s\S]+)$/i.exec(raw))){const old=d.changes.find(x=>x.id===Number(m[1])&&x.active!==false);d.last=addChange(m[2],old?.category||category(m[2]),'player replacement',Number(m[1]));}
    else if((m=/^remove\s+(\d+)$/i.exec(raw))){const old=d.changes.find(x=>x.id===Number(m[1])&&x.active!==false);if(old){old.active=false;d.last='Removed active change #'+old.id+'.';}else d.last='No active change #'+m[1]+'.';}
    else d.last='Invalid request; use confirm, dismiss, correct, add, replace, or remove.';
    r.entry=lines.map(x=>/^Request:/i.test(x)?'Request:':x).join('\n');ensure();
  }
  function review(opts){if(opts.playerCard===false)return;ensure();applyRequest();ensure();}
  function remember(text){data().input=String(text||'').slice(0,4000);}
  function observe(text,opts){
    if(opts.playerCard===false||opts.characterChanges===false||!profile())return text;
    const d=data(),raw=String(text||''),signature=String(info.actionCount)+'\n'+raw.slice(-10000);if(!raw.trim()||d.seen.includes(signature))return text;
    d.seen.push(signature);d.seen=d.seen.slice(-8);const name=profile().fields.Name||'',first=name.split(/\s+/)[0];let added=0;
    const sentences=(raw.slice(-10000).match(/[^.!?\n]+[.!?]?/g)||[]).slice(-40);
    for(const sentenceRaw of sentences){const sentence=sentenceRaw.trim();if(sentence.length<20||sentence.length>MAX_CHANGE||/["“”]/.test(sentence)||/\b(?:said|says|claims?|might|could|would|plans?|tries|tried|imagines?|dreams?)\b/i.test(sentence))continue;
      const aboutPlayer=(name&&new RegExp('(?:^|[^a-z0-9])'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^a-z0-9])','i').test(sentence))||(first&&new RegExp('(?:^|[^a-z0-9])'+first.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^a-z0-9])','i').test(sentence))||/^you\b/i.test(sentence);
      if(!aboutPlayer||!/\b(?:learned|mastered|unlocked|gained|acquired|obtained|received|earned|tamed|equipped|lost|destroyed|broke|suffered|healed|recovered|joined|left|married|befriended|allied|betrayed|promoted|demoted)\b/i.test(sentence))continue;
      if(d.candidates.some(x=>key(x.text)===key(sentence))||d.changes.some(x=>key(x.text)===key(sentence)))continue;
      if(d.candidates.filter(x=>x.status==='pending').length>=MAX_PENDING)break;
      d.candidates.push({id:d.nextCandidate++,category:category(sentence),text:sentence,status:'pending',turn:info.actionCount});if(++added>=2)break;
    }
    if(added)d.last='Added '+added+' unconfirmed candidate'+(added===1?'':'s')+' for review; player card unchanged.';ensure();return text;
  }
  function enrich(context,opts,max){
    if(opts.playerCard===false)return PlayerProfile.enrich(context,max);
    const c=ensure();if(!c)return PlayerProfile.enrich(context,max);
    const rules='\n[PLAYER PROFILE RULES]\nThis script-owned player card is authoritative for the main character. Stable profile facts change only through explicit profile replacement. Dynamic facts change only after player confirmation. Do not let Auto Cards, generic story cards, absence from recent context, or model inference overwrite it. A gift or aptitude is potential, not unexplained mastery. Do not invent the player\'s thoughts, attraction, decisions, dialogue, or voluntary actions. Newer confirmed persistent changes override conflicting starting details.\n';
    const block=rules+'\n'+c.entry+'\n';if(context.includes(c.entry))return context.includes('[PLAYER PROFILE RULES]')?context:((!max||context.length+rules.length<=max)?context+rules:context);
    if(max&&context.length+block.length>max){data().last='Player card retained in story cards but not duplicated into a full context.';ensure();return context;}
    data().last='Authoritative player card supplied on narrative turn.';ensure();return context+block;
  }
  function status(){const d=data(),p=profile();return '\nPLAYER CHARACTER CARD\n'+(p?'Active: PLAYER — '+(p.fields.Name||'Main Character')+'; '+activeChanges().length+' confirmed dynamic change(s); '+d.candidates.filter(x=>x.status==='pending').length+' pending review.':'Waiting for a valid [PLAYER PROFILE].')+'\nStatus: '+d.last+'\n';}
  function isOwned(card){return !!card&&(card.keys===CARD_KEY||card.keys===REVIEW_KEY);}
  function isPlayerTitle(title){const name=profile()?.fields?.Name;return !!name&&key(title)===key(name);}
  return {ensure,review,remember,observe,enrich,status,isOwned,isPlayerTitle};
})();
