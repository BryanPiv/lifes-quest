window.LQAssetManifest={
  version:2,
  environment:{
    baseScene:"premium-alpine",
    required:[
      {slot:"sky",kind:"opaque",path:"assets/journey/v79/sky.svg"},
      {slot:"farMountains",kind:"transparent",path:"assets/journey/v79/mountains-back.svg"},
      {slot:"midMountains",kind:"transparent",path:"assets/journey/v79/mountains-back.svg"},
      {slot:"valley",kind:"transparent",path:"assets/journey/v79/valley.svg"},
      {slot:"water",kind:"transparent",path:"assets/journey/v79/valley.svg"},
      {slot:"heroMountain",kind:"transparent",path:"assets/journey/v79/hero-mountain.svg"},
      {slot:"foreground",kind:"transparent",path:"assets/journey/v79/foreground.svg"}
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
