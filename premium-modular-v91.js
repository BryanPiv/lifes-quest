(function(){
 const defs=[
  ["celestial","lqEffectLayer lqCelestial",2],
  ["flora","lqEffectLayer lqFlora",13],
  ["particles","lqEffectLayer lqParticlesLayer",14],
  ["mist","lqEffectLayer lqMist",10],
  ["lighting","lqEffectLayer lqLightingLayer",15]
 ];
 function boot(){
  const env=document.querySelector("#journey .lqEnvironment"); if(!env)return;
  defs.forEach(([slot,cls,z])=>{
   let n=env.querySelector('[data-scene-slot="'+slot+'"]');
   if(!n){n=document.createElement("div");n.dataset.sceneSlot=slot;n.className=cls;n.style.zIndex=z;env.appendChild(n)}
  });
  window.LQCompositor?.boot?.();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
 window.addEventListener("pageshow",boot);
})();