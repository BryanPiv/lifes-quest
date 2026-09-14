(function(){
  const ELEMENTS={
    cloud:{icon:"☁️",accent:"#64e7ff",deep:"#0b3152"},
    fire:{icon:"🔥",accent:"#ff8a45",deep:"#521a14"},
    water:{icon:"💧",accent:"#4fd4ff",deep:"#0a365b"},
    lightning:{icon:"⚡",accent:"#ffe15c",deep:"#4b3a10"},
    shadow:{icon:"🌙",accent:"#b67cff",deep:"#251642"}
  };
  const STAGES=["Awareness","Stability","Security","Growth","Freedom"];
  const read=()=>{try{return JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){return {}}};
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

  function levelFor(xp){return Math.floor(Math.max(0,+xp||0)/100)+1}
  function sprite(form,{locked=false,large=false}={}){
    const cls="lqPathSprite"+(locked?" is-locked":"")+(large?" is-large":"");
    if(!form)return '<div class="'+cls+'"></div>';
    if(form.atlas){
      if(locked)return '<canvas class="'+cls+' lqSilhouetteCanvas" role="img" aria-label="Locked evolution silhouette" data-src="'+esc(form.art)+'" data-row="'+form.atlas.row+'" data-col="'+form.atlas.col+'"></canvas>';
      return '<div class="'+cls+'" role="img" aria-label="'+esc(form.name)+'" style="background-image:url(&quot;'+esc(form.art)+'&quot;);background-size:500% 500%;background-position:'+(form.atlas.col*25)+'% '+(form.atlas.row*25)+'%"></div>';
    }
    return '<img class="'+cls+'" src="'+esc(form.art)+'" alt="'+(locked?"Locked evolution":esc(form.name))+'">';
  }
  function hydrateSilhouettes(root){
    root.querySelectorAll("canvas.lqSilhouetteCanvas").forEach(canvas=>{
      const img=new Image();img.decoding="async";
      img.onload=()=>{
        const cellW=Math.floor(img.naturalWidth/5),cellH=Math.floor(img.naturalHeight/5);
        canvas.width=cellW;canvas.height=cellH;
        const ctx=canvas.getContext("2d",{willReadFrequently:true}),col=+canvas.dataset.col||0,row=+canvas.dataset.row||0;
        ctx.clearRect(0,0,cellW,cellH);ctx.drawImage(img,col*cellW,row*cellH,cellW,cellH,0,0,cellW,cellH);
        const pixels=ctx.getImageData(0,0,cellW,cellH),p=pixels.data;
        const samples=[[2,2],[cellW-3,2],[2,cellH-3],[cellW-3,cellH-3]].map(([x,y])=>{const n=(y*cellW+x)*4;return [p[n],p[n+1],p[n+2]]});
        const bg=samples.reduce((a,s)=>[a[0]+s[0]/4,a[1]+s[1]/4,a[2]+s[2]/4],[0,0,0]);
        for(let n=0;n<p.length;n+=4){
          const dr=p[n]-bg[0],dg=p[n+1]-bg[1],db=p[n+2]-bg[2],distance=Math.sqrt(dr*dr+dg*dg+db*db),light=p[n]+p[n+1]+p[n+2];
          if(p[n+3]<20||distance<42||light<18){p[n+3]=0;continue}
          const edge=Math.min(255,Math.max(105,distance*3.2));p[n]=3;p[n+1]=8;p[n+2]=13;p[n+3]=Math.min(p[n+3],edge);
        }
        ctx.putImageData(pixels,0,0);
      };
      img.src=canvas.dataset.src;
    });
  }
  function styles(){
    if(document.getElementById("lqEvolutionPathStyles"))return;
    const s=document.createElement("style");s.id="lqEvolutionPathStyles";s.textContent=`
.lqEvolutionPath{--path-accent:#64e7ff;--path-deep:#0b3152;position:fixed;z-index:120000;inset:0;display:flex;justify-content:center;background:rgba(0,7,13,.82);backdrop-filter:blur(12px);opacity:0;pointer-events:none;transition:opacity .24s ease;color:#fff;font-family:Inter,system-ui,sans-serif}
.lqEvolutionPath.on{opacity:1;pointer-events:auto}
.lqPathSheet{position:relative;width:min(100%,430px);height:100dvh;overflow-y:auto;overscroll-behavior:contain;padding:max(20px,env(safe-area-inset-top)) 14px calc(28px + env(safe-area-inset-bottom));background:radial-gradient(circle at 78% 2%,color-mix(in srgb,var(--path-accent) 24%,transparent),transparent 27%),linear-gradient(180deg,var(--path-deep),#061827 52%,#020b13);box-shadow:0 0 70px #000}
.lqPathClose{position:sticky;z-index:4;float:right;top:0;width:40px;height:40px;border-radius:50%;border:1px solid #ffffff42;background:#061827dd;color:#fff;font-size:23px}
.lqPathHead small{font-size:9px;font-weight:900;letter-spacing:.2em;color:var(--path-accent)}.lqPathHead h2{margin:5px 0 3px;font:800 30px Georgia,serif}.lqPathHead p{margin:0;color:#b9cedb;font-size:11px}
.lqPathHero{clear:both;display:grid;grid-template-columns:138px 1fr;gap:13px;align-items:center;margin-top:18px;padding:14px;border:1px solid color-mix(in srgb,var(--path-accent) 55%,transparent);border-radius:24px;background:linear-gradient(145deg,rgba(15,61,91,.9),rgba(3,24,40,.96));box-shadow:0 18px 38px #0005}
.lqPathOrb{position:relative;width:138px;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,color-mix(in srgb,var(--path-accent) 24%,transparent),transparent 67%);border:1px solid color-mix(in srgb,var(--path-accent) 58%,transparent);overflow:hidden}
.lqPathOrb:after{content:"";position:absolute;inset:8px;border-radius:50%;border:1px dashed color-mix(in srgb,var(--path-accent) 55%,transparent);animation:lqPathSpin 10s linear infinite}
.lqPathSprite{display:block;width:86px;height:96px;object-fit:contain;background-repeat:no-repeat;position:relative;z-index:2;filter:drop-shadow(0 10px 12px #0007)}
.lqPathSprite.is-large{width:112px;height:122px}.lqPathSprite.is-locked{filter:brightness(0) saturate(0) drop-shadow(0 0 11px var(--path-accent));opacity:.82}
.lqPathHeroText label{display:block;font-size:8px;letter-spacing:.15em;color:var(--path-accent);font-weight:900}.lqPathHeroText h3{font:800 21px Georgia,serif;margin:5px 0}.lqPathHeroText p{font-size:10px;line-height:1.45;color:#c7d7e0;margin:0}
.lqPathProgress{margin-top:10px}.lqPathProgress div{height:7px;border-radius:99px;background:#06131e;overflow:hidden}.lqPathProgress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--path-accent),#f5d06b)}.lqPathProgress small{display:block;margin-top:6px;color:#f4d477;font-size:9px;font-weight:800}
.lqNextCard{margin:12px 0;padding:13px;display:grid;grid-template-columns:88px 1fr;gap:12px;align-items:center;border-radius:20px;border:1px solid #f2ca675c;background:radial-gradient(circle at 15% 50%,color-mix(in srgb,var(--path-accent) 17%,transparent),transparent 28%),linear-gradient(145deg,#102e46,#071c2e)}
.lqNextVisual{width:88px;height:96px;display:grid;place-items:center}.lqNextCard small{font-size:8px;color:#f4d477;letter-spacing:.14em;font-weight:900}.lqNextCard h3{font:800 18px Georgia,serif;margin:4px 0}.lqNextCard p{font-size:10px;color:#bed0dc;line-height:1.4;margin:0}.lqNextCard b{color:#fff}
.lqFormsTitle{margin:18px 2px 8px;font:800 17px Georgia,serif}.lqForms{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.lqForm{min-width:0;padding:7px 3px 8px;border-radius:14px;text-align:center;background:#071d2f;border:1px solid #ffffff18}.lqForm.current{border-color:var(--path-accent);background:linear-gradient(180deg,color-mix(in srgb,var(--path-accent) 18%,#092238),#071927);box-shadow:0 0 17px color-mix(in srgb,var(--path-accent) 20%,transparent)}.lqForm.earned{border-color:#63d99a66}.lqFormArt{height:63px;display:grid;place-items:center}.lqForm .lqPathSprite{width:54px;height:60px}.lqForm b{display:block;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lqForm small{display:block;margin-top:3px;color:#8fa9b9;font-size:6.5px}.lqForm.current small{color:var(--path-accent)}
.lqEarn{margin-top:16px;padding:15px;border-radius:20px;background:linear-gradient(160deg,#0d304c,#071e31);border:1px solid #ffffff1c}.lqEarn h3{font:800 18px Georgia,serif;margin:0 0 4px}.lqEarn>p{color:#9fb7c6;font-size:9px;margin:0 0 11px}.lqEarnGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.lqEarnItem{display:flex;align-items:center;gap:8px;min-height:50px;padding:8px;border-radius:13px;background:#061827;border:1px solid #ffffff12;color:#fff;text-align:left}.lqEarnItem[data-xp-action]{cursor:pointer}.lqEarnItem[data-xp-action]:after{content:"›";margin-left:auto;color:var(--path-accent);font-size:18px}.lqEarnIcon{font-size:20px}.lqEarnItem b{display:block;font-size:9px}.lqEarnItem small{display:block;color:#f2cc6b;font-size:8px;margin-top:2px}
#journey .pjLevel{cursor:pointer!important;pointer-events:auto!important}.lqLevelHint{display:block;margin-top:2px;color:#7de9ff;font-size:5.5px;font-weight:900;letter-spacing:.35px}
@keyframes lqPathSpin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.lqPathOrb:after{animation:none}}
`;document.head.appendChild(s);
  }
  function ensure(){
    styles();let overlay=document.getElementById("lqEvolutionPath");
    if(!overlay){
      overlay=document.createElement("div");overlay.id="lqEvolutionPath";overlay.className="lqEvolutionPath";
      overlay.innerHTML='<div class="lqPathSheet" role="dialog" aria-modal="true" aria-label="Companion evolution path"><button class="lqPathClose" type="button" aria-label="Close">×</button><div class="lqPathContent"></div></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener("click",e=>{if(e.target===overlay||e.target.closest(".lqPathClose"))close()});
    }
    return overlay;
  }
  function render(){
    const overlay=ensure(),data=read(),type=data.type||"fire",def=window.LQCharacterBases?.companions?.[type];
    if(!def)return overlay;
    const meta=ELEMENTS[type]||ELEMENTS.cloud,xp=+(data.companionProgress?.[type]||data.xp||0),lv=levelFor(xp);
    const currentIndex=Math.max(0,def.forms.findIndex((form,i)=>lv>=form.minLevel&&(!def.forms[i+1]||lv<def.forms[i+1].minLevel)));
    const current=def.forms[currentIndex]||def.forms[0],next=def.forms[currentIndex+1];
    const currentFloor=(current.minLevel-1)*100,nextTarget=next?(next.minLevel-1)*100:xp;
    const span=Math.max(1,nextTarget-currentFloor),within=Math.max(0,xp-currentFloor),progress=next?Math.min(100,within/span*100):100,remaining=Math.max(0,nextTarget-xp);
    overlay.style.setProperty("--path-accent",meta.accent);overlay.style.setProperty("--path-deep",meta.deep);
    const hero=next
      ? '<div class="lqNextCard"><div class="lqNextVisual">'+sprite(next,{locked:true})+'</div><div><small>NEXT EVOLUTION</small><h3>A new form awaits…</h3><p>Reach <b>Level '+next.minLevel+'</b> by earning <b>'+remaining+' more XP</b> to awaken Form '+(currentIndex+2)+'.</p></div></div>'
      : '<div class="lqNextCard"><div class="lqNextVisual">'+sprite(current)+'</div><div><small>FINAL EVOLUTION</small><h3>Freedom Form Unlocked</h3><p>You have reached the highest companion stage. Keep building habits and collecting achievements.</p></div></div>';
    const forms=def.forms.map((form,i)=>{
      const earned=lv>=form.minLevel,active=i===currentIndex,label=earned?form.name:"Mystery Form";
      return '<div class="lqForm '+(active?"current":earned?"earned":"locked")+'"><div class="lqFormArt">'+sprite(form,{locked:!earned})+'</div><b>'+esc(label)+'</b><small>'+(active?"CURRENT":earned?"UNLOCKED":"LEVEL "+form.minLevel)+'</small></div>';
    }).join("");
    overlay.querySelector(".lqPathContent").innerHTML=
      '<div class="lqPathHead"><small>'+meta.icon+' '+esc(def.element).toUpperCase()+' COMPANION</small><h2>'+esc(def.name)+'’s Evolution Path</h2><p>Build real financial habits to unlock every form.</p></div>'+
      '<div class="lqPathHero"><div class="lqPathOrb">'+sprite(current,{large:true})+'</div><div class="lqPathHeroText"><label>CURRENT FORM · '+esc(STAGES[currentIndex])+'</label><h3>'+esc(current.name)+'</h3><p>Level '+lv+' · Form '+(currentIndex+1)+' of 5</p><div class="lqPathProgress"><div><i style="width:'+progress+'%"></i></div><small>'+(next?xp+' / '+nextTarget+' total XP':xp+' total XP · Final form')+'</small></div></div></div>'+
      hero+'<h3 class="lqFormsTitle">All Five Forms</h3><div class="lqForms">'+forms+'</div>'+
      '<div class="lqEarn"><h3>How to earn Quest XP</h3><p>Small financial actions power your companion’s evolution.</p><div class="lqEarnGrid">'+
      '<button class="lqEarnItem" data-xp-action="daily"><span class="lqEarnIcon">✍️</span><div><b>Complete all 3 daily actions</b><small>+5 XP each completed day</small></div></button>'+
      '<button class="lqEarnItem" data-xp-action="save"><span class="lqEarnIcon">🌱</span><div><b>Save toward a goal</b><small>+15 XP weekly</small></div></button>'+
      '<button class="lqEarnItem" data-xp-action="lesson"><span class="lqEarnIcon">📖</span><div><b>Complete a stage lesson</b><small>+20 XP</small></div></button>'+
      '<button class="lqEarnItem" data-xp-action="weekly"><span class="lqEarnIcon">🧭</span><div><b>Check in on 5 of 7 days</b><small>+40 XP weekly bonus</small></div></button>'+
      '</div></div>';
    hydrateSilhouettes(overlay);
    overlay.querySelectorAll("[data-xp-action]").forEach(button=>button.onclick=()=>{
      const action=button.dataset.xpAction;close();
      if(action==="save"){window.go?.("goals");return}
      window.LQQuestCenter?.open?.();
      if(action==="daily")setTimeout(()=>window.LQQuestCenter?.showDaily?.(),120);
    });
    return overlay;
  }
  function open(){
    const overlay=render();overlay.classList.add("on");document.body.style.overflow="hidden";
    requestAnimationFrame(()=>overlay.querySelector(".lqPathClose")?.focus());
  }
  function close(){const overlay=document.getElementById("lqEvolutionPath");if(overlay)overlay.classList.remove("on");document.body.style.removeProperty("overflow")}
  function wire(){
    const level=document.querySelector("#journey .pjLevel");if(!level||level.dataset.evolutionPathWired)return;
    level.dataset.evolutionPathWired="true";level.setAttribute("role","button");level.setAttribute("tabindex","0");level.setAttribute("aria-label","Open companion evolution path");
    if(!level.querySelector(".lqLevelHint"))level.insertAdjacentHTML("beforeend",'<span class="lqLevelHint">TAP FOR EVOLUTIONS</span>');
    level.addEventListener("click",open);level.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}});
  }
  window.LQEvolutionPath={open,close,render};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wire);else wire();
  window.addEventListener("pageshow",wire);setTimeout(wire,500);
})();