/* Universal opt-in canon references with explicit player approval. Never infer completion. */
var CanonTimeline=(function(){
  'use strict';
  const START='[CANON EVENT]',END='[/CANON EVENT]',NOTICE='[CANON EVENT APPROVAL]';
  const key=x=>String(x||'').trim().toLowerCase();
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const has=(s,x)=>new RegExp('(?:^|[^\\p{L}\\p{N}])'+esc(x)+'(?=$|[^\\p{L}\\p{N}])','iu').test(s);
  const str=(x,n)=>typeof x==='string'&&x.trim().length>0&&x.length<=n;
  const list=(x,n)=>Array.isArray(x)&&x.length<=8&&x.every(v=>str(v,n));
  const content=c=>String(c.entry||c.value||'').replace(/^\{title:\s*[^}]+\}\s*/i,'').trim();
  function data(){
    const r=state.continuityKit01||(state.continuityKit01={}),d=r.timeline||(r.timeline={});
    if(!d.decisions||typeof d.decisions!=='object')d.decisions={};
    if(!d.snoozed||typeof d.snoozed!=='object')d.snoozed={};
    if(!Number.isSafeInteger(d.tick))d.tick=0;
    return d;
  }
  function parse(card){
    const raw=content(card);
    if(raw.length>6000||!raw.endsWith(END))throw Error('invalid wrapper/size');
    const parsed=JSON.parse(raw.slice(START.length,-END.length).trim());
    const e={...parsed,
      calendar:parsed&&parsed.calendar===undefined?'':parsed&&parsed.calendar,
      years:parsed&&parsed.years===undefined?null:parsed&&parsed.years,
      locations:parsed&&parsed.locations===undefined?[]:parsed&&parsed.locations,
      participants:parsed&&parsed.participants===undefined?[]:parsed&&parsed.participants,
      prerequisites:parsed&&parsed.prerequisites===undefined?[]:parsed&&parsed.prerequisites,
      changes:parsed&&parsed.changes===undefined?[]:parsed&&parsed.changes
    };
    if(!e||e.schema!==1||!str(e.id,80)||!str(e.title,120)||!str(e.summary,800)||!str(e.source,240)||!['verified','approximate','uncertain'].includes(e.certainty))throw Error('invalid required fields');
    for(const k of ['cues','locations','participants','prerequisites','changes'])if(!list(e[k],k==='prerequisites'||k==='changes'?200:100))throw Error('invalid '+k);
    if(!e.cues.length&&!e.locations.length)throw Error('no retrieval cues');
    if(e.years!==null&&(!Array.isArray(e.years)||e.years.length!==2||!e.years.every(Number.isSafeInteger)||e.years[0]>e.years[1]))throw Error('invalid years');
    if(e.years!==null&&!str(e.calendar,40))throw Error('invalid calendar');
    if(e.years===null&&e.calendar!==''&&!str(e.calendar,40))throw Error('invalid calendar');
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
  function clean(s){return String(s||'').replace(/\n?\[CANON EVENT APPROVAL\][\s\S]*?\[\/CANON EVENT APPROVAL\]\n?/g,'');}
  function latest(){return history.slice(-8).filter(a=>!['start','say','do'].includes(a.type)&&!/^\s*(?:\/|\[Continuity|\[CK|>>>)/i.test(a.text||a.rawText||'')).slice(-1).map(a=>clean(String(a.text||a.rawText||'')).slice(-4000))[0]||'';}
  function currentTime(text,lock){
    const raw=lock?String(lock).trim():(/^Current year:\s*([^\r\n.!?]+)(?:[.!?]|$)/im.exec(text)||[])[1];
    const m=/^([\p{L}][\p{L}\p{N}_-]{0,39}?)\s*(-?\d{1,9})$/u.exec(String(raw||'').trim());
    return m?{calendar:key(m[1]),year:Number(m[2])}:null;
  }
  function when(e){return e.years?e.calendar+' '+e.years.join(' to '):'';}
  function candidates(opts){
    const d=data(),idx=index();d.errors=idx.errors.slice(0,8);
    const text=latest(),time=currentTime(text,opts.locks&&opts.locks.time),location=String(opts.locks&&opts.locks.location||text),found=[];
    for(const e of idx.events){
      const cue=e.cues.some(c=>has(text,c)),place=e.locations.some(p=>has(location,p));
      const comparable=time&&key(e.calendar)===time.calendar&&e.years!==null;
      const within=comparable&&time.year>=e.years[0]&&time.year<=e.years[1];
      if(!cue&&!(within&&place))continue;
      found.push({e,score:(cue?10:0)+(place?2:0)+(within?1:0),outside:comparable&&!within});
    }
    found.sort((a,b)=>b.score-a.score||key(a.e.id).localeCompare(key(b.e.id)));
    if(found.length>1&&found[0].score===found[1].score&&found[0].score<10)return {idx,found:[],ambiguous:true};
    return {idx,found,ambiguous:false};
  }
  function reconcile(d,idx){
    const valid=new Set(idx.events.map(e=>key(e.id)));
    for(const id of Object.keys(d.decisions))if(!valid.has(id))delete d.decisions[id];
    for(const id of Object.keys(d.snoozed))if(!valid.has(id))delete d.snoozed[id];
    if(d.pending&&!valid.has(key(d.pending.id)))d.pending=null;
  }
  function decide(choice){
    const d=data(),p=d.pending;
    if(!p)return {message:'No canon event is waiting for approval.'};
    const id=key(p.id),title=p.title;
    if(choice==='postpone'){
      d.snoozed[id]=d.tick+3;d.pending=null;d.notify=false;
      return {message:title+' postponed. It will be offered again after three eligible story turns.'};
    }
    d.decisions[id]=choice;delete d.snoozed[id];d.pending=null;d.notify=false;
    return {message:title+(choice==='allow'?' approved in its canon form.':choice==='alter'?' approved only in an altered form that follows played history.':' skipped and will remain withheld.')};
  }
  function command(text,opts){
    const m=/^\s*\/ck\s+event(?:\s+(.*?))?\s*$/i.exec(String(text));if(!m)return null;
    const arg=String(m[1]||'status').trim().toLowerCase(),d=data();
    if(arg==='status')return {message:summary(opts)};
    if(['allow','alter','postpone','skip'].includes(arg))return decide(arg);
    if(arg==='reset'){
      d.decisions={};d.snoozed={};d.pending=null;d.notify=false;
      return {message:'Canon-event approvals reset. Matching events will be offered again.'};
    }
    return {message:'Event commands: status, allow, alter, postpone, skip, reset.'};
  }
  function block(opts,context){
    const d=data();d.selected=[];d.errors=[];
    if(!opts.timeline){d.pending=null;d.notify=false;d.diagnostic=opts.mushokuTimeline?'Disabled; use Timeline helper: true with structured event cards.':'Disabled';return '';}
    if(context.includes('[CANON TIMELINE REFERENCE')){d.diagnostic='Already supplied';return '';}
    const match=candidates(opts),idx=match.idx;reconcile(d,idx);d.tick++;
    if(match.ambiguous){d.diagnostic='Ambiguous date/location; withheld';return '';}
    const approved=[];
    for(const c of match.found){
      const id=key(c.e.id),choice=d.decisions[id];
      if(choice==='allow'||choice==='alter'){approved.push({...c,choice});continue;}
      if(choice==='skip')continue;
      if(opts.timelineApproval!==false){
        if((d.snoozed[id]||0)>d.tick)continue;
        if(!d.pending){d.pending={id:c.e.id,title:c.e.title,when:when(c.e),summary:c.e.summary};d.notify=true;}
        else if(key(d.pending.id)===id&&d.tick>=(d.nextReminder||Infinity))d.notify=true;
      }else approved.push({...c,choice:'legacy'});
    }
    const intro='\n[CANON TIMELINE REFERENCE — background, NOT proof of present events]\nPlayed history overrides canon. Check prerequisites and whether events already happened or were prevented. Never replay events, force player actions, or reveal future secrets to characters. Dates describe baseline canon, not deadlines. Prerequisites and changes are narrator checks, NOT verified adventure state.\n';
    const end='[/CANON TIMELINE REFERENCE]\n';let body='';
    for(const c of approved){
      if(d.selected.length===2)break;
      const e=c.e,reference={title:e.title,playerDecision:c.choice==='alter'?'ALTER — preserve the event only in a form consistent with played history':c.choice==='allow'?'ALLOW — canon form may occur if prerequisites still hold':undefined,certainty:e.certainty,referenceOnlyOutsideDate:!!c.outside,participants:e.participants,canon:e.summary,checkBeforeUsing:e.prerequisites,changesMayInvalidate:e.changes,source:e.source};
      if(when(e))reference.when=when(e);
      if(e.locations.length)reference.locations=e.locations;
      const b=JSON.stringify(reference)+'\n';
      if(intro.length+body.length+b.length+end.length>2800)continue;
      body+=b;d.selected.push(e.id);
    }
    const waiting=d.pending?' Waiting for approval: '+d.pending.title+'.':'';
    d.diagnostic=d.selected.length?'Selected '+d.selected.join(', ')+' from '+idx.events.length+' valid event cards.'+waiting:waiting.trim()||'No clear matching approved event (or entry exceeds timeline budget).';
    return body?intro+body+end:'';
  }
  function notice(){
    const d=data();if(!d.pending||!d.notify)return '';
    d.notify=false;d.nextReminder=d.tick+4;
    return '\n\n'+NOTICE+'\nApproaching: '+d.pending.title+(d.pending.when?' ('+d.pending.when+')':'')+'\n'+d.pending.summary+'\nThis event is withheld until you decide. Reply with /ck event allow, /ck event alter, /ck event postpone, or /ck event skip.\n[/CANON EVENT APPROVAL]';
  }
  function summary(opts){
    const d=data(),decided=Object.values(d.decisions||{}).reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{});
    if(!opts||!opts.timeline)return 'Canon Timeline is disabled.';
    return (d.pending?'Waiting for approval: '+d.pending.title+(d.pending.when?' ('+d.pending.when+')':'')+'.':'No canon event is waiting for approval.')+' Decisions: '+(Object.keys(decided).map(k=>k+' '+decided[k]).join(', ')||'none')+'.';
  }
  function status(){const d=data();return '\nCANON TIMELINE\n'+(d.diagnostic||'Not evaluated')+'\n'+(d.pending?'Approval pending: '+d.pending.title+'\n':'')+(d.errors||[]).join('\n')+'\n';}
  return {block,command,notice,clean,status};
})();
