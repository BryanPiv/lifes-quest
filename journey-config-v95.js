/*
 * Life's Quest Journey configuration.
 * Change asset paths and layout coordinates here instead of adding CSS patches.
 * Percentages position responsive elements; trail coordinates use its 190x410 canvas.
 */
window.LQJourneyConfig={
  version:103,
  assets:{
    environment:{
      premiumAlpine:{
        source:"assets/journey/premium-v101/reference-cinematic.png",
        runtime:"assets/journey/premium-v101/sky.png?v=101"
      }
    },
    companions:{
      cloud:{
        source:"assets/characters/nimbus/nimbus-idle-premium-v94.png",
        runtime:"assets/characters/nimbus/nimbus-idle-premium-v95.webp?v=95"
      },
      fire:{
        source:"assets/characters/ember/ember-idle-premium-v98.png",
        runtime:"assets/characters/ember/ember-idle-premium-v98.webp?v=98"
      },
      water:{
        source:"assets/characters/aurora/aurora-idle-premium-v98.png",
        runtime:"assets/characters/aurora/aurora-idle-premium-v98.webp?v=98"
      },
      lightning:{
        source:"assets/characters/volt/volt-idle-premium-v98.png",
        runtime:"assets/characters/volt/volt-idle-premium-v98.webp?v=98"
      },
      shadow:{
        source:"assets/characters/nightfall/nightfall-idle-premium-v98.png",
        runtime:"assets/characters/nightfall/nightfall-idle-premium-v98.webp?v=98"
      }
    }
  },
  layout:{
    sceneHeight:"clamp(330px,53svh,375px)",
    companion:{left:"21%",top:"73%",width:"42%",maxWidth:"185px"},
    card:{left:"12px",top:"38px",width:"145px"},
    trail:{right:"14px",top:"7px",width:"190px",height:"410px",scale:".78"},
    nodes:{
      1:{x:"108px",y:"365px"},
      5:{x:"119px",y:"289px"},
      10:{x:"111px",y:"220px"},
      15:{x:"132px",y:"151px"},
      20:{x:"119px",y:"86px"}
    },
    labels:{
      habits:{x:"15px",y:"353px"},
      control:{x:"15px",y:"208px"},
      freedom:{x:"143px",y:"139px"},
      self:{x:"143px",y:"74px"}
    },
    path:"M108 365 C117 341 122 315 119 289 C115 262 107 241 111 220 C116 190 136 174 132 151 C128 124 117 105 119 86 C121 61 128 40 133 23"
  },
  motion:{
    enabled:true,
    camera:{duration:"14s",distance:"3px",scale:"1.012"},
    trees:{duration:"6.5s",angle:".22deg"},
    mist:{duration:"11s",distance:"5%"},
    lighting:{duration:"7.5s",minimum:".72",maximum:"1"},
    particles:{duration:"13s",distance:"-18px"},
    waterfalls:[
      {className:"lqWaterfallCenter",left:"61%",top:"71%",width:"7%",height:"23%"},
      {className:"lqWaterfallRight",left:"94%",top:"46%",width:"5%",height:"24%"}
    ]
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

    const environment=root.querySelector(".lqEnvironment"),motion=window.LQJourneyConfig?.motion;
    if(environment&&motion?.enabled){
      const image=window.LQJourneyConfig.assets.environment.premiumAlpine.runtime;
      root.style.setProperty("--environment-image",'url("'+image+'")');
      root.style.setProperty("--tree-duration",motion.trees.duration);
      root.style.setProperty("--tree-angle",motion.trees.angle);
      root.style.setProperty("--camera-duration",motion.camera.duration);
      root.style.setProperty("--camera-distance",motion.camera.distance);
      root.style.setProperty("--camera-scale",motion.camera.scale);
      root.style.setProperty("--mist-duration",motion.mist.duration);
      root.style.setProperty("--mist-distance",motion.mist.distance);
      root.style.setProperty("--lighting-duration",motion.lighting.duration);
      root.style.setProperty("--lighting-minimum",motion.lighting.minimum);
      root.style.setProperty("--lighting-maximum",motion.lighting.maximum);
      root.style.setProperty("--particles-duration",motion.particles.duration);
      root.style.setProperty("--particles-distance",motion.particles.distance);
      ["left","right"].forEach(side=>{
        if(!environment.querySelector(".lqTreeMotion."+side)){
          const tree=document.createElement("div");tree.className="lqTreeMotion "+side;tree.setAttribute("aria-hidden","true");environment.appendChild(tree);
        }
      });
      motion.waterfalls.forEach(item=>{
        let water=environment.querySelector("."+item.className);
        if(!water){water=document.createElement("div");water.className="lqWaterfallMotion "+item.className;water.setAttribute("aria-hidden","true");environment.appendChild(water)}
        Object.assign(water.style,{left:item.left,top:item.top,width:item.width,height:item.height});
      });
    }
  }
  window.LQApplyJourneyConfig=apply;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);else apply();
  window.addEventListener("pageshow",apply);
})();
