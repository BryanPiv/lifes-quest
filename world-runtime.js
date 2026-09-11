(function(){
  const state={character:null,scene:null,theme:null,direction:"right",mode:"idle",locked:false};
  const q=s=>document.querySelector(s);
  const data=()=>{try{return JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){return {}}};
  const save=d=>localStorage.setItem("lifesQuestWeb",JSON.stringify(d));
  function level(){return Math.max(1,+data().level||1)}
  function type(){return data().type||"cloud"}
  function def(){return window.LQCharacterBases?.companions?.[type()]||window.LQCharacterBases?.companions?.cloud}
  function form(){
    const d=def();if(!d)return null;
    return d.forms.filter(f=>level()>=f.minLevel).pop()||d.forms[0];
  }
  function host(){
    let h=q("#lqCharacterHost");
    if(!h){
      h=document.createElement("div");h.id="lqCharacterHost";
      h.innerHTML='<div class="lqCharacterShadow"></div><img class="lqCharacterSprite" alt="Companion"><div class="lqCharacterAura"></div>';
      const scene=q("#journey .pjScene")||q("#journey .premiumJourney");scene?.appendChild(h);
    }
    return h;
  }
  function mountCharacter(){
    const h=host(),d=def(),f=form();if(!h||!d||!f)return;
    state.character={type:d.id,form:f.id};
    h.dataset.type=d.id;h.dataset.form=f.id;h.dataset.state=state.mode;h.dataset.direction=state.direction;
    h.style.setProperty("--character-accent",d.accent||"#7de8ff");
    h.style.setProperty("--character-scale",f.scale||1);
    const img=h.querySelector(".lqCharacterSprite");
    if(img&&img.getAttribute("src")!==f.art)img.setAttribute("src",f.art);
    const old=q("#lqLiveCharacter");if(old)old.style.display="none";
  }
  function setState(name,ms){
    const h=host();if(!h)return;
    state.mode=name;h.dataset.state=name;
    if(ms)setTimeout(()=>{if(state.mode===name)setState("idle")},ms);
  }
  function face(dir){state.direction=dir==="left"?"left":"right";const h=host();if(h)h.dataset.direction=state.direction}
  function moveTo(x,y,opts={}){
    const h=host();if(!h||state.locked)return Promise.resolve();
    const current=parseFloat(h.style.left)||14;
    const target=typeof x==="number"?x:parseFloat(x);
    face(target<current?"left":"right");
    const duration=opts.duration||700;
    h.style.setProperty("--move-duration",duration+"ms");
    h.style.left=(typeof x==="number"?x+"%":x);
    h.style.top=(typeof y==="number"?y+"%":y);
    setState(opts.run?"run":"walk");
    return new Promise(res=>setTimeout(()=>{setState("idle");res()},duration));
  }
  async function movePath(points,opts={}){
    for(const p of points)await moveTo(p.x,p.y,{duration:p.duration||opts.duration||650,run:p.run||opts.run});
  }
  function emote(name,duration=900){setState(name,duration)}
  function evolve(newLevel){
    const d=data(),before=form();d.level=newLevel;save(d);
    const after=form();if(!after||before?.id===after.id){mountCharacter();return Promise.resolve(false)}
    const h=host();state.locked=true;setState("evolve");
    return new Promise(res=>setTimeout(()=>{mountCharacter();setState("celebrate",900);state.locked=false;window.dispatchEvent(new CustomEvent("lq:evolved",{detail:{from:before,to:after,type:type()}}));res(true)},window.LQCharacterBases.evolution.durationMs||2300));
  }
  function applyScene(season,holiday){
    const base=window.LQEnvironmentBases; if(!base)return;
    const s=base.seasons[season]||base.seasons.summer;
    const pack=base.packs[s.pack]||base.packs.alpine;
    state.scene=pack.id;state.theme=holiday||season;
    document.documentElement.dataset.lqSeason=season;document.documentElement.dataset.lqHoliday=holiday||"none";
    const map={sky:".lqSky",farMountains:".lqBackMountains",midMountains:".lqValley",valley:".lqValley",heroMountain:".lqHeroMountain",foreground:".lqForeground"};
    Object.entries(map).forEach(([slot,sel])=>{const el=q(sel),src=pack.layers[slot];if(el&&src)el.src=src});
    document.documentElement.dataset.lqParticles=(holiday&&base.holidays[holiday]?.particles)||s.overrides.particles||"none";
    window.dispatchEvent(new CustomEvent("lq:scenechange",{detail:{season,holiday,pack:pack.id}}));
  }
  function autoSeason(){
    const m=new Date().getMonth()+1;if(m>=3&&m<=5)return"spring";if(m>=6&&m<=8)return"summer";if(m>=9&&m<=11)return"fall";return"winter";
  }
  function autoHoliday(){
    const d=new Date(),m=d.getMonth()+1,day=d.getDate();if(m===10&&day>=15)return"halloween";if(m===12&&day>=10&&day<=26)return"christmas";if((m===12&&day>=27)||(m===1&&day<=3))return"newYear";return null;
  }
  function setCompanion(typeId){
    const d=data();d.type=window.LQCharacterBases.companions[typeId]?typeId:"cloud";save(d);mountCharacter()
  }
  function boot(){
    mountCharacter();const d=data();applyScene(d.sceneSeason||autoSeason(),d.sceneHoliday||autoHoliday());
    const h=host();if(h&&!h.style.left){h.style.left="14%";h.style.top="70%"}
  }
  window.LQWorld={state,mountCharacter,setState,face,moveTo,movePath,emote,evolve,applyScene,setCompanion,autoSeason,autoHoliday,refresh:boot};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  window.addEventListener("pageshow",boot);
})();