(function(){
 function boot(){
  const host=document.querySelector("#journey #lqCharacterHost");
  if(host){
    let img=host.querySelector("img");
    if(!img){img=document.createElement("img");host.replaceChildren(img)}
    if(!img.src.includes("nimbus-idle-premium")) img.src="./assets/characters/nimbus/nimbus-idle-premium.png?v=92";
    img.alt="Nimbus";
    img.className="lqCharacterSprite lqPremiumNimbus";
  }
  document.body.classList.toggle("journey-active",!!document.querySelector("#journey.page.on"));
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
 window.addEventListener("pageshow",boot);
 setTimeout(boot,200);setTimeout(boot,900);
})();