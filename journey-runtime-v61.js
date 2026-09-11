(function(){
  let previousPage="journey";

  function currentPage(){
    const on=document.querySelector(".page.on");
    return on&&on.id ? on.id : "journey";
  }

  function installBackButtons(){
    document.querySelectorAll(".page").forEach(page=>{
      if(!page.id || page.id==="journey") return;
      if(page.querySelector(".lqBackBtn")) return;
      const b=document.createElement("button");
      b.type="button";
      b.className="lqBackBtn";
      b.setAttribute("aria-label","Back");
      b.innerHTML="‹";
      b.addEventListener("click",e=>{
        e.preventDefault();e.stopPropagation();
        const target=(previousPage && previousPage!==page.id)?previousPage:"journey";
        previousPage="journey";
        if(window.go) window.go(target);
      });
      page.appendChild(b);
    });
  }

  function syncModalState(){
    const open=!!document.querySelector(".modal.show");
    const spots=document.getElementById("lqHotspots");
    if(spots){
      spots.style.display=open?"none":"block";
      spots.style.pointerEvents=open?"none":"none";
    }
    document.body.classList.toggle("lq-modal-open",open);
  }

  function hardCloseModal(modal){
    if(!modal) return;
    modal.classList.remove("show");
    modal.style.display="none";
    setTimeout(()=>{modal.style.removeProperty("display");syncModalState();},20);
  }

  function wireModalFallbacks(){
    const map={
      quickMoneyModal:"closeQuickMoney",
      goalModal:"closeGoal",
      goalAddModal:"closeGoalAdd",
      budgetModal:"closeBudget",
      billModal:"closeBill"
    };
    Object.entries(map).forEach(([id,fn])=>{
      const modal=document.getElementById(id);
      if(!modal) return;
      modal.querySelectorAll(".ghost,[id*='close'],[id*='Close'],button").forEach(btn=>{
        const txt=(btn.textContent||"").trim().toLowerCase();
        const isClose=btn.id.toLowerCase().includes("close")||txt==="cancel"||txt==="close"||txt==="back"||txt==="×"||txt==="✕";
        if(!isClose || btn.dataset.lqCloseWired) return;
        btn.dataset.lqCloseWired="1";
        btn.addEventListener("click",e=>{
          e.preventDefault();e.stopPropagation();
          try{
            if(typeof window[fn]==="function") window[fn]();
            else hardCloseModal(modal);
          }catch(err){hardCloseModal(modal);}
          syncModalState();
        },true);
      });
      modal.addEventListener("click",e=>{
        if(e.target===modal){hardCloseModal(modal);}
      });
    });
  }

  function wrapGo(){
    if(!window.go || window.go.__lqWrapped) return;
    const original=window.go;
    const wrapped=function(p){
      const now=currentPage();
      if(now && now!==p) previousPage=now;
      const result=original.apply(this,arguments);
      installBackButtons();
      syncModalState();
      return result;
    };
    wrapped.__lqWrapped=true;
    window.go=wrapped;
  }

  function ready(){
    const host=document.querySelector("#journey .premiumJourney");
    if(!host) return;

    if(!document.getElementById("lqJourneyMotion")){
      const motion=document.createElement("div");
      motion.id="lqJourneyMotion";
      motion.innerHTML='<span class="mist m1"></span><span class="mist m2"></span><span class="trailGlow"></span><span class="spark s1"></span><span class="spark s2"></span><span class="spark s3"></span><span class="spark s4"></span>';
      host.appendChild(motion);
    }

    if(!document.getElementById("lqHotspots")){
      const spots=document.createElement("div");
      spots.id="lqHotspots";
      const actions=[
        ["settings","Settings",()=>window.go&&window.go("settings")],
        ["budget","Weekly budget",()=>window.openBudget&&window.openBudget()],
        ["food","Add food expense",()=>window.quickAdd&&window.quickAdd("Food")],
        ["gas","Add gas expense",()=>window.quickAdd&&window.quickAdd("Gas")],
        ["fun","Add entertainment expense",()=>window.quickAdd&&window.quickAdd("Entertainment")],
        ["misc","Add miscellaneous expense",()=>window.quickAdd&&window.quickAdd("Misc")],
        ["bills","Recurring bills",()=>window.go&&window.go("calendar")],
        ["goalsTile","Goal planner",()=>window.go&&window.go("goals")],
        ["home","Home",()=>window.go&&window.go("journey")],
        ["expenses","Expenses",()=>window.go&&window.go("expenses")],
        ["goals","Goals",()=>window.go&&window.go("goals")],
        ["calendar","Calendar",()=>window.go&&window.go("calendar")]
      ];
      actions.forEach(([cls,label,fn])=>{
        const b=document.createElement("button");
        b.type="button"; b.className=cls; b.setAttribute("aria-label",label);
        b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();fn();setTimeout(syncModalState,0);});
        spots.appendChild(b);
      });
      host.appendChild(spots);
    }

    wrapGo();
    installBackButtons();
    wireModalFallbacks();
    syncModalState();

    const observer=new MutationObserver(()=>syncModalState());
    document.querySelectorAll(".modal").forEach(m=>observer.observe(m,{attributes:true,attributeFilter:["class","style"]}));
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",ready);
  else ready();
  window.addEventListener("pageshow",ready);
})();