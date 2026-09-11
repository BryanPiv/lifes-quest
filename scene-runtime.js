(function(){
  function getData(){try{return JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){return {}}}
  function saveData(d){localStorage.setItem("lifesQuestWeb",JSON.stringify(d))}
  function resolveTheme(id){
    const all=window.LQSceneConfig?.themes||{};
    const raw=all[id]||all.summer;
    if(!raw)return null;
    return raw.inherits?Object.assign({},all[raw.inherits]||{},raw,{effects:Object.assign({},all[raw.inherits]?.effects||{},raw.effects||{}),palette:Object.assign({},all[raw.inherits]?.palette||{},raw.palette||{})}):raw;
  }
  function autoTheme(){
    const d=new Date(),m=d.getMonth()+1,day=d.getDate(),md=String(m).padStart(2,"0")+"-"+String(day).padStart(2,"0");
    if(md>="12-15"||md<="01-05")return "christmas";
    if(md>="10-15"&&md<="10-31")return "halloween";
    if(m>=3&&m<=5)return "spring";
    if(m>=6&&m<=8)return "summer";
    if(m>=9&&m<=11)return "fall";
    return "winter";
  }
  function applyTheme(id){
    const cfg=resolveTheme(id||autoTheme()); if(!cfg)return;
    const root=document.documentElement; root.dataset.lqTheme=cfg.id;
    const map={sky:".lqSky",backMountains:".lqBackMountains",valley:".lqValley",heroMountain:".lqHeroMountain",foreground:".lqForeground"};
    Object.entries(map).forEach(([k,sel])=>{const el=document.querySelector(sel);if(el&&cfg.layers?.[k])el.src=cfg.layers[k]});
    if(cfg.palette){root.style.setProperty("--lq-theme-gold",cfg.palette.gold);root.style.setProperty("--lq-theme-navy",cfg.palette.navy);root.style.setProperty("--lq-theme-blue",cfg.palette.blue)}
    root.dataset.lqParticles=cfg.effects?.particles||"none";
    root.dataset.lqLighting=cfg.effects?.lighting||"golden";
    const d=getData();d.sceneTheme=cfg.id;saveData(d);
    window.dispatchEvent(new CustomEvent("lq:themechange",{detail:cfg}));
  }
  function level(){const d=getData();return Math.max(1,+d.level||1)}
  function companionType(){return getData().type||"cloud"}
  function formFor(type,lvl){
    const c=window.LQCompanions?.[type]||window.LQCompanions?.cloud;if(!c)return null;
    const forms=(c.forms||[]).slice().sort((a,b)=>a.minLevel-b.minLevel);
    return forms.filter(f=>lvl>=f.minLevel).pop()||forms[0]||null;
  }
  function applyCompanion(){
    const type=companionType(),lvl=level(),c=window.LQCompanions?.[type]||window.LQCompanions?.cloud,f=formFor(type,lvl);
    if(!c||!f)return;
    const cardName=document.getElementById("pjCompanionName");if(cardName)cardName.textContent=f.name||c.name;
    const cardType=document.getElementById("pjCompanionType");if(cardType)cardType.textContent=(type==="cloud"?"☁️ ":"")+String(c.element||type).toUpperCase();
    const ch=document.getElementById("lqLiveCharacter");const img=ch?.querySelector("img");
    if(img){img.src=f.art;img.style.transform="scale("+(f.scale||1)+")";img.dataset.form=f.id}
    if(ch){ch.dataset.companion=type;ch.dataset.form=f.id}
  }
  function animate(name,duration=900){
    const ch=document.getElementById("lqLiveCharacter");if(!ch)return;
    ch.classList.remove("lq-anim-idle","lq-anim-walk","lq-anim-celebrate","lq-anim-evolve");
    ch.classList.add("lq-anim-"+name);
    if(name!=="idle")setTimeout(()=>{ch.classList.remove("lq-anim-"+name);ch.classList.add("lq-anim-idle")},duration);
  }
  function moveTo(x,y,opts={}){
    const ch=document.getElementById("lqLiveCharacter");if(!ch)return;
    ch.classList.add("lq-moving");
    ch.style.transition="left "+(opts.duration||900)+"ms ease, bottom "+(opts.duration||900)+"ms ease";
    ch.style.left=typeof x==="number"?x+"%":x;ch.style.bottom=typeof y==="number"?y+"%":y;
    animate("walk",opts.duration||900);setTimeout(()=>ch.classList.remove("lq-moving"),opts.duration||900);
  }
  function evolveToLevel(newLevel){
    const d=getData(),type=d.type||"cloud",old=formFor(type,d.level||1),next=formFor(type,newLevel);
    d.level=newLevel;saveData(d);
    if(old?.id!==next?.id){
      animate("evolve",1500);
      setTimeout(()=>{applyCompanion();window.dispatchEvent(new CustomEvent("lq:evolved",{detail:{from:old,to:next,type}}))},800);
    }else applyCompanion();
  }
  window.LQScene={
    setTheme:applyTheme,autoTheme,moveCompanion:moveTo,animateCompanion:animate,evolveToLevel,
    refresh(){applyTheme(getData().sceneTheme||autoTheme());applyCompanion()}
  };
  function boot(){
    const d=getData();applyTheme(d.sceneTheme||autoTheme());applyCompanion();
    const p=window.LQSceneConfig?.positions?.companion,ch=document.getElementById("lqLiveCharacter");
    if(ch&&p){ch.style.left=p.left;ch.style.bottom=p.bottom;ch.style.width=p.width}
    animate("idle");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  window.addEventListener("pageshow",boot);
})();