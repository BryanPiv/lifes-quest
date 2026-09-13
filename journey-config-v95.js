/*
 * Life's Quest Journey configuration.
 * Change asset paths and layout coordinates here instead of adding CSS patches.
 * Percentages position responsive elements; trail coordinates use its 190x410 canvas.
 */
window.LQJourneyConfig={
  version:96,
  assets:{
    environment:{premiumAlpine:"assets/journey/premium-alpine-v94.webp?v=95"},
    companions:{
      cloud:{
        source:"assets/characters/nimbus/nimbus-idle-premium-v94.png",
        runtime:"assets/characters/nimbus/nimbus-idle-premium-v95.webp?v=95"
      }
    }
  },
  layout:{
    sceneHeight:"clamp(330px,53svh,375px)",
    companion:{left:"21%",top:"73%",width:"42%",maxWidth:"185px"},
    card:{left:"12px",top:"38px",width:"145px"},
    trail:{right:"3px",top:"7px",width:"190px",height:"410px",scale:".78"},
    nodes:{
      1:{x:"108px",y:"365px"},
      5:{x:"119px",y:"289px"},
      10:{x:"111px",y:"220px"},
      15:{x:"132px",y:"151px"},
      20:{x:"119px",y:"86px"}
    },
    labels:{
      habits:{x:"4px",y:"337px"},
      control:{x:"0px",y:"194px"},
      freedom:{x:"96px",y:"124px"},
      self:{x:"96px",y:"2px"}
    },
    path:"M108 365 C132 330 133 300 114 270 C94 238 96 209 122 179 C143 154 142 124 121 96 C105 75 110 47 133 23"
  }
};

(function applyJourneyConfig(){
  function apply(){
    const root=document.querySelector("#journey .pjScene"),cfg=window.LQJourneyConfig?.layout;
    if(!root||!cfg)return;
    const vars={
      "--journey-scene-height":cfg.sceneHeight,
      "--companion-left":cfg.companion.left,"--companion-top":cfg.companion.top,
      "--companion-width":cfg.companion.width,"--companion-max-width":cfg.companion.maxWidth,
      "--card-left":cfg.card.left,"--card-top":cfg.card.top,"--card-width":cfg.card.width,
      "--trail-right":cfg.trail.right,"--trail-top":cfg.trail.top,"--trail-width":cfg.trail.width,
      "--trail-height":cfg.trail.height,"--trail-scale":cfg.trail.scale
    };
    Object.entries(vars).forEach(([name,value])=>root.style.setProperty(name,value));
    Object.entries(cfg.nodes).forEach(([level,pos])=>{
      root.style.setProperty("--node-"+level+"-x",pos.x);
      root.style.setProperty("--node-"+level+"-y",pos.y);
    });
    Object.entries(cfg.labels).forEach(([id,pos])=>{
      root.style.setProperty("--label-"+id+"-x",pos.x);
      root.style.setProperty("--label-"+id+"-y",pos.y);
    });
    const path=document.querySelector("#journey .pjTrail .pjPath path:last-of-type");
    const underlay=document.querySelector("#journey .pjTrail .pjPath path:first-of-type");
    if(path)path.setAttribute("d",cfg.path);if(underlay)underlay.setAttribute("d",cfg.path);
  }
  window.LQApplyJourneyConfig=apply;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);else apply();
  window.addEventListener("pageshow",apply);
})();
