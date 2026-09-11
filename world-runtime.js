(function(){
  const state={character:null,scene:null,direction:"right",mode:"idle",locked:false};

  const q=s=>document.querySelector(s);
  const read=()=>{try{return JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){return {}}};
  const write=d=>localStorage.setItem("lifesQuestWeb",JSON.stringify(d));

  function level(){return Math.max(1,+read().level||1)}
  function type(){return read().type||"cloud"}
  function characterDef(id=type()){
    return window.LQCharacterBases?.companions?.[id]||window.LQCharacterBases?.companions?.cloud;
  }
  function formFor(id=type(),lvl=level()){
    const d=characterDef(id);if(!d)return null;
    return d.forms.filter(f=>lvl>=f.minLevel).pop()||d.forms[0]||null;
  }

  function host(){
    let h=q("#lqCharacterHost");
    if(!h){
      h=document.createElement("div");
      h.id="lqCharacterHost";
      h.innerHTML='<div class="lqCharacterShadow"></div><img class="lqCharacterSprite" alt="Companion"><div class="lqCharacterAura"></div><div class="lqCharacterAccessory"></div>';
      (q("#journey .pjScene")||q("#journey .premiumJourney"))?.appendChild(h);
    }
    return h;
  }

  function clamp(v,min,max){return Math.min(max,Math.max(min,v))}
  function bounds(){return window.LQCharacterBases?.rig?.movementBounds||{left:4,right:96,top:8,bottom:92}}

  function mountCharacter(){
    const h=host(),d=characterDef(),f=formFor();if(!h||!d||!f)return;
    state.character={type:d.id,form:f.id};
    h.dataset.type=d.id;h.dataset.form=f.id;h.dataset.state=state.mode;h.dataset.direction=state.direction;
    h.style.setProperty("--character-accent",d.accent||"#7de8ff");
    h.style.setProperty("--character-scale",f.scale||1);
    const img=h.querySelector(".lqCharacterSprite");
    if(img&&img.getAttribute("src")!==f.art)img.setAttribute("src",f.art);
    h.setAttribute("aria-label",f.name||d.name);
    const old=q("#lqLiveCharacter");if(old)old.style.display="none";
  }

  function setState(name,ms){
    const h=host();if(!h)return;
    const allowed=window.LQCharacterBases?.rig?.states||[];
    if(!allowed.includes(name))name="idle";
    state.mode=name;h.dataset.state=name;
    if(ms)setTimeout(()=>{if(state.mode===name)setState("idle")},ms);
  }

  function face(dir){
    state.direction=dir==="left"?"left":"right";
    const h=host();if(h)h.dataset.direction=state.direction;
  }

  function place(x,y,{instant=false}={}){
    const h=host(),b=bounds();if(!h)return;
    const nx=clamp(+x,b.left,b.right),ny=clamp(+y,b.top,b.bottom);
    if(instant){const prev=h.style.transition;h.style.transition="none";h.style.left=nx+"%";h.style.top=ny+"%";requestAnimationFrame(()=>h.style.transition=prev)}
    else {h.style.left=nx+"%";h.style.top=ny+"%"}
  }

  function moveTo(x,y,opts={}){
    const h=host();if(!h||state.locked)return Promise.resolve(false);
    const current=parseFloat(h.style.left)||14;
    const b=bounds(),tx=clamp(+x,b.left,b.right),ty=clamp(+y,b.top,b.bottom);
    face(tx<current?"left":"right");
    const duration=opts.duration||(opts.run?window.LQCharacterBases.rig.motion.runMs:window.LQCharacterBases.rig.motion.walkMs);
    h.style.setProperty("--move-duration",duration+"ms");
    setState(opts.run?"run":"walk");
    h.style.left=tx+"%";h.style.top=ty+"%";
    return new Promise(res=>setTimeout(()=>{setState("idle");res(true)},duration));
  }

  async function movePath(points,opts={}){
    for(const p of points)await moveTo(p.x,p.y,{duration:p.duration||opts.duration,run:p.run??opts.run});
    return true;
  }

  function moveToAnchor(anchorId,opts={}){
    const scene=sceneDef(state.scene),a=scene?.characterAnchors?.[anchorId];
    return a?moveTo(a.x,a.y,opts):Promise.resolve(false);
  }

  function emote(name,duration=900){setState(name,duration)}

  function evolve(newLevel){
    const d=read(),before=formFor(d.type||"cloud",d.level||1);
    d.level=Math.max(1,+newLevel||1);write(d);
    const after=formFor(d.type||"cloud",d.level);
    if(!after||before?.id===after.id){mountCharacter();return Promise.resolve(false)}
    state.locked=true;setState("evolve");
    const total=window.LQCharacterBases?.evolution?.durationMs||2300;
    return new Promise(res=>setTimeout(()=>{
      mountCharacter();setState("celebrate",900);state.locked=false;
      window.dispatchEvent(new CustomEvent("lq:evolved",{detail:{from:before,to:after,type:d.type||"cloud"}}));
      res(true);
    },total));
  }

  function sceneDef(id){
    const base=window.LQEnvironmentBases;
    return base?.scenes?.[id]||base?.scenes?.[base?.defaultScene];
  }

  function sceneLayerMap(){
    return {
      sky:".lqSky",
      farMountains:".lqBackMountains",
      midMountains:".lqValley",
      valley:".lqValley",
      heroMountain:".lqHeroMountain",
      foreground:".lqForeground"
    };
  }

  function applySceneLayers(scene){
    const map=sceneLayerMap();
    Object.entries(map).forEach(([slot,sel])=>{
      const el=q(sel),src=scene?.layers?.[slot];
      if(el&&src)el.setAttribute("src",src);
    });
    document.documentElement.dataset.lqParticles=scene?.effects?.particles||"none";
    document.documentElement.dataset.lqLighting=scene?.effects?.lighting||"golden";
    document.documentElement.dataset.lqWeather=scene?.effects?.weather||"clear";
  }

  function setScene(sceneId,{transition=true}={}){
    const scene=sceneDef(sceneId);if(!scene)return Promise.resolve(false);
    const root=q("#journey .pjScene");
    const cfg=window.LQEnvironmentBases?.transition||{};
    const duration=transition?(cfg.durationMs||650):0;

    const doSwap=()=>{
      applySceneLayers(scene);
      state.scene=scene.id;
      const d=read();d.sceneId=scene.id;write(d);
      window.dispatchEvent(new CustomEvent("lq:scenechange",{detail:{scene:scene.id}}));
    };

    if(!root||!transition){doSwap();return Promise.resolve(true)}
    root.classList.add("lqSceneChanging");
    return new Promise(res=>{
      setTimeout(()=>{doSwap();root.classList.add("lqSceneSwapped")},duration*.45);
      setTimeout(()=>{root.classList.remove("lqSceneChanging","lqSceneSwapped");res(true)},duration);
    });
  }

  function setCompanion(typeId){
    const d=read();
    d.type=window.LQCharacterBases?.companions?.[typeId]?typeId:"cloud";
    write(d);mountCharacter();
  }

  function boot(){
    mountCharacter();
    const d=read(),defaultScene=window.LQEnvironmentBases?.defaultScene;
    setScene(d.sceneId||defaultScene,{transition:false});
    const h=host();
    if(h&&!h.style.left){
      const a=sceneDef(state.scene)?.characterAnchors?.home||{x:14,y:70};
      place(a.x,a.y,{instant:true});
    }
    setState("idle");
  }

  window.LQWorld={
    state,
    refresh:boot,
    setScene,
    setCompanion,
    mountCharacter,
    setState,
    face,
    place,
    moveTo,
    movePath,
    moveToAnchor,
    emote,
    evolve,
    getCharacter:()=>({definition:characterDef(),form:formFor(),state:{...state}}),
    getScene:()=>sceneDef(state.scene)
  };

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  window.addEventListener("pageshow",boot);
})();