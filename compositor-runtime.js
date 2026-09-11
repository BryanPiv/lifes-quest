(function(){
  const SLOT_CLASS={
    sky:"lqSky",
    celestial:"lqCelestial",
    farMountains:"lqBackMountains",
    midMountains:"lqMidMountains",
    valley:"lqValley",
    water:"lqWater",
    heroMountain:"lqHeroMountain",
    structures:"lqStructures",
    mist:"lqMist",
    foreground:"lqForeground",
    flora:"lqFlora",
    particles:"lqParticlesLayer",
    weather:"lqWeatherLayer",
    lighting:"lqLightingLayer"
  };
  function scene(){return document.querySelector("#journey .pjScene")}
  function env(){return document.querySelector("#journey .lqEnvironment")}
  function ensureSlot(slot,z){
    const root=env();if(!root)return null;
    let el=root.querySelector('[data-scene-slot="'+slot+'"]');
    if(el)return el;
    el=document.createElement("img");
    el.className="lqLayer "+(SLOT_CLASS[slot]||("lq"+slot));
    el.dataset.sceneSlot=slot;
    el.alt="";el.setAttribute("aria-hidden","true");
    el.style.zIndex=String(z||1);
    root.appendChild(el);
    return el;
  }
  function ensureEffectSlot(slot,z){
    const root=env();if(!root)return null;
    let el=root.querySelector('[data-scene-slot="'+slot+'"]');
    if(el)return el;
    el=document.createElement("div");
    el.className="lqEffectLayer "+(SLOT_CLASS[slot]||("lq"+slot));
    el.dataset.sceneSlot=slot;
    el.style.zIndex=String(z||1);
    root.appendChild(el);
    return el;
  }
  function normalizeExisting(){
    const root=env();if(!root)return;
    const mappings={
      sky:".lqSky",farMountains:".lqBackMountains",valley:".lqValley",
      heroMountain:".lqHeroMountain",foreground:".lqForeground"
    };
    Object.entries(mappings).forEach(([slot,sel])=>{
      const el=root.querySelector(sel);if(el)el.dataset.sceneSlot=slot;
    });
    (window.LQEnvironmentBases?.slots||[]).forEach(def=>{
      const visual=["mist","particles","weather","lighting","celestial","structures","flora"].includes(def.id)
        ?ensureEffectSlot(def.id,def.z):ensureSlot(def.id,def.z);
      if(visual)visual.style.setProperty("--parallax",def.parallax||0);
    });
  }
  async function hydratePremium(){
    const root=env();if(!root||!window.LQAssets)return;
    const defs=window.LQEnvironmentBases?.slots||[];
    for(const def of defs){
      const el=root.querySelector('[data-scene-slot="'+def.id+'"]');
      if(!el||el.tagName!=="IMG")continue;
      const current=el.getAttribute("src")||"";
      const next=await window.LQAssets.premiumEnvironmentSlot(def.id,current);
      if(next&&next!==current)el.setAttribute("src",next);
    }
  }
  function setSlotVisibility(slot,visible){
    const el=env()?.querySelector('[data-scene-slot="'+slot+'"]');if(!el)return false;
    el.style.display=visible?"":"none";return true;
  }
  function setSlotDepth(slot,z){
    const el=env()?.querySelector('[data-scene-slot="'+slot+'"]');if(!el)return false;
    el.style.zIndex=String(z);return true;
  }
  function slotElement(slot){return env()?.querySelector('[data-scene-slot="'+slot+'"]')||null}
  function boot(){normalizeExisting();hydratePremium()}
  window.LQCompositor={boot,hydratePremium,setSlotVisibility,setSlotDepth,slotElement,slots:()=>[...(env()?.querySelectorAll("[data-scene-slot]")||[])].map(el=>el.dataset.sceneSlot)};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  window.addEventListener("pageshow",boot);
})();