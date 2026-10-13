/* Authored, deterministic story-arc guidance. No model calls and no automatic progression. */
var GuidedArc = (function () {
  'use strict';
  const MAX_PLAN=40, MAX_LOOKAHEAD=3, MAX_CARD=1400, MAX_TOTAL=3800;
  const key=s=>String(s||'').trim().toLowerCase();
  const clean=s=>String(s||'').replace(/^\{title:\s*[^}]+\}\s*/i,'').trim();
  function data(){
    const root=state.continuityKit01||(state.continuityKit01={});
    if(!root.arc)root.arc={position:0,status:{},signature:'',diagnostics:[]};
    return root.arc;
  }
  function plan(opts){return (opts.arcCards||[]).map(x=>String(x).trim()).filter(Boolean).slice(0,MAX_PLAN);}
  function reconcile(opts){
    const d=data(),p=plan(opts),sig=p.map(key).join('|');
    if(d.signature!==sig){
      const oldCurrent=d.currentTitle;
      d.signature=sig;d.position=oldCurrent?p.findIndex(x=>key(x)===key(oldCurrent)):0;
      if(d.position<0)d.position=0;
      const allowed=new Set(p.map(key));
      for(const k of Object.keys(d.status))if(!allowed.has(k))delete d.status[k];
    }
    if(d.position>p.length)d.position=p.length;
    d.currentTitle=p[d.position]||'';
    return p;
  }
  function current(opts){const p=reconcile(opts),d=data();return {p,d,title:p[d.position]||''};}
  function summary(opts){
    const {p,d,title}=current(opts);
    if(!p.length)return 'No arc cards are configured.';
    if(!title)return 'Arc complete: '+p.length+' of '+p.length+' milestones handled.';
    return 'Milestone '+(d.position+1)+'/'+p.length+': '+title+'.';
  }
  function command(text,opts){
    const m=/^\s*\/ck\s+arc(?:\s+(.*?))?\s*$/i.exec(String(text));if(!m)return null;
    const arg=String(m[1]||'status').trim(),x=current(opts),p=x.p,d=x.d;
    if(/^status$/i.test(arg))return {message:summary(opts)};
    if(/^reset$/i.test(arg)){d.position=0;d.status={};d.currentTitle=p[0]||'';return {message:'Arc progress reset. '+summary(opts)};}
    if(/^back$/i.test(arg)){if(d.position>0)d.position--;d.currentTitle=p[d.position]||'';if(d.currentTitle)delete d.status[key(d.currentTitle)];return {message:'Moved back. '+summary(opts)};}
    const go=/^goto\s+(.+)$/i.exec(arg);
    if(go){const i=p.findIndex(t=>key(t)===key(go[1]));if(i<0)return {message:'Arc card is not in the configured plan: '+go[1]};d.position=i;d.currentTitle=p[i];return {message:'Arc position changed. '+summary(opts)};}
    const action=/^(next|done|complete|completed|altered|changed|skip|skipped)$/i.exec(arg);
    if(action){
      if(!x.title)return {message:summary(opts)};
      const word=action[1].toLowerCase(),status=/altered|changed/.test(word)?'altered':/skip/.test(word)?'skipped':'completed';
      d.status[key(x.title)]=status;d.position=Math.min(p.length,d.position+1);d.currentTitle=p[d.position]||'';
      return {message:x.title+' marked '+status+'. '+summary(opts)};
    }
    return {message:'Arc commands: status, next, altered, skip, back, goto Exact Card Title, reset.'};
  }
  function indexedCards(titles){
    // Scan only the bounded configured title set, even when those cards are late in a large deck.
    const allowed=new Set(titles.map(key)),counts={};
    for(const c of storyCards){const k=key(c.title);if(allowed.has(k))counts[k]=(counts[k]||0)+1;}
    const map=new Map();for(const c of storyCards){const k=key(c.title);if(allowed.has(k)&&counts[k]===1)map.set(k,c);}
    return {map,counts};
  }
  function enrich(context,opts,max){
    const d=data();d.diagnostics=[];
    if(!opts.arcTracking)return context;
    const p=reconcile(opts);if(!p.length){d.diagnostics.push('Enabled, but no arc cards are configured.');return context;}
    const idx=indexedCards(p),wanted=[],limit=Math.max(1,Math.min(MAX_LOOKAHEAD,Number(opts.arcLookahead)||2));
    for(let i=d.position;i<p.length&&wanted.length<limit;i++){
      const k=key(p[i]);
      if((idx.counts[k]||0)>1){d.diagnostics.push(p[i]+': duplicate title excluded.');continue;}
      const c=idx.map.get(k);if(!c){d.diagnostics.push(p[i]+': exact card not found.');continue;}
      const body=clean(c.entry);if(!body){d.diagnostics.push(p[i]+': empty card skipped.');continue;}
      wanted.push({title:p[i],body:body.length>MAX_CARD?body.slice(0,MAX_CARD-15)+'\n[truncated]':body,index:i});
    }
    if(!wanted.length)return context;
    const intro='\n[GUIDED ARC — authored route, not a forced script]\nThese are upcoming canon milestones, not events that have already happened. Preserve a milestone when the player merely accompanies or helps the canon cast. Do not force player choices, teleport characters, reveal future knowledge, or introduce a milestone before its causes and location make sense. If played actions materially prevent or change a cause, honor those actions and follow the resulting consequences instead of undoing them to restore canon.\n';
    const close='[/GUIDED ARC]\n';let body='';
    for(let i=0;i<wanted.length;i++)body+=(i===0?'CURRENT POSSIBLE MILESTONE':'LATER — DO NOT START EARLY')+': '+wanted[i].title+'\n'+wanted[i].body+'\n';
    let addition=intro+body+close;
    if(addition.length>MAX_TOTAL){addition=addition.slice(0,MAX_TOTAL-close.length-15)+'\n[truncated]\n'+close;}
    if(max&&context.length+addition.length>max){d.diagnostics.push('Guidance skipped: insufficient context space.');return context;}
    d.diagnostics.push('Supplied '+wanted.length+' milestone card(s), starting at '+wanted[0].title+'.');
    return context+addition;
  }
  function status(opts){
    const d=data(),line=opts.arcTracking?summary(opts):'Disabled.';
    return '\nGUIDED ARC\n'+line+'\n'+(d.diagnostics||[]).join('\n')+'\n';
  }
  return {command,enrich,status};
})();
