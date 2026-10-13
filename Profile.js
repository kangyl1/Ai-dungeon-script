/* Captures one explicit creator profile and keeps it available on narrative turns. */
var PlayerProfile = (function () {
  'use strict';
  const MAX_FIELDS=20, MAX_VALUE=500, MAX_PROFILE=3500, MAX_ADDITION=4300;
  const allowed={
    'name':'Name','gender':'Gender','pronouns':'Pronouns','origin':'Origin','previous life':'Previous life',
    'mother':'Mother','father':'Father','parents':'Parents','family':'Family','ancestry':'Ancestry','race':'Race',
    'brother':'Brother','sister':'Sister','sibling':'Sibling','grandfather':'Grandfather','grandmother':'Grandmother','guardian':'Guardian','mentor':'Mentor','partner':'Partner','friend':'Friend','rival':'Rival','crew':'Crew',
    'connection to rudeus':'Connection to Rudeus','relationship to rudeus':'Connection to Rudeus',
    'primary gift':'Primary gift','secondary gifts':'Secondary gifts','innate talents':'Innate talents',
    'starting training':'Starting training','current training':'Starting training','appearance':'Appearance',
    'personality':'Personality','birth year':'Birth year','starting age':'Starting age',
    'starting location':'Starting location','background':'Background','limitations':'Limitations','goal':'Goal'
  };
  const marker=/\[(?:PLAYER|CK) PROFILE\]([\s\S]*?)\[\/(?:PLAYER|CK) PROFILE\]/i;
  function root(){
    const r=state.continuityKit01||(state.continuityKit01={});
    if(!r.profile)r.profile={fields:{},order:[],captured:false,armed:false,suppressed:false,last:'No player profile captured.'};
    return r.profile;
  }
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return s.length+':'+(h>>>0).toString(16);}
  function parse(raw){
    const fields={},order=[];
    for(const line of String(raw).split(/\r?\n/)){
      const m=/^\s*([^:#\[\]]{1,50}):\s*(.{1,500})\s*$/.exec(line);if(!m)continue;
      const label=allowed[m[1].trim().toLowerCase()];if(!label)continue;
      const value=m[2].replace(/[\u200B-\u200D]/g,'').trim().slice(0,MAX_VALUE);if(!value)continue;
      if(!Object.prototype.hasOwnProperty.call(fields,label))order.push(label);
      fields[label]=value;if(order.length>=MAX_FIELDS)break;
    }
    return {fields,order};
  }
  function formatted(p){return p.order.map(k=>k+': '+p.fields[k]).join('\n').slice(0,MAX_PROFILE);}
  function capture(context){
    const p=root(),m=marker.exec(String(context));if(!m)return null;
    if(p.suppressed&&!p.armed){p.last='A profile block was seen but capture is disabled after /ck profile clear.';return null;}
    const parsed=parse(m[1]);if(parsed.order.length<2){p.last='Profile block rejected: fewer than two recognised fields.';return null;}
    const serial=formatted(parsed),fingerprint=hash(serial);
    if(p.captured&&!p.armed){
      p.last=p.hash===fingerprint?'Saved player profile is present in current context.':'A different profile block was ignored. Use /ck profile replace after intentionally editing it.';
      return null;
    }
    p.fields=parsed.fields;p.order=parsed.order;p.hash=fingerprint;p.captured=true;p.armed=false;p.suppressed=false;
    p.last='Captured '+p.order.length+' creator profile fields.';return p.last;
  }
  function command(text){
    const m=/^\s*\/ck\s+profile(?:\s+(status|show|replace|clear))?\s*$/i.exec(String(text));if(!m)return null;
    const p=root(),cmd=(m[1]||'status').toLowerCase();
    if(cmd==='clear'){p.fields={};p.order=[];p.hash='';p.captured=false;p.armed=false;p.suppressed=true;p.last='Saved player profile cleared; automatic recapture disabled.';return {message:p.last};}
    if(cmd==='replace'){p.armed=true;p.suppressed=false;p.last='Profile replacement armed. The next valid [PLAYER PROFILE] block will replace the saved profile.';return {message:p.last};}
    if(!p.captured)return {message:'No saved player profile. Include a valid [PLAYER PROFILE] block, or use /ck profile replace after adding one.'};
    return {message:'Saved profile: '+p.order.join(', ')+'. Full values are shown in Continuity Control Notes.'};
  }
  function enrich(context,max){
    const p=root();if(!p.captured)return context;
    const sourcePresent=marker.test(String(context));marker.lastIndex=0;
    const rules='\n[PLAYER PROFILE RULES]\nThe creator profile is player-authored and authoritative. Never replace or randomly regenerate identity, origin, parents, ancestry, connection to Rudeus, appearance, or selected gifts. A gift or aptitude is potential, not unexplained mastery. Starting Training controls learned ability: newborn, native-born, and reincarnated-at-birth characters must learn skills through play unless the profile explicitly establishes training. The primary gift has the strongest potential; secondary gifts begin weaker, incomplete, dormant, or harder to develop. Do not invent the player\'s thoughts, attraction, decisions, dialogue, or voluntary actions. Explicit later player-authored corrections override this starting profile.\n';
    const addition=sourcePresent?rules:rules+'[ESTABLISHED PLAYER PROFILE]\n'+formatted(p)+'\n[/ESTABLISHED PLAYER PROFILE]\n';
    if(addition.length>MAX_ADDITION){p.last='Profile guidance skipped: formatted addition exceeded its bound.';return context;}
    if(max&&context.length+addition.length>max){p.last='Profile guidance skipped: insufficient context space; original context preserved.';return context;}
    p.last=sourcePresent?'Profile rules supplied; original profile block already present.':'Saved player profile supplied on narrative turn.';
    return context+addition;
  }
  function status(){
    const p=root();
    return '\nPLAYER PROFILE\n'+(p.captured?formatted(p):'Not captured.')+'\nStatus: '+p.last+'\n';
  }
  return {capture,command,enrich,status};
})();
