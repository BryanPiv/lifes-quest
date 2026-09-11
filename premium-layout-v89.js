(function(){
  function boot(){
    const journey=document.querySelector("#journey .premiumJourney");
    const scene=document.querySelector("#journey .pjScene");
    if(!journey||!scene)return;

    const level=document.querySelector("#journey .pjLevel");
    if(level && level.parentNode!==scene){
      scene.appendChild(level);
      level.classList.add("pjProgressCard");
    }

    if(!scene.querySelector(".lqHeroMotto")){
      const m=document.createElement("div");
      m.className="lqHeroMotto";
      m.innerHTML="Progress<br>Today.<br>A Brighter<br>Tomorrow.";
      scene.appendChild(m);
    }

    const quickTitle=document.querySelector("#journey .pjQuickTitle");
    const quick=document.querySelector("#journey .pjQuick");
    const budget=document.querySelector("#journey .pjBudget");
    if(quickTitle&&quick&&budget){
      journey.insertBefore(quickTitle,budget);
      journey.insertBefore(quick,budget);
    }

    document.body.classList.toggle("journey-active",!!document.querySelector("#journey.page.on"));
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  window.addEventListener("pageshow",boot);
  setTimeout(boot,250);setTimeout(boot,900);
})();