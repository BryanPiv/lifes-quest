window.LQCharacterBases={
  version:1,
  defaultRig:{
    anchor:{x:.5,y:.94},
    hitbox:{x:.16,y:.08,w:.68,h:.86},
    motion:{idleBob:5,walkBob:8,walkTilt:2.2,runTilt:3.5,turnMs:220,walkMs:700,runMs:420},
    slots:["head","face","chest","back","leftHand","rightHand","feet","aura","shadow"],
    states:["idle","walk","run","look","wave","celebrate","sad","surprised","sleep","evolve","enter","exit"],
    directions:["left","right"]
  },
  companions:{
    cloud:{
      id:"cloud",name:"Nimbus",element:"Cloud",accent:"#64e7ff",
      baseArt:"assets/companions/nimbus-backpack.svg?v=81",
      forms:[
        {id:"cloud-1",name:"Nimbus",minLevel:1,art:"assets/companions/nimbus-backpack.svg?v=81",scale:1},
        {id:"cloud-2",name:"Nimbus Ascended",minLevel:5,art:"assets/companions/nimbus-backpack.svg?v=81",scale:1.08},
        {id:"cloud-3",name:"Nimbus Radiant",minLevel:10,art:"assets/companions/nimbus-backpack.svg?v=81",scale:1.15},
        {id:"cloud-4",name:"Nimbus Celestial",minLevel:20,art:"assets/companions/nimbus-backpack.svg?v=81",scale:1.22}
      ]
    },
    fire:{
      id:"fire",name:"Ember",element:"Fire",accent:"#ff8a45",
      baseArt:"assets/companions/ember.svg?v=81",
      forms:[
        {id:"fire-1",name:"Ember",minLevel:1,art:"assets/companions/ember.svg?v=81",scale:1},
        {id:"fire-2",name:"Ember Blaze",minLevel:5,art:"assets/companions/ember.svg?v=81",scale:1.08},
        {id:"fire-3",name:"Ember Inferno",minLevel:10,art:"assets/companions/ember.svg?v=81",scale:1.15},
        {id:"fire-4",name:"Ember Phoenix",minLevel:20,art:"assets/companions/ember.svg?v=81",scale:1.22}
      ]
    },
    water:{
      id:"water",name:"Aurora",element:"Water",accent:"#4fd4ff",
      baseArt:"assets/companions/aurora.svg?v=81",
      forms:[
        {id:"water-1",name:"Aurora",minLevel:1,art:"assets/companions/aurora.svg?v=81",scale:1},
        {id:"water-2",name:"Aurora Tide",minLevel:5,art:"assets/companions/aurora.svg?v=81",scale:1.08},
        {id:"water-3",name:"Aurora Cascade",minLevel:10,art:"assets/companions/aurora.svg?v=81",scale:1.15},
        {id:"water-4",name:"Aurora Leviathan",minLevel:20,art:"assets/companions/aurora.svg?v=81",scale:1.22}
      ]
    },
    lightning:{
      id:"lightning",name:"Volt",element:"Lightning",accent:"#ffe15c",
      baseArt:"assets/companions/volt.svg?v=81",
      forms:[
        {id:"lightning-1",name:"Volt",minLevel:1,art:"assets/companions/volt.svg?v=81",scale:1},
        {id:"lightning-2",name:"Volt Surge",minLevel:5,art:"assets/companions/volt.svg?v=81",scale:1.08},
        {id:"lightning-3",name:"Volt Tempest",minLevel:10,art:"assets/companions/volt.svg?v=81",scale:1.15},
        {id:"lightning-4",name:"Volt Thunderlord",minLevel:20,art:"assets/companions/volt.svg?v=81",scale:1.22}
      ]
    },
    shadow:{
      id:"shadow",name:"Nightfall",element:"Shadow",accent:"#b67cff",
      baseArt:"assets/companions/nightfall.svg?v=81",
      forms:[
        {id:"shadow-1",name:"Nightfall",minLevel:1,art:"assets/companions/nightfall.svg?v=81",scale:1},
        {id:"shadow-2",name:"Nightfall Veil",minLevel:5,art:"assets/companions/nightfall.svg?v=81",scale:1.08},
        {id:"shadow-3",name:"Nightfall Eclipse",minLevel:10,art:"assets/companions/nightfall.svg?v=81",scale:1.15},
        {id:"shadow-4",name:"Nightfall Sovereign",minLevel:20,art:"assets/companions/nightfall.svg?v=81",scale:1.22}
      ]
    }
  },
  evolution:{
    thresholds:[1,5,10,20],
    sequence:["charge","flash","silhouette","reveal","celebrate"],
    durationMs:2300
  }
};