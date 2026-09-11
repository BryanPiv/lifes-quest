(function(){
  function enabled(){return new URLSearchParams(location.search).get("lab")==="1"}
  function el(tag,cls,html){const n=document.createElement(tag);if(cls)n.className=cls;if(html!=null)n.innerHTML=html;return n}
  function button(label,fn){const b=el("button","lqLabBtn",label);b.type="button";b.onclick=fn;return b}
  function open(){
    let p=document.getElementById("lqLabPanel");
    if(p){p.classList.toggle("open");return}
    p=el("aside","lqLabPanel open");p.id="lqLabPanel";
    p.appendChild(el("div","lqLabHead","<b>Life’s Quest Lab</b><span>Character + Scene QA</span>"));
    const chars=el("div","lqLabSection");chars.appendChild(el("h4","", "Companions"));
    [["Nimbus","cloud"],["Ember","fire"],["Aurora","water"],["Volt","lightning"],["Nightfall","shadow"]].forEach(([name,id])=>chars.appendChild(button(name,()=>window.LQPreviewLab?.setType(id))));
    p.appendChild(chars);
    const states=el("div","lqLabSection");states.appendChild(el("h4","", "Animations"));
    ["idle","look","wave","celebrate","surprised","sleep"].forEach(s=>states.appendChild(button(s,()=>window.LQPreviewLab?.previewState(s,1000))));
    states.appendChild(button("Walk Path",()=>window.LQPreviewLab?.previewWalk()));
    states.appendChild(button("Evolve",()=>window.LQPreviewLab?.previewEvolution()));
    p.appendChild(states);
    const scene=el("div","lqLabSection");scene.appendChild(el("h4","", "Scene"));
    scene.appendChild(button("Home",()=>window.LQWorld?.moveToAnchor("home",{duration:700})));
    scene.appendChild(button("Trail",()=>window.LQWorld?.moveToAnchor("trailStart",{duration:700})));
    scene.appendChild(button("Mid",()=>window.LQWorld?.moveToAnchor("trailMid",{duration:700})));
    scene.appendChild(button("Summit",()=>window.LQWorld?.moveToAnchor("summit",{duration:900})));
    scene.appendChild(button("Parallax On",()=>window.LQStudio?.setParallaxEnabled(true)));
    scene.appendChild(button("Parallax Off",()=>window.LQStudio?.setParallaxEnabled(false)));
    p.appendChild(scene);
    const debug=el("pre","lqLabDebug","Ready");p.appendChild(debug);
    p.appendChild(button("Refresh Status",()=>{debug.textContent=JSON.stringify(window.LQPreviewLab?.snapshot?.()||{},null,2)}));
    p.appendChild(button("Close",()=>p.classList.remove("open")));
    document.body.appendChild(p);
  }
  function boot(){
    if(!enabled())return;
    let fab=document.getElementById("lqLabFab");
    if(!fab){fab=button("LAB",open);fab.id="lqLabFab";document.body.appendChild(fab)}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();