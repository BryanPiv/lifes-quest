(function(){
  const q=s=>document.querySelector(s);
  const slotSelectors={
    sky:".lqSky",
    farMountains:".lqBackMountains",
    midMountains:".lqValley",
    valley:".lqValley",
    heroMountain:".lqHeroMountain",
    foreground:".lqForeground"
  };
  const defaults={x:0,y:0,scale:1,opacity:1,blur:0,brightness:1,saturate:1};
  function scene(){return q("#journey .pjScene")}
  function layer(slot){const sel=slotSelectors[slot];return sel?q(sel):null}
  function readTransforms(){try{return JSON.parse(localStorage.getItem("lqSceneTransforms")||"{}")}catch(e){return {}}}
  function saveTransforms(v){localStorage.setItem("lqSceneTransforms",JSON.stringify(v))}
  function applyTransform(slot,patch={},persist=true){
    const el=layer(slot);if(!el)return false;
    const all=readTransforms(),next=Object.assign({},defaults,all[slot]||{},patch);
    el.style.transform="translate3d("+next.x+"%,"+next.y+"%,0) scale("+next.scale+")";
    el.style.opacity=next.opacity;
    el.style.filter="blur("+next.blur+"px) brightness("+next.brightness+") saturate("+next.saturate+")";
    el.dataset.lqSlot=slot;
    if(persist){all[slot]=next;saveTransforms(all)}
    return true;
  }
  function resetTransform(slot){
    const all=readTransforms();
    if(slot){delete all[slot];saveTransforms(all);applyTransform(slot,defaults,false)}
    else{saveTransforms({});Object.keys(slotSelectors).forEach(s=>applyTransform(s,defaults,false))}
  }
  function swapLayer(slot,src,{persist=true}={}){
    const el=layer(slot);if(!el||!src)return false;
    el.src=src;
    if(persist){
      const d=JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}");
      d.sceneOverrides=d.sceneOverrides||{};d.sceneOverrides[slot]=src;
      localStorage.setItem("lifesQuestWeb",JSON.stringify(d));
    }
    return true;
  }
  function applyOverrides(){
    let d={};try{d=JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){}
    Object.entries(d.sceneOverrides||{}).forEach(([slot,src])=>swapLayer(slot,src,{persist:false}));
    const all=readTransforms();Object.entries(all).forEach(([slot,t])=>applyTransform(slot,t,false));
  }
  function clearOverrides(){
    let d={};try{d=JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){}
    delete d.sceneOverrides;localStorage.setItem("lifesQuestWeb",JSON.stringify(d));
    resetTransform();
    window.LQWorld?.setScene(window.LQEnvironmentBases?.defaultScene,{transition:false});
  }
  function exportSceneState(){
    let d={};try{d=JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){}
    return {sceneId:d.sceneId||window.LQEnvironmentBases?.defaultScene,overrides:d.sceneOverrides||{},transforms:readTransforms(),companion:window.LQWorld?.getCharacter?.()||null};
  }
  function parallax(pointerX,pointerY){
    const base=window.LQEnvironmentBases?.slots||[];
    base.forEach(def=>{
      const el=layer(def.id);if(!el)return;
      const t=readTransforms()[def.id]||defaults;
      const dx=(pointerX-.5)*(def.parallax||0)*8,dy=(pointerY-.5)*(def.parallax||0)*5;
      el.style.transform="translate3d("+((t.x||0)+dx)+"%,"+((t.y||0)+dy)+"%,0) scale("+(t.scale||1)+")";
    });
  }
  let parallaxEnabled=true;
  function bindParallax(){
    const s=scene();if(!s||s.dataset.parallaxBound)return;
    s.dataset.parallaxBound="1";
    s.addEventListener("pointermove",e=>{
      if(!parallaxEnabled)return;
      const r=s.getBoundingClientRect();
      parallax((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);
    });
    s.addEventListener("pointerleave",()=>{if(parallaxEnabled)parallax(.5,.5)});
  }
  const queue=[];let running=false;
  async function runQueue(){
    if(running)return;running=true;
    while(queue.length){
      const job=queue.shift();
      try{
        if(job.type==="move")await window.LQWorld.moveTo(job.x,job.y,job.options||{});
        else if(job.type==="anchor")await window.LQWorld.moveToAnchor(job.anchor,job.options||{});
        else if(job.type==="emote"){window.LQWorld.emote(job.name,job.duration||900);await new Promise(r=>setTimeout(r,job.duration||900))}
        else if(job.type==="evolve")await window.LQWorld.evolve(job.level);
        else if(job.type==="wait")await new Promise(r=>setTimeout(r,job.ms||500));
      }catch(e){}
    }
    running=false;
  }
  function enqueue(...actions){queue.push(...actions.flat());runQueue();return queue.length}
  function clearQueue(){queue.length=0}
  window.LQStudio={
    layerSlots:Object.keys(slotSelectors),swapLayer,setLayer:applyTransform,resetLayer:resetTransform,resetAllLayers:()=>resetTransform(),
    clearSceneOverrides:clearOverrides,exportState:exportSceneState,
    setParallaxEnabled(v){parallaxEnabled=!!v;if(!v)parallax(.5,.5)},
    enqueue,clearQueue,
    demoCharacter(){enqueue({type:"emote",name:"look",duration:900},{type:"anchor",anchor:"trailStart",options:{duration:900}},{type:"emote",name:"celebrate",duration:900},{type:"anchor",anchor:"home",options:{duration:900}})}
  };
  function boot(){applyOverrides();bindParallax()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  window.addEventListener("pageshow",boot);
})();