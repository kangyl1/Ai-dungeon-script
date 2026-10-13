/* Fault-isolated review adapter. Preserve the existing event archive and IDs. */
EventMemory=(function(base){
  const KEY='__ck_memory_review__';
  function data(){
    const root=state.continuityKit01||(state.continuityKit01={}),d=root.events||(root.events={});
    const defaults={records:[],next:1,ticks:0,lastReminder:0,input:'',seen:[],overflow:false};
    for(const k of Object.keys(defaults))if(d[k]===undefined)d[k]=defaults[k];
    if(!Array.isArray(d.records)||!Array.isArray(d.seen))throw Error('Invalid event archive; preserved.');
    if(d.records.some(r=>!r||!Number.isSafeInteger(r.id)||typeof r.text!=='string'||!['pending','confirmed','dismissed'].includes(r.status)))throw Error('Invalid event record; preserved.');
    d.next=Math.max(Number(d.next)||1,1,...d.records.map(r=>r.id+1));
    return d;
  }
  function render(){
    const d=data();let c=storyCards.find(c=>c.keys===KEY);
    if(!c){addStoryCard(KEY,'Request:','Continuity');c=storyCards.find(c=>c.keys===KEY);if(!c)throw Error('Memory Review card unavailable.');}
    c.title='Memory Review';
    c.description='MEMORY REVIEW — optional. Edit Entry with ONE request: Request: confirm 1 OR Request: dismiss 1 OR Request: correct 1 New factual text. Applied on next normal story turn.\n'+
      'Tracking: '+(d.enabled===false?'off':'on')+' | Last narrative checked: '+(d.lastChecked??'none')+'\nPending: '+d.records.filter(r=>r.status==='pending').length+' | Total: '+d.records.length+'\nLast result: '+(d.result||'No review yet')+'\nLast error: '+(state.continuityKit01.eventError||'none')+'\n'+
      (d.overflow?'Capacity reached; existing records preserved.\n':'')+'\nPENDING (not facts):\n'+(d.records.filter(r=>r.status==='pending').map(r=>'#'+r.id+' '+r.text).join('\n')||'None')+'\n\nLATEST RESOLVED:\n'+d.records.filter(r=>r.status!=='pending').slice(-5).map(r=>'#'+r.id+' ['+r.status+'] '+r.text).join('\n');
  }
  function review(opts){
    const d=data();d.enabled=opts.eventTracking!==false;const c=storyCards.find(c=>c.keys===KEY);
    if(c){const lines=String(c.entry||'').split(/\r?\n/),requests=lines.filter(l=>/^Request:\s*\S/i.test(l));
      if(requests.length>1)d.result='Use one Request line; nothing changed.';
      else if(requests.length===1){const request=requests[0].replace(/^Request:\s*/i,'').trim();
        d.result=/^(?:confirm|dismiss|correct)\s+\d+(?:\s|$)/i.test(request)?base.command('/memory '+request):'Use confirm ID, dismiss ID, or correct ID text.';
        c.entry=lines.map(l=>/^Request:/i.test(l)?'Request:':l).join('\n');
      }
    }
    if(d.enabled||c)render();
  }
  function command(text){
    if(!/^\s*\/memory(?:\s|$)/i.test(text))return null;
    const d=data();d.result=base.command(text);render();return d.result;
  }
  function observe(text,opts){
    const d=data();d.enabled=opts.eventTracking!==false;if(!d.enabled)return text;
    const before=d.records.length;d.lastChecked=info.actionCount;
    base.observe(text,{...opts,eventReminders:false});render();
    return opts.eventReminders===true&&d.records.length>before?text+'\n\n[CK EVENT NOTICE: New candidates in Memory Review. Review is optional; keep playing.]':text;
  }
  function status(){const d=data();return '\nEVENT MEMORY\nTracking: '+(d.enabled===false?'off':'on')+'; last narrative checked: '+(d.lastChecked??'none')+'; '+d.records.length+' records; '+d.records.filter(r=>r.status==='pending').length+' pending.\nLast error: '+(state.continuityKit01.eventError||'none')+'\nReview in Memory Review story card; no command required.\n';}
  function safe(fn,fallback){return function(...args){try{data();return fn(...args);}catch(e){const root=state.continuityKit01||(state.continuityKit01={});root.eventError=String(e.message||e).slice(0,240);return typeof fallback==='function'?fallback(...args):fallback;}};}
  return {remember:safe(base.remember),command:safe(command,t=>/^\s*\/memory(?:\s|$)/i.test(t)?'Review unavailable; story continues.':null),review:safe(review),observe:safe(observe,t=>t),recall:safe(base.recall,''),clean:base.clean,status:safe(status,'\nEVENT MEMORY unavailable; archive preserved.\n')};
})(EventMemory);
