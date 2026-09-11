(function(){
  function ready(){
    const host=document.querySelector("#journey .premiumJourney");
    if(!host || document.getElementById("lqHotspots")) return;
    const motion=document.createElement("div");
    motion.id="lqJourneyMotion";
    motion.innerHTML='<span class="mist m1"></span><span class="mist m2"></span><span class="trailGlow"></span><span class="spark s1"></span><span class="spark s2"></span><span class="spark s3"></span><span class="spark s4"></span>';
    host.appendChild(motion);
    const spots=document.createElement("div");
    spots.id="lqHotspots";
    const actions=[
      ["settings","Settings",()=>window.go&&go("settings")],
      ["budget","Weekly budget",()=>window.openBudget&&openBudget()],
      ["food","Add food expense",()=>window.quickAdd&&quickAdd("Food")],
      ["gas","Add gas expense",()=>window.quickAdd&&quickAdd("Gas")],
      ["fun","Add entertainment expense",()=>window.quickAdd&&quickAdd("Entertainment")],
      ["misc","Add miscellaneous expense",()=>window.quickAdd&&quickAdd("Misc")],
      ["bills","Recurring bills",()=>window.go&&go("calendar")],
      ["goalsTile","Goal planner",()=>window.go&&go("goals")],
      ["home","Home",()=>window.go&&go("journey")],
      ["expenses","Expenses",()=>window.go&&go("expenses")],
      ["goals","Goals",()=>window.go&&go("goals")],
      ["calendar","Calendar",()=>window.go&&go("calendar")]
    ];
    actions.forEach(([cls,label,fn])=>{
      const b=document.createElement("button");
      b.type="button"; b.className=cls; b.setAttribute("aria-label",label);
      b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();fn();});
      spots.appendChild(b);
    });
    host.appendChild(spots);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",ready);
  else ready();
  window.addEventListener("pageshow",ready);
})();