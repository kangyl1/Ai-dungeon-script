/* Incremental routing into existing Auto-Cards banks; no parallel fact archive. */
var TargetedMemory = (function(){
  const NS='ckTargeted01';
  const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return s.length+':'+(h>>>0);};
  function stateData(){return state[NS]||(state[NS]={seen:[],queue:[],processed:0,warnings:[],lastWindow:[],cast:[]});}
  const warn=s=>{const d=stateData();if(!d.warnings.includes(s))d.warnings.push(s);d.warnings=d.warnings.slice(-4);};
  function mentions(text,name){const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(?:^|[^a-z0-9])'+escaped+'(?=$|[^a-z0-9])','i').test(text);}
  function events(context,auto){
    const d=stateData(),allowed=new Set(auto),cards=storyCards.filter(c=>{const m=/^\{title:\s*([^}]+)\}/i.exec(c.entry||'');return m&&allowed.has(m[1].trim().toLowerCase())&&/\{updates:\s*true,/i.test(c.description||'');});
    const titles=cards.map(c=>/^\{title:\s*([^}]+)\}/i.exec(c.entry)[1].trim().toLowerCase());
    const firstCounts=new Map();for(const t of titles){const n=t.split(/\s+/)[0];firstCounts.set(n,(firstCounts.get(n)||0)+1);}
    const match=(text,t)=>mentions(text,t)||(firstCounts.get(t.split(/\s+/)[0])===1&&t.split(/\s+/)[0].length>2&&mentions(text,t.split(/\s+/)[0]));
    const recent=history.slice(-80).map(a=>({text:String(a.text||a.rawText||'').trim(),type:a.type})).filter(a=>a.text&&!a.text.startsWith('[Continuity update:')&&!a.text.startsWith('>>>')&&!/^\/ck\b/i.test(a.text));
    const window=recent.map(a=>hash(a.text));
    const overlap=d.lastWindow.findIndex(h=>window.includes(h));
    if(overlap>=0){const removed=new Set(d.lastWindow.slice(overlap).filter(h=>!window.includes(h)));d.queue=d.queue.filter(j=>!removed.has(j.source));}
    else if(d.lastWindow.length&&window.length){warn('History no longer overlaps; queued history excerpts cleared. Saved card memories are not rolled back.');d.queue=d.queue.filter(j=>j.kind!=='history');d.cast=[];}
    d.lastWindow=window;
    const add=(key,text,targets,source,kind)=>{
      if(d.seen.includes(key))return true;
      if(!targets.length){d.seen.push(key);return true;}
      if(d.queue.length>=128){warn('Memory queue full; remaining visible passages will be retried next turn.');return false;}
      d.queue.push({key,text,targets,source,kind});d.seen.push(key);return true;
    };
    // Bounded incremental history scan. On first installation only seed six recent actions.
    const scan=d.initialized?recent:recent.slice(-6);
    if(!d.initialized)for(const a of recent.slice(0,-6))d.seen.push('h:'+hash(a.text));
    d.initialized=true;
    let scanned=0;
    for(const a of scan){
      const id=hash(a.text),key='h:'+id;if(d.seen.includes(key))continue;
      if(++scanned>8)break;
      d.castAge=(d.castAge||0)+1;
      if(d.castAge>2||/\b(?:next day|next morning|hours later|meanwhile|elsewhere)\b/i.test(a.text))d.cast=[];
      let targets=titles.filter(t=>match(a.text,t));
      // Carry only one previous explicitly mentioned character for pronoun-only passages.
      if(!targets.length&&d.cast.length===1&&/\b(?:she|he|her|him)\b/i.test(a.text))targets=d.cast.filter(t=>titles.includes(t));
      else if(!targets.length&&/\b(?:she|he|her|him)\b/i.test(a.text)&&d.cast.length>1)warn('Ambiguous pronoun-only passage left to native story memory; no character attribution guessed.');
      if(a.text.length>4000){warn('A history action exceeded the excerpt limit; left to native memory rather than truncated.');d.seen.push(key);continue;}
      const label=a.type==='say'?'Dialogue excerpt (a statement, not verified fact)':a.type==='do'?'Player action excerpt (outcome not assumed)':'Played story excerpt (narration, not independently verified)';
      if(!add(key,label+': '+norm(a.text),targets,id,'history'))break;
      const explicit=titles.filter(t=>match(a.text,t));if(explicit.length){d.cast=explicit;d.castAge=0;}
    }
    // Reuse native summaries as they arrive, without comparing every memory pair.
    const m=/Memories\s*:\s*([\s\S]*?)(?:Recent\s*Story\s*:|$)/i.exec(context);
    if(m){let n=0;for(const line of m[1].split(/\n/).map(norm).filter(Boolean)){
      const key='m:'+hash(line);if(d.seen.includes(key))continue;if(++n>12)break;
      if(line.length>4000){warn('An oversized native memory was left in native context without copying.');d.seen.push(key);continue;}
      if(!add(key,'Native summary (fallible interpretation): '+line.replace(/^-\s*/,''),titles.filter(t=>match(line,t)),hash(line),'native'))break;
    }}
    d.seen=d.seen.slice(-1024);
    const result=new Map();
    // Header-based recall remains independent of whether a card needs writing.
    for(const m of context.matchAll(/\s*\{\s*title:\s*([^}]+)\}\s*/gi)){const t=m[1].trim().toLowerCase();if(allowed.has(t))result.set(t,{pendingMemories:[],titleHeader:m[0]});}
    const selected=new Set();let jobs=0;
    for(const j of d.queue){for(const t of j.targets){if(!titles.includes(t))continue;if(!selected.has(t)&&selected.size>=2)continue;if(jobs>=4)break;
      selected.add(t);if(!result.has(t))result.set(t,{pendingMemories:[],titleHeader:''});result.get(t).pendingMemories.push(j.text);jobs++;
    }if(jobs>=4)break;}
    d.selected=Array.from(selected);d.recalled=[...result].filter(([t,v])=>v.titleHeader).map(([t])=>t);return result;
  }
  function ack(title,texts){const d=stateData();for(const j of d.queue)if(texts.includes(j.text)&&j.targets.includes(title)){j.targets=j.targets.filter(t=>t!==title);d.processed++;}d.queue=d.queue.filter(j=>j.targets.length);}
  function status(){const d=stateData();return '\nTargeted memory: '+d.queue.length+' queued passages; '+d.processed+' card deliveries.\nLast write candidates: '+(d.selected||[]).join(', ')+'\nLast header recall candidates: '+(d.recalled||[]).join(', ')+'\n'+d.warnings.join('\n');}
  return {events,ack,status};
})();
