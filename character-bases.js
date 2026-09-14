window.LQCharacterBases={
  version:4,
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
    thresholds:[1,5,10,20,35],
    durationMs:5200,
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
        {id:"cloud-1",name:"Nimbus",minLevel:1,art:"assets/characters/forms/cloud-1.svg?v=105",scale:1,tier:1},
        {id:"cloud-2",name:"Nimbus Ascended",minLevel:5,art:"assets/characters/forms/cloud-2.svg?v=105",scale:1.07,tier:2},
        {id:"cloud-3",name:"Nimbus Radiant",minLevel:10,art:"assets/characters/forms/cloud-3.svg?v=105",scale:1.14,tier:3},
        {id:"cloud-4",name:"Nimbus Celestial",minLevel:20,art:"assets/characters/forms/cloud-4.svg?v=105",scale:1.21,tier:4},
        {id:"cloud-5",name:"Nimbus Eternal",minLevel:35,art:"assets/characters/forms/cloud-5.svg?v=105",scale:1.29,tier:5}
      ]
    },
    fire:{
      id:"fire",name:"Ember",element:"Fire",accent:"#ff8a45",
      forms:[
        {id:"fire-1",name:"Ember",minLevel:1,art:"assets/characters/forms/fire-1.svg?v=105",scale:1,tier:1},
        {id:"fire-2",name:"Ember Kindled",minLevel:5,art:"assets/characters/forms/fire-2.svg?v=105",scale:1.07,tier:2},
        {id:"fire-3",name:"Ember Blazing",minLevel:10,art:"assets/characters/forms/fire-3.svg?v=105",scale:1.14,tier:3},
        {id:"fire-4",name:"Ember Inferno",minLevel:20,art:"assets/characters/forms/fire-4.svg?v=105",scale:1.21,tier:4},
        {id:"fire-5",name:"Ember Eternal",minLevel:35,art:"assets/characters/forms/fire-5.svg?v=105",scale:1.29,tier:5}
      ]
    },
    water:{
      id:"water",name:"Aurora",element:"Water",accent:"#4fd4ff",
      forms:[
        {id:"water-1",name:"Aurora",minLevel:1,art:"assets/characters/forms/water-1.svg?v=105",scale:1,tier:1},
        {id:"water-2",name:"Aurora Flowing",minLevel:5,art:"assets/characters/forms/water-2.svg?v=105",scale:1.07,tier:2},
        {id:"water-3",name:"Aurora Tidal",minLevel:10,art:"assets/characters/forms/water-3.svg?v=105",scale:1.14,tier:3},
        {id:"water-4",name:"Aurora Tempest",minLevel:20,art:"assets/characters/forms/water-4.svg?v=105",scale:1.21,tier:4},
        {id:"water-5",name:"Aurora Eternal",minLevel:35,art:"assets/characters/forms/water-5.svg?v=105",scale:1.29,tier:5}
      ]
    },
    lightning:{
      id:"lightning",name:"Volt",element:"Lightning",accent:"#ffe15c",
      forms:[
        {id:"lightning-1",name:"Volt",minLevel:1,art:"assets/characters/forms/lightning-1.svg?v=105",scale:1,tier:1},
        {id:"lightning-2",name:"Volt Charged",minLevel:5,art:"assets/characters/forms/lightning-2.svg?v=105",scale:1.07,tier:2},
        {id:"lightning-3",name:"Volt Thunderborn",minLevel:10,art:"assets/characters/forms/lightning-3.svg?v=105",scale:1.14,tier:3},
        {id:"lightning-4",name:"Volt Stormlord",minLevel:20,art:"assets/characters/forms/lightning-4.svg?v=105",scale:1.21,tier:4},
        {id:"lightning-5",name:"Volt Eternal",minLevel:35,art:"assets/characters/forms/lightning-5.svg?v=105",scale:1.29,tier:5}
      ]
    },
    shadow:{
      id:"shadow",name:"Nightfall",element:"Shadow",accent:"#b67cff",
      forms:[
        {id:"shadow-1",name:"Nightfall",minLevel:1,art:"assets/characters/forms/shadow-1.svg?v=105",scale:1,tier:1},
        {id:"shadow-2",name:"Nightfall Veiled",minLevel:5,art:"assets/characters/forms/shadow-2.svg?v=105",scale:1.07,tier:2},
        {id:"shadow-3",name:"Nightfall Eclipse",minLevel:10,art:"assets/characters/forms/shadow-3.svg?v=105",scale:1.14,tier:3},
        {id:"shadow-4",name:"Nightfall Sovereign",minLevel:20,art:"assets/characters/forms/shadow-4.svg?v=105",scale:1.21,tier:4},
        {id:"shadow-5",name:"Nightfall Eternal",minLevel:35,art:"assets/characters/forms/shadow-5.svg?v=105",scale:1.29,tier:5}
      ]
    }
  }
};
