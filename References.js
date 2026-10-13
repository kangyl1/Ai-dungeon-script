/* Bounded supplemental reference retrieval. Candidates are NOT confirmed scene participants. */
var CharacterReferences=(function(){
  const LIMITS={index:500,cards:6,total:6000,card:2500,always:4,recall:40,parents:2};
  const stop=new Set(('a an and are as at be been being but by for from had has have he her hers him his i in into is it its me my of on or our ours she that the their theirs them they this to was we were with you your character card story').split(' '));
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const matches=(s,n)=>new RegExp('(?:^|[^a-z0-9])'+esc(n)+'(?=$|[^a-z0-9])','i').test(s);
  const key=s=>String(s||'').trim().toLowerCase();
  const words=s=>[...new Set(String(s||'').toLowerCase().match(/[a-z0-9]+/g)||[])].filter(w=>w.length>=3&&!stop.has(w));
  function indexCards(){
    const first=storyCards.slice(0,LIMITS.index).filter(c=>c&&c.type!=='Brain'&&String(c.title||'').trim()&&!(typeof PlayerCharacter!=='undefined'&&(PlayerCharacter.isOwned(c)||PlayerCharacter.isPlayerTitle(c.title))));
    const counts={};for(const c of first)counts[key(c.title)]=(counts[key(c.title)]||0)+1;
    const map=new Map();for(const c of first)if(counts[key(c.title)]===1)map.set(key(c.title),c);
    return {map,duplicates:new Set(Object.keys(counts).filter(k=>counts[k]>1))};
  }
  function recentText(){
    const actions=history.slice(-12).filter(a=>!/^\s*(?:\[Continuity|\/ck\b|>>>)/i.test(a.text||a.rawText||'')).slice(-3);
    let active=[];
    for(const a of actions){const s=String(a.text||a.rawText||'').slice(-4000);if(/\b(?:next day|next morning|hours later|meanwhile|elsewhere)\b/i.test(s))active=[];active.push(s);}
    return active;
  }
  function parents(card){
    const out=[];for(const part of String(card.keys||'').split(/[,;\n]/)){const m=/^\s*parent\s*=\s*(.+?)\s*$/i.exec(part);if(m&&m[1])out.push(m[1]);}return out;
  }
  function clip(s,n){s=String(s||'');return s.length<=n?s:s.slice(0,Math.max(0,n-16)).trimEnd()+'\n[truncated]';}
  // Whole, case-sensitive blocks only: never fuzzy-match or delete platform context.
  function containsBlock(context,block){
    if(!block)return false;
    let at=context.indexOf(block);
    while(at>=0){const end=at+block.length;
      if((at===0||context[at-1]==='\n')&&(end===context.length||context[end]==='\n'))return true;
      at=context.indexOf(block,at+1);
    }
    return false;
  }
  function format(card,context){
    const base=String(card.entry||'').replace(/^\{title:\s*[^}]+\}\s*/i,'').trim();
    const changes=/\[CK CHANGES\]([\s\S]*?)\[\/CK CHANGES\]/i.exec(card.description||'');
    const delta=changes?changes[1].trim():'';
    if(!base&&!delta)return null;
    const already=containsBlock(context,base);
    const deltaLabel='Player-maintained current changes (supersede conflicting starting details):\n';
    // Preserve attribution and precedence: raw delta text alone is not enough.
    const deltaAlready=!!delta&&(containsBlock(context,card.title+'\nBase reference already in context.\n'+deltaLabel+delta)||containsBlock(context,card.title+'\nStarting reference:\n'+(base?base+'\n':'')+deltaLabel+delta));
    if((!base||already)&&(!delta||deltaAlready))return null;
    const head='\n'+card.title+'\n',label=already?'Base reference already in context.\n':'Starting reference:\n';
    let tail=delta&&!deltaAlready?deltaLabel+delta+'\n':'';
    if(tail.length>LIMITS.card-head.length-label.length-16)tail=clip(tail,LIMITS.card-head.length-label.length-16)+'\n';
    const room=Math.max(0,LIMITS.card-head.length-label.length-tail.length);
    const body=already?'':clip(base,room)+(base?'\n':'');
    return clip(head+label+body+tail,LIMITS.card);
  }
  function enrich(context,opts,max){
    const diag=state.continuityKit01;diag.references=[];
    if(opts.references===false)return context;
    const indexed=indexCards(),seen=new Set(),direct=[],parentRefs=[];
    const add=(list,card,why)=>{const k=key(card?.title);if(!card||seen.has(k))return false;seen.add(k);list.push({card,why});return true;};
    const lookup=title=>{const k=key(title);if(indexed.duplicates.has(k)){diag.references.push(String(title)+': skipped (duplicate title)');return null;}const c=indexed.map.get(k);if(!c&&title)diag.references.push(String(title)+': skipped (missing or beyond 500-card index)');return c;};

    const mentions=typeof MentionReferences!=='undefined'?MentionReferences.resolve(opts):{items:[],hint:''};
    for(const item of mentions.items)add(direct,item.card,item.why);
    if(typeof FamilyReferences!=='undefined')for(const item of FamilyReferences.candidates(opts))add(direct,item.card,item.why);
    for(const title of (opts.always||[]).slice(0,LIMITS.always)){const c=lookup(title);if(c)add(direct,c,'always');}

    const configuredRecall=(opts.recallTitles||[]).slice(0,LIMITS.recall);
    const automaticRecall=opts.wordRecall&&!configuredRecall.length?[...indexed.map.values()].filter(c=>words(c.title).length>=3&&c.keys!=='__continuity_control_01__'&&!/Configure\s+(?:Auto-Cards|Inner Self)|Debug Data|Generation Prompt|Compression Prompt|Banned Titles|Auto-Cards Guide|Memory Review|Continuity Control/i.test(c.title)).slice(0,LIMITS.recall).map(c=>c.title):[];
    const recallPool=configuredRecall.length?configuredRecall:automaticRecall;
    if(opts.wordRecall&&!configuredRecall.length)diag.references.push('Automatic recall allowlist: '+recallPool.length+' eligible title(s).');
    const eligible=[...(opts.names||[]),...(opts.always||[]),...(opts.wordRecall?recallPool:[])].map(key);
    const allowed=new Set(eligible),cards=[...indexed.map.values()].filter(c=>allowed.has(key(c.title)));
    const firstCounts={};for(const c of cards){const f=key(c.title).split(/\s+/)[0];firstCounts[f]=(firstCounts[f]||0)+1;}
    const active=recentText();
    for(const s of active)for(const c of cards){const f=key(c.title).split(/\s+/)[0];if(matches(s,c.title)||(f.length>2&&firstCounts[f]===1&&matches(s,f)))add(direct,c,'direct mention');}

    if(opts.wordRecall){
      const bag=new Set(words(active.join(' '))),scored=[];
      for(const title of recallPool){
        const c=lookup(title);if(!c||seen.has(key(c.title)))continue;
        const tw=words(c.title),matched=tw.filter(w=>bag.has(w)).length,coverage=tw.length?matched/tw.length:0;
        if(matched>=3&&coverage>=0.20)scored.push({card:c,matched,coverage});
      }
      scored.sort((a,b)=>b.matched-a.matched||b.coverage-a.coverage||key(a.card.title).localeCompare(key(b.card.title)));
      if(scored.length){const a=scored[0],b=scored[1];if(b&&a.matched===b.matched&&a.coverage===b.coverage)diag.references.push('Word-overlap recall withheld (tied candidates).');else add(direct,a.card,'word-overlap recall');}
    }

    if(opts.parentLinks){
      for(const root of direct){if(root.why.startsWith('saved profile')||root.why.startsWith('explicit input'))continue;let level=[root.card],trail=new Set([key(root.card.title)]);for(let depth=1;depth<=LIMITS.parents;depth++){
        const next=[];for(const child of level)for(const title of parents(child)){const k=key(title);if(trail.has(k)){diag.references.push(child.title+': parent cycle stopped at '+title);continue;}trail.add(k);const c=lookup(title);if(c){if(!seen.has(k))add(parentRefs,c,'parent depth '+depth);next.push(c);}}
        level=next;if(!level.length)break;
      }}
    }

    const intro='\n[SUPPLEMENTAL REFERENCES — candidates, not proof of presence. Background may contain secrets: reveal only viewpoint-accessible facts. Explicit newer played events override starting conditions. Evidence-labelled memories are fallible; dialogue, intentions and attempts are not established outcomes. Temporary injuries do not automatically become permanent; friendly behaviour does not establish romance.]\n';
    const close='[/SUPPLEMENTAL REFERENCES]\n';
    const available=max?Math.max(0,max-context.length):LIMITS.total,budget=Math.min(LIMITS.total,available);
    let result='',count=0;
    const eventBlock=typeof EventMemory!=='undefined'?EventMemory.recall(opts,context):'';
    if(eventBlock&&intro.length+eventBlock.length+close.length<=budget){result=eventBlock;diag.references.push('Relevant confirmed events supplied within shared budget.');}
    if(mentions.hint){
      if(containsBlock(context,mentions.hint.trim()))diag.references.push('Identical clarification guidance already supplied.');
      else if(intro.length+result.length+mentions.hint.length+close.length<=budget){result+=mentions.hint;diag.references.push('Conditional clarification guidance supplied.');}
      else diag.references.push('Clarification withheld (context budget).');
    }
    for(const item of direct.concat(parentRefs)){
      if(count>=LIMITS.cards)break;
      const supplied=context+result;
      const original=format(item.card,'');
      if(original&&containsBlock(supplied,original.trim())){diag.references.push(item.card.title+': skipped (identical formatted reference already supplied)');continue;}
      const block=format(item.card,context);if(!block){diag.references.push(item.card.title+': skipped (empty or exact content already supplied)');continue;}
      if(containsBlock(supplied,block.trim())){diag.references.push(item.card.title+': skipped (identical formatted reference already supplied)');continue;}
      if(intro.length+result.length+block.length+close.length>budget){diag.references.push(item.card.title+': skipped (reference budget)');continue;}
      const base=String(item.card.entry||'').replace(/^\{title:\s*[^}]+\}\s*/i,'').trim();
      result+=block;count++;diag.references.push(item.card.title+': '+item.why+'; '+(base&&context.includes(base)?'base already supplied':'base added'));
    }
    const timeline=typeof CanonTimeline!=='undefined'?CanonTimeline.block(opts,context):'';
    if(timeline){
      if(intro.length+result.length+timeline.length+close.length<=budget){result+=timeline;diag.references.push('Timeline reference supplied within shared 6000-character budget.');}
      else {state.continuityKit01.timeline.diagnostic+='; withheld: shared reference budget full';diag.references.push('Timeline withheld: reference budget full.');}
    }
    return result?context+intro+result+close:context;
  }
  function status(){return '\nCHARACTER RETRIEVAL\n'+((state.continuityKit01.references||[]).join('\n')||'No supplemental references supplied this turn.')+'\n'+(typeof CanonTimeline!=='undefined'?CanonTimeline.status():'');}
  return {enrich,status};
})();
