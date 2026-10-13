/* Bounded provisional event archive. No extra model calls or silent confirmation. */
var EventMemory=(function(){
  const key=s=>String(s||'').trim().toLowerCase();
  const has=(s,n)=>n.length>=3&&new RegExp('(?:^|[^a-z0-9])'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^a-z0-9])','i').test(s);
  function data(){const d=state.continuityKit01;return d.events||(d.events={records:[],next:1,ticks:0,lastReminder:0,input:'',seen:[],overflow:false});}
  function entities(text){
    const out=[];const player=state.continuityKit01.profile?.fields?.Name;
    for(const name of [player,...storyCards.filter(c=>c.type!=='Brain'&&!/^__/.test(c.keys||'')&&!/Configure|Memory Review|Continuity Control|Debug Data|Prompt|Auto-Cards Guide/i.test(c.title||'')).map(c=>c.title)]){
      if(name&&has(text,name)&&!out.includes(name))out.push(name);if(out.length===8)break;
    }
    return out;
  }
  function remember(text){data().input=String(text||'').slice(0,4000);}
  function store(text,status,source){
    const d=data(),same=d.records.find(r=>key(r.text)===key(text));if(same)return same;
    if(d.records.length>=200||(status==='pending'&&d.records.filter(r=>r.status==='pending').length>=20)){d.overflow=true;return null;}
    const r={id:d.next++,text,status,entities:entities(text),source,turn:info.actionCount};d.records.push(r);return r;
  }
  function command(text){
    if(!/^\s*\/memory(?:\s|$)/i.test(text))return null;
    const d=data(),arg=text.trim().replace(/^\/memory\s*/i,''),m=/^(confirm|dismiss|correct)\s+(\d+)(?:\s+([\s\S]+))?$/i.exec(arg);
    if(m){const r=d.records.find(r=>r.id===Number(m[2]));if(!r)return 'No event with that ID.';
      const action=m[1].toLowerCase();if(action==='correct'){
        const value=(m[3]||'').trim();if(!value||value.length>400)return 'Use /memory correct ID followed by 1–400 characters.';
        r.previous=r.text;r.text=value;r.entities=entities(value);r.status='confirmed';r.source='player correction';
      }else if(action==='confirm'){r.status='confirmed';r.source='player confirmation';}
      else r.status='dismissed';
      return 'Event #'+r.id+' '+r.status+'.';
    }
    if(/^add\s/i.test(arg)){const value=arg.slice(4).trim();if(!value||value.length>400)return 'Use /memory add followed by 1–400 characters.';const r=store(value,'confirmed','player entry');return r?'Stored/found event #'+r.id+' ('+r.status+').':'Archive full; nothing was deleted.';}
    const page=/^page\s+(\d+)$/i.exec(arg);
    if(arg&&!page&&!/^pending$/i.test(arg))return 'Commands: /memory, /memory pending, /memory page 2, /memory confirm ID, /memory correct ID text, /memory dismiss ID, /memory add text';
    const rows=d.records.filter(r=>/^pending$/i.test(arg)?r.status==='pending':true).slice().reverse(),p=Math.max(1,Number(page?.[1]||1));
    return 'EVENT MEMORY — page '+p+'; '+d.records.filter(r=>r.status==='pending').length+' pending\n'+(rows.slice((p-1)*10,p*10).map(r=>'#'+r.id+' ['+r.status+'] '+r.text).join('\n')||'No records on this page.')+'\nUse /memory confirm ID, /memory correct ID text, or /memory dismiss ID.'+(d.overflow?'\nCapacity reached: automatic candidates may have been skipped; saved records were not deleted.':'');
  }
  function observe(text,opts){
    const d=data();if(opts.eventTracking===false)return text;
    const raw=String(text||'');if(!raw.trim()||raw.startsWith('[No story'))return text;
    // Repeated output hooks do not advance reminder timers or add records again.
    const signature=String(info.actionCount)+'\n'+raw.slice(-12000);
    if(d.seen.includes(signature))return text;
    d.seen.push(signature);d.seen=d.seen.slice(-8);d.ticks++;
    // Detect only bounded, literal sentences. A candidate is NEVER a fact yet.
    const sentences=(raw.slice(-12000).match(/[^.!?\n]+[.!?]?/g)||[]).slice(-40);let added=0;
    for(const s of sentences){const sentence=s.trim();
      if(sentence.length<20||sentence.length>400||/["“”]/.test(sentence)||/\b(?:said|says|heard|claims?|would|could|might|will|plans?|tries|tried|dream|imagin\w*)\b/i.test(sentence))continue;
      if(!/\b(?:defeated|beat|won|lost|joined|left|discovered|revealed|killed|died|prevented|interrupted|rescued|betrayed)\b/i.test(sentence)||!entities(sentence).length)continue;
      const before=d.records.length;store(sentence,'pending','automatic candidate');if(d.records.length>before&&++added>=2)break;
    }
    const pending=d.records.filter(r=>r.status==='pending');
    if(opts.eventReminders!==false&&(pending.length||d.overflow)&&(d.lastReminder===0||d.ticks-d.lastReminder>=8)){
      d.lastReminder=d.ticks;
      return raw+'\n\n[CK EVENT NOTICE: '+(pending.length?'Event #'+pending[0].id+' needs review; '+pending.length+' pending. Use /memory to review and confirm, correct or dismiss.':'')+(d.overflow?' Archive/queue capacity reached; some candidates were skipped.':'')+']';
    }
    return text;
  }
  function recall(opts,context){
    const d=data();if(opts.eventTracking===false||/^\s*\//.test(d.input))return '';
    const selected=d.records.filter(r=>r.status==='confirmed'&&r.entities.some(n=>has(d.input,n))).slice(-3);
    if(!selected.length)return '';
    const block='\n[CONFIRMED EVENT MEMORY — player-confirmed historical records, not proof of current presence or public knowledge; newer explicit corrections take priority.]\n'+selected.map(r=>'#'+r.id+': '+r.text).join('\n')+'\n[/CONFIRMED EVENT MEMORY]\n';
    return context.includes(block.trim())?'':block;
  }
  function clean(text){return text.replace(/\[CK EVENT NOTICE:[^\]\r\n]*\]/g,'').replace(/\[CK MEMORY COMMAND\][\s\S]*?\[\/CK MEMORY COMMAND\]/g,'');}
  function status(){const d=data();return '\nEVENT MEMORY\n'+d.records.length+'/200 records; '+d.records.filter(r=>r.status==='pending').length+'/20 pending.'+(d.overflow?' Capacity reached; candidates may have been skipped.':'')+' Use /memory to review.\n';}
  return {remember,command,observe,recall,clean,status};
})();
