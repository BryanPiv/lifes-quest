(function(){
  const ELEMENTS={
    cloud:{label:"Cloud",accent:"#76edff",deep:"#123b68",symbol:"☁"},
    fire:{label:"Fire",accent:"#ff9c4a",deep:"#641c12",symbol:"◆"},
    water:{label:"Water",accent:"#4fdcff",deep:"#0b3d72",symbol:"◉"},
    lightning:{label:"Lightning",accent:"#ffe56b",deep:"#4e3b13",symbol:"ϟ"},
    shadow:{label:"Shadow",accent:"#c18cff",deep:"#291950",symbol:"◒"}
  };
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  let active=false;

  function styles(){
    if(document.getElementById("lqEvolutionStyles"))return;
    const s=document.createElement("style");s.id="lqEvolutionStyles";s.textContent=`
.lqEvolutionCut{--evo-accent:#76edff;--evo-deep:#123b68;position:fixed;z-index:100000;inset:0;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 44%,color-mix(in srgb,var(--evo-accent) 25%,transparent),transparent 24%),linear-gradient(180deg,#020713,var(--evo-deep) 62%,#02040a);color:#fff;opacity:0;transition:opacity .35s ease;font-family:Inter,system-ui,sans-serif}
.lqEvolutionCut.is-on{opacity:1}.lqEvolutionCut:before,.lqEvolutionCut:after{content:"";position:absolute;inset:-35%;background:conic-gradient(from 0deg,transparent 0 8%,color-mix(in srgb,var(--evo-accent) 28%,transparent) 9% 10%,transparent 11% 20%);animation:evoSpin 7s linear infinite}
.lqEvolutionCut:after{inset:0;background:radial-gradient(circle,transparent 0 19%,color-mix(in srgb,var(--evo-accent) 18%,transparent) 19.5% 20%,transparent 21% 31%,color-mix(in srgb,var(--evo-accent) 13%,transparent) 31.5% 32%,transparent 33%);animation:evoPulse 1.15s ease-in-out infinite}
.lqEvoStage{position:relative;z-index:3;width:min(92vw,430px);height:min(86vh,760px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.lqEvoEyebrow{position:absolute;top:5%;font-weight:900;letter-spacing:.24em;font-size:11px;color:var(--evo-accent);text-transform:uppercase}.lqEvoTitle{position:absolute;top:10%;margin:0;font:800 clamp(25px,7vw,38px) Georgia,serif;text-shadow:0 4px 20px #000}
.lqEvoOrb{position:relative;width:min(72vw,310px);aspect-ratio:1;display:grid;place-items:center;border-radius:50%;filter:drop-shadow(0 0 28px var(--evo-accent));transition:transform .5s ease,filter .5s ease}
.lqEvoOrb:before{content:"";position:absolute;inset:2%;border:2px solid var(--evo-accent);border-radius:50%;box-shadow:inset 0 0 40px var(--evo-accent),0 0 45px var(--evo-accent);animation:evoRing 1.4s ease-in-out infinite}
.lqEvoSprite{width:82%;height:82%;background-repeat:no-repeat;background-size:500% 500%;filter:brightness(.14) saturate(0) drop-shadow(0 0 9px var(--evo-accent));transform:scale(var(--from-scale,1));transition:filter .7s ease,transform .7s cubic-bezier(.2,.9,.2,1.25),opacity .25s}
.lqEvoRunes{position:absolute;inset:-9%;border:1px dashed color-mix(in srgb,var(--evo-accent) 70%,transparent);border-radius:50%;animation:evoSpin 5s linear infinite;font-size:30px;color:var(--evo-accent)}.lqEvoRunes span{position:absolute;left:50%;top:-18px;transform:translateX(-50%)}
.lqEvoStatus{margin-top:34px;font-size:13px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#dcecff}.lqEvoName{margin:9px 0 0;font:800 clamp(28px,8vw,44px) Georgia,serif;color:#fff;text-shadow:0 0 22px var(--evo-accent);opacity:0;transform:translateY(14px);transition:.6s ease}
.lqEvolutionCut.is-charging .lqEvoOrb{animation:evoCharge .7s ease-in-out infinite}.lqEvolutionCut.is-flash{background:#fff}.lqEvolutionCut.is-flash .lqEvoSprite{opacity:0}.lqEvolutionCut.is-reveal .lqEvoSprite{filter:brightness(1.08) saturate(1.18) drop-shadow(0 0 18px var(--evo-accent));transform:scale(var(--to-scale,1.2))}.lqEvolutionCut.is-reveal .lqEvoName{opacity:1;transform:none}.lqEvolutionCut.is-celebrate .lqEvoOrb{animation:evoCelebrate .8s ease both}
.lqEvoSkip{position:absolute;right:18px;top:max(18px,env(safe-area-inset-top));z-index:5;border:1px solid #ffffff55;background:#07132199;color:#fff;border-radius:999px;padding:8px 13px;font-weight:800;font-size:11px}
@keyframes evoSpin{to{transform:rotate(360deg)}}@keyframes evoPulse{50%{transform:scale(1.08);opacity:.55}}@keyframes evoRing{50%{transform:scale(1.08);opacity:.6}}@keyframes evoCharge{50%{transform:scale(1.05);filter:drop-shadow(0 0 55px var(--evo-accent))}}@keyframes evoCelebrate{35%{transform:scale(1.13) translateY(-10px)}70%{transform:scale(.97)}}
@media(prefers-reduced-motion:reduce){.lqEvolutionCut *{animation:none!important;transition-duration:.15s!important}}
`;document.head.appendChild(s);
  }
  function make(detail){
    const el=document.createElement("div");el.className="lqEvolutionCut";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label","Companion evolution");
    const meta=ELEMENTS[detail.type]||ELEMENTS.cloud;el.style.setProperty("--evo-accent",meta.accent);el.style.setProperty("--evo-deep",meta.deep);
    el.innerHTML='<button class="lqEvoSkip" type="button">Skip</button><div class="lqEvoStage"><div class="lqEvoEyebrow">'+meta.label+' evolution</div><h2 class="lqEvoTitle">A new form is awakening</h2><div class="lqEvoOrb"><div class="lqEvoRunes"><span>'+meta.symbol+'</span></div><div class="lqEvoSprite" role="img" aria-label=""></div></div><div class="lqEvoStatus">Gathering energy…</div><div class="lqEvoName">'+detail.to.name+'</div></div>';
    const sprite=el.querySelector(".lqEvoSprite");setSprite(sprite,detail.from||detail.to);el.style.setProperty("--from-scale",detail.from?.scale||1);el.style.setProperty("--to-scale",detail.to.scale||1.2);
    return el;
  }
  function setSprite(el,form){
    const a=form?.atlas||{row:0,col:0};el.style.backgroundImage='url("'+form.art+'")';el.style.backgroundPosition=(a.col*25)+"% "+(a.row*25)+"%";el.setAttribute("aria-label",form?.name||"Companion");
  }
  async function play(detail){
    if(active)return false;active=true;styles();const el=make(detail);document.body.appendChild(el);document.body.style.overflow="hidden";
    let skipped=false;el.querySelector(".lqEvoSkip").onclick=()=>{skipped=true};
    requestAnimationFrame(()=>el.classList.add("is-on"));await sleep(450);
    el.classList.add("is-charging");await wait(1450,()=>skipped);
    if(!skipped){el.querySelector(".lqEvoStatus").textContent="Transformation beginning…";el.classList.add("is-flash");await sleep(280);el.classList.remove("is-flash");}
    if(detail.onSwap)detail.onSwap();const img=el.querySelector(".lqEvoSprite");setSprite(img,detail.to);el.classList.remove("is-charging");el.classList.add("is-reveal");el.querySelector(".lqEvoStatus").textContent="Evolution complete";await wait(1700,()=>skipped);
    el.classList.add("is-celebrate");await wait(850,()=>skipped);el.classList.remove("is-on");await sleep(360);el.remove();document.body.style.removeProperty("overflow");active=false;return true;
  }
  async function wait(ms,stop){const step=50;for(let n=0;n<ms;n+=step){if(stop())return;await sleep(step)}}
  window.LQEvolution={play,isActive:()=>active};
})();