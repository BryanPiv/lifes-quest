window.LQAssetManifest={
  version:103,
  environment:{
    baseScene:"premium-alpine",
    required:[
      {slot:"sky",kind:"opaque",path:"assets/journey/premium-v101/sky.png"},
      {slot:"farMountains",kind:"transparent",path:"assets/journey/premium-v101/far-mountains.png"},
      {slot:"water",kind:"transparent",path:"assets/journey/premium-v101/waterfall-valley.png"},
      {slot:"heroMountain",kind:"transparent",path:"assets/journey/premium-v101/hero-mountain.png"},
      {slot:"foreground",kind:"transparent",path:"assets/journey/premium-v101/foreground.png"}
    ]
  },
  companions:{
    cloud:{name:"Nimbus",folder:"nimbus"},
    fire:{name:"Ember",folder:"ember"},
    water:{name:"Aurora",folder:"aurora"},
    lightning:{name:"Volt",folder:"volt"},
    shadow:{name:"Nightfall",folder:"nightfall"}
  },
  characterFile(type,form,state="idle"){
    const c=this.companions[type]||this.companions.cloud;
    return "assets/art/companions/"+c.folder+"/form-"+form+"/"+state+".webp";
  },
  requiredStates:["idle","walk","run","look","wave","celebrate","surprised","sleep","evolve"],
  requiredForms:[1,2,3,4]
};
