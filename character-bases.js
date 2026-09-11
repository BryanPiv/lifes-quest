window.LQCharacterBases={
  version:2,
  rig:{
    canvas:{width:360,height:400},
    anchor:{x:.5,y:.94},
    movementBounds:{left:4,right:96,top:8,bottom:92},
    hitbox:{x:.16,y:.08,w:.68,h:.86},
    slots:["base","head","face","chest","back","leftHand","rightHand","feet","aura","shadow","accessory"],
    states:["idle","walk","run","look","wave","celebrate","surprised","sleep","evolve","enter","exit"],
    directions:["left","right"],
    motion:{
      idleBob:5,
      walkBob:8,
      runBob:11,
      turnMs:180,
      walkMs:700,
      runMs:420,
      defaultMoveMs:700
    }
  },
  evolution:{
    thresholds:[1,5,10,20],
    durationMs:2300,
    stages:[
      {id:"charge",start:0,end:.28},
      {id:"flash",start:.28,end:.52},
      {id:"silhouette",start:.52,end:.68},
      {id:"reveal",start:.68,end:.88},
      {id:"celebrate",start:.88,end:1}
    ]
  },
  companions:{
    cloud:{
      id:"cloud",name:"Nimbus",element:"Cloud",accent:"#64e7ff",
      forms:[
        {id:"cloud-1",name:"Nimbus",minLevel:1,art:"assets/companions/nimbus-backpack.svg?v=82",scale:1},
        {id:"cloud-2",name:"Nimbus Ascended",minLevel:5,art:"assets/companions/nimbus-backpack.svg?v=82",scale:1.08},
        {id:"cloud-3",name:"Nimbus Radiant",minLevel:10,art:"assets/companions/nimbus-backpack.svg?v=82",scale:1.15},
        {id:"cloud-4",name:"Nimbus Celestial",minLevel:20,art:"assets/companions/nimbus-backpack.svg?v=82",scale:1.22}
      ]
    },
    fire:{
      id:"fire",name:"Ember",element:"Fire",accent:"#ff8a45",
      forms:[
        {id:"fire-1",name:"Ember",minLevel:1,art:"assets/companions/ember.svg?v=82",scale:1},
        {id:"fire-2",name:"Ember II",minLevel:5,art:"assets/companions/ember.svg?v=82",scale:1.08},
        {id:"fire-3",name:"Ember III",minLevel:10,art:"assets/companions/ember.svg?v=82",scale:1.15},
        {id:"fire-4",name:"Ember IV",minLevel:20,art:"assets/companions/ember.svg?v=82",scale:1.22}
      ]
    },
    water:{
      id:"water",name:"Aurora",element:"Water",accent:"#4fd4ff",
      forms:[
        {id:"water-1",name:"Aurora",minLevel:1,art:"assets/companions/aurora.svg?v=82",scale:1},
        {id:"water-2",name:"Aurora II",minLevel:5,art:"assets/companions/aurora.svg?v=82",scale:1.08},
        {id:"water-3",name:"Aurora III",minLevel:10,art:"assets/companions/aurora.svg?v=82",scale:1.15},
        {id:"water-4",name:"Aurora IV",minLevel:20,art:"assets/companions/aurora.svg?v=82",scale:1.22}
      ]
    },
    lightning:{
      id:"lightning",name:"Volt",element:"Lightning",accent:"#ffe15c",
      forms:[
        {id:"lightning-1",name:"Volt",minLevel:1,art:"assets/companions/volt.svg?v=82",scale:1},
        {id:"lightning-2",name:"Volt II",minLevel:5,art:"assets/companions/volt.svg?v=82",scale:1.08},
        {id:"lightning-3",name:"Volt III",minLevel:10,art:"assets/companions/volt.svg?v=82",scale:1.15},
        {id:"lightning-4",name:"Volt IV",minLevel:20,art:"assets/companions/volt.svg?v=82",scale:1.22}
      ]
    },
    shadow:{
      id:"shadow",name:"Nightfall",element:"Shadow",accent:"#b67cff",
      forms:[
        {id:"shadow-1",name:"Nightfall",minLevel:1,art:"assets/companions/nightfall.svg?v=82",scale:1},
        {id:"shadow-2",name:"Nightfall II",minLevel:5,art:"assets/companions/nightfall.svg?v=82",scale:1.08},
        {id:"shadow-3",name:"Nightfall III",minLevel:10,art:"assets/companions/nightfall.svg?v=82",scale:1.15},
        {id:"shadow-4",name:"Nightfall IV",minLevel:20,art:"assets/companions/nightfall.svg?v=82",scale:1.22}
      ]
    }
  }
};