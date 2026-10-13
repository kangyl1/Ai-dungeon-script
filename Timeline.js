/* Universal opt-in card references. Never infer completion or mutate canon. */
var CanonTimeline=(function(){
  'use strict';
  const START='[CANON EVENT]',END='[/CANON EVENT]';
  const key=x=>String(x||'').trim().toLowerCase();
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const has=(s,x)=>new RegExp('(?:^|[^\\p{L}\\p{N}])'+esc(x)+'(?=$|[^\\p{L}\\p{N}])','iu').test(s);
  const str=(x,n)=>typeof x==='string'&&x.trim().length>0&&x.length<=n;
  const list=(x,n)=>Array.isArray(x)&&x.length<=8&&x.every(v=>str(v,n));
  const content=c=>String(c.entry||c.value||'').replace(/^\{title:\s*[^}]+\}\s*/i,'').trim();
  function data(){const r=state.continuityKit01||(state.continuityKit01={});return r.timeline||(r.timeline={});}
  function parse(card){
    const raw=content(card);
    if(raw.length>6000||!raw.endsWith(END))throw Error('invalid wrapper/size');
    const e=JSON.parse(raw.slice(START.length,-END.length).trim());
    if(!e||e.schema!==1||!str(e.id,80)||!str(e.title,120)||!str(e.summary,800)||!str(e.source,240)||!['verified','approximate','uncertain'].includes(e.certainty))throw Error('invalid required fields');
    for(const k of ['cues','locations','participants','prerequisites','changes'])if(!list(e[k],k==='prerequisites'||k==='changes'?200:100))throw Error('invalid '+k);
    if(!e.cues.length&&!e.locations.length)throw Error('no retrieval cues');
    if(e.years!==null&&(!Array.isArray(e.years)||e.years.length!==2||!e.years.every(Number.isSafeInteger)||e.years[0]>e.years[1]))throw Error('invalid years');
    if(!str(e.calendar,40))throw Error('invalid calendar');
    return e;
  }
  function index(){
    const events=[],errors=[],counts=new Map();let marked=0;
    for(const card of storyCards){
      if(!content(card).startsWith(START))continue;
      if(++marked>200)continue;
      try{const e=parse(card);events.push(e);counts.set(key(e.id),(counts.get(key(e.id))||0)+1);}catch(e){errors.push(String(card.title||'Untitled')+': '+e.message);}
    }
    if(marked>200)return {events:[],errors:['More than 200 event cards; selection withheld.']};
    for(const [id,n]of counts)if(n>1)errors.push('Duplicate event id excluded: '+id);
    return {events:events.filter(e=>counts.get(key(e.id))===1),errors};
  }
  function latest(){return history.slice(-8).filter(a=>!['start','say','do'].includes(a.type)&&!/^\s*(?:\/|\[Continuity|\[CK|>>>)/i.test(a.text||a.rawText||'')).slice(-1).map(a=>String(a.text||a.rawText||'').slice(-4000))[0]||'';}
  function currentTime(text,lock){
    const raw=lock?String(lock).trim():(/^Current year:\s*([^\r\n.!?]+)(?:[.!?]|$)/im.exec(text)||[])[1];
    const m=/^([\p{L}][\p{L}\p{N}_-]{0,39}?)\s*(-?\d{1,9})$/u.exec(String(raw||'').trim());
    return m?{calendar:key(m[1]),year:Number(m[2])}:null;
  }
  function block(opts,context){
    const d=data();d.selected=[];d.errors=[];
    if(!opts.timeline){d.diagnostic=opts.mushokuTimeline?'Disabled; use Timeline helper: true with structured event cards.':'Disabled';return '';}
    if(context.includes('[CANON TIMELINE REFERENCE')){d.diagnostic='Already supplied';return '';}
    const idx=index();d.errors=idx.errors.slice(0,8);
    const text=latest(),time=currentTime(text,opts.locks&&opts.locks.time),location=String(opts.locks&&opts.locks.location||text);
    const candidates=[];
    for(const e of idx.events){
      const cue=e.cues.some(c=>has(text,c)),place=e.locations.some(p=>has(location,p));
      const comparable=time&&key(e.calendar)===time.calendar&&e.years!==null;
      const within=comparable&&time.year>=e.years[0]&&time.year<=e.years[1];
      if(!cue&&!(within&&place))continue;
      candidates.push({e,score:(cue?10:0)+(place?2:0)+(within?1:0),outside:comparable&&!within});
    }
    candidates.sort((a,b)=>b.score-a.score||key(a.e.id).localeCompare(key(b.e.id)));
    if(candidates.length>1&&candidates[0].score===candidates[1].score&&candidates[0].score<10){d.diagnostic='Ambiguous date/location; withheld';return '';}
    const intro='\n[CANON TIMELINE REFERENCE — background, NOT proof of present events]\nPlayed history overrides canon. Check prerequisites and whether events already happened or were prevented. Never replay events, force player actions, or reveal future secrets to characters. Dates describe baseline canon, not deadlines. Prerequisites and changes are narrator checks, NOT verified adventure state.\n';
    const end='[/CANON TIMELINE REFERENCE]\n';let body='';
    for(const c of candidates){
      if(d.selected.length===2)break;
      const e=c.e,b=JSON.stringify({title:e.title,when:e.years?e.calendar+' '+e.years.join(' to '):'Relative/unknown; see prerequisites',certainty:e.certainty,referenceOnlyOutsideDate:!!c.outside,participants:e.participants,locations:e.locations,canon:e.summary,checkBeforeUsing:e.prerequisites,changesMayInvalidate:e.changes,source:e.source})+'\n';
      if(intro.length+body.length+b.length+end.length>2800)continue;
      body+=b;d.selected.push(e.id);
    }
    d.diagnostic=d.selected.length?'Selected '+d.selected.join(', ')+' from '+idx.events.length+' valid event cards.':'No clear matching event (or entry exceeds timeline budget).';
    return body?intro+body+end:'';
  }
  function status(){const d=data();return '\nCANON TIMELINE\n'+(d.diagnostic||'Not evaluated')+'\n'+(d.errors||[]).join('\n')+'\n';}
  return {block,status};
})();
