//  JS13K PROTOSTELLAR   //
//  By Alex Delderfield  //
//          2022         //

////////////////////////////////////////////////////
//INITILIZATIONS
////////////////////////////////////////////////////
//enabled for roller
// import { 
//     kontra
// } from './kontra.js';
// import { 
//     kontra
// } from '';

// const { init, GameLoop, Scene, GameObject, Button, 
//     Sprite, initPointer, initKeys, track, onKey, Text } = kontra;
const { init, initPointer, GameLoop, Sprite, 
    initKeys, onKey, Text, Button } = kontra;

let { canvas, context } = kontra.init();
//kontra.init();
//can = kontra.canvas;
//cx = kontra.canvas.getContext("2d");


//was previously:
//let { canvas, context } = init();

// canvas = getCanvas();
// context = getContext();

compCanvas = document.getElementById('compileIMG');
consCanvas = document.getElementById('canvasConsole');
compCTX = compCanvas.getContext("2d");
cosCTX = consCanvas.getContext("2d");

kontra.initKeys();
kontra.initPointer();

//Primary Game State
//0 = Start screen/zone
//1 = Game area
//2 = Death 
gameState = 0;
mapView = false;
mapEnable = false;
stateInit = false;
preSetup = false;
initProcessing = false;
load = null;
sceneChange = -1;
timer = 0;

//Player
pX = 110;
pY = 180;
var zPlayer, tempTest4x4, tempTest8x8, zShip, zProbe, sBody, sArmL, sArmR, sLegL, sLegR = null;
var sComp1, sComp2, sStnd1, sStnd2, sBub1, sBub2 = null;
var sConsole, sCon1, sCon2, sExc = null;
var sMapButton, sCommandButton = null;

//temp sprites for preloading
var spr4x4 = null; //4x4 temp sprite render to 16px
var spr8x8 = null; //8x8 temp sprite render to 32px

var tutText = kontra.Text({
    x: 130,
    y: 60,
    text: ' ... ',
    color: '#FFFFFF',
    font: '14px Calibri, bold, sans-serif'
});
var shipReadout = kontra.Text({
    x: 460,
    y: 240,
    text: '[<-W]     [C]     [W->] \n               [E] [B]\n                     [B]',
    color: '#FFFFFF',
    font: '16px Calibri, bold, sans-serif'
});
var warningText = kontra.Text({
    x: 10,
    y: 30,
    text: 'UNKNOWN SHIP: HOSTILE ACTIVITY DETECTED',
    color: '#FF6666',
    font: '16px Calibri, bold, sans-serif'
});

//Menu
panelRight = null;
panelScan = null;
panelShip = null;
commandButton = null;
mapButton = null;

//colour registers
cREG = ["#FFF", "#000", "", "", "", "", ""]

//temp dialogue
dState=0;
d1 = "Almost got this darn module fixed ... [E to continue]";
d2 = ">Press F to interact with the module [REPAIR]";
d3 = "Great! That should be operational again ...";
d4 = "Now lets get that other one fixed up too.";
d5 = "** EMERGENCY ALARM **           ";
d6 = "EMERGENCY COMS RECIEVED: tldr bad stuff ";

/////////////////////////////////////////////////////
//GAME FUNCTIONS
/////////////////////////////////////////////////////
function Loading() {
    load = kontra.Text({
        x: 6,
        y:10,
        text: ' Preloading sprite data...',
        color: '#FFFFFF',
        font: '16px Calibri, bold, sans-serif'
    });

    //generate temp debug sprites
    spr4x4 = CreateSpriteIMG(16, 10); //4x4 temp sprite render to 16px
    spr8x8 = CreateSpriteIMG(32, 5); //8x8 temp sprite render to 32px

}

function SceneSwitch() {
    stateInit = false;
    
    if(sceneChange == 0) { //PLAY GAME
        gameState = 0; 
    } else if (sceneChange == 1) { 
        gameState = 1; 
    } else if (sceneChange == 2) { 
        gameState = 2;
    } else if (sceneChange == 3) { 
        gameState = 3;
    } else if (sceneChange == 4) {   
        gameState = 0; //quit 
    }        
    //reset trigger
    sceneChange = -1;
}

//init setup state
function InitSetupState() {

    panelRight = kontra.Sprite({
        x: 550,
        y: 0,
        anchor: {x: 0.5, y: 0.5},
        // required for a rectangle sprite
        width: 250,
        height: 1000,
        color: '#555'
      });
    panelScan = kontra.Sprite({
        x: 530,
        y: 95,
        anchor: {x: 0.5, y: 0.5},
        // required for a rectangle sprite
        width: 180,
        height: 150,
        color: '#777'
      });
    panelShip = kontra.Sprite({
        x: 530,
        y: 260,
        anchor: {x: 0.5, y: 0.5},
        // required for a rectangle sprite
        width: 180,
        height: 150,
        color: '#777'
      });

    //Grab generated debug sprites
    tempTest4x4 = AssignDebugSprite(spr4x4, 40, 40);
    tempTest8x8 = AssignDebugSprite(spr8x8, 80, 40);

    //Generate initial sprites

    //Player Sprites
    zPlayer = GenerateNewSpriteOBJ(37, 16, 5, pX, pY);
    // zPlayer = AssignDebugSprite(spr8x8, pX, pY);

    zShip = AssignDebugSprite(spr8x8, pX, pY);
    zProbe = AssignDebugSprite(spr8x8, 50, 50);

    sBody = AssignDebugSprite(spr4x4, pX, pY);
    sArmR = AssignDebugSprite(spr4x4, pX, pY);
    sArmL = AssignDebugSprite(spr4x4, pX, pY);
    sLegR = AssignDebugSprite(spr4x4, pX, pY);
    sLegL = AssignDebugSprite(spr4x4, pX, pY);
    
    // //Object Sprites
    sComp1 = AssignDebugSprite(spr4x4, 190, 150);
    sComp2 = AssignDebugSprite(spr4x4, 75, 200);
    sStnd1 = AssignDebugSprite(spr4x4, 75, 224);
    sStnd2 = AssignDebugSprite(spr4x4, 190, 174);
    sBub1 = AssignDebugSprite(spr4x4, 182, 120);
    sBub2 = AssignDebugSprite(spr4x4, 70, 170);
    
    // //main console
    sConsole = AssignDebugSprite(spr4x4, 30, 120);
    sCon1 = AssignDebugSprite(spr4x4, 22, 144);
    sCon2 = AssignDebugSprite(spr4x4, 62, 125);
    
    //Old process sprite system
    //sCon2 = CreateSpriteObj(46, 0.55, 62, 125);
    
    //TODO - add chunks/parent objects, etc
    //chunk0.addChild(cPlayer);

    // sMapButton = sprArr[50];
    // sMapButton.width *= 0.45;
    // sMapButton.height *= 0.45;
    // sCommandButton = sprArr[51];
    // sCommandButton.width *= 0.45;
    // sCommandButton.height *= 0.45;

    mapButton = kontra.Button({
        x: 320, y:10,
        color: null,
        width: 40,
        height: 40,
        image: sMapButton,
        onDown() {
            this.color = '#38C';
            SwitchCommand(1);
        },
        onUp() { this.color = '#777'; },
        onOver() { this.color = '#CCC'},
        onOut: function() { this.color = null;}
    });
    commandButton = kontra.Button({
        x: 280, y:10,
        color: null,
        width: 40,
        height: 40,
        image: sCommandButton,
        onDown() {
            this.color = '#38C';
            SwitchCommand(0);
        },
        onUp() { this.color = '#777'; },
        onOver() { this.color = '#CCC'},
        onOut: function() { this.color = null;}
    });

    //temp ship display

}

function SwitchCommand(state) {
    if(state == 0) {
        mapView = false;
        mapButton.enable();
        //mapButton.image = sMapButton;
        // mapButton.color = null;
        load.text = " [Game Running: SHIP INTERIOR]";
        tutText.text = " ...";
        
    } else if (state == 1) {
        mapView = true;
        mapButton.disable();
        // mapButton.image = null;
        // mapButton.color = '#AAA'
        load.text = " [Game Running: NAVMAP]";
        tutText.text = " <Instructions for ship scanning here>";
    }

    console.log("command window switched");
}

//create a sprite and return the game object
function GenerateNewSpriteOBJ(sNum, size, px_width, x, y) {
    //Generate sprite image on the fly
    //queue ?
    const genSprite = GenerateSpriteImage(sNum, px_width);
    genSprite.width = size;
    genSprite.height = size;
    
    const gameObj = kontra.Sprite({
        x: x,
        y: y,
        image:genSprite,
    });

    return gameObj;
}

//just creating debug sprites for now
function CreateSpriteIMG(size, px_width) {
    //Generate sprite image on the fly
    //queue ?
    const genSprite = GenerateSpriteImage(null, px_width);
    genSprite.width = size;
    genSprite.height = size;
    return genSprite;
}

function AssignDebugSprite(spr, x, y) {

    const gameObj = kontra.Sprite({
        x: x,
        y: y,
        image:spr,
    });

    return gameObj;
}

// function CreateSpriteObj(sNum, scale, offX, offY) {
//     //Grab sprite image from sprite array (OLD METHOD)
//     const tempSprite = sprArr[sNum];
//     //console.log("create sprite");

//     tempSprite.width *= scale;
//     tempSprite.height *= scale;
//     //console.log("tempSprite '" + sNum + "' width: " + tempSprite.width);

//     const gameObj = kontra.Sprite({
//         x: offX,
//         y: offY,
//         //image:genSprite,
//         image:tempSprite,
//     });

//     return gameObj;
// }

function InteractCheck(ltr) {
    //Next dialogue prompt/Interact/Access
    if(ltr === 'e' && d_t == 0) {
        if(dState == 0) { //press F to fix
            //console.log("moving to next bit of dialogue");
            cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
            dState = 1;
            intervalD_R = false;
        }
        else if(dState == 2) { //now lets fix the other one
            SavePlayerPos();
            cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
            dState = 3;
            intervalD_R = false;
        }
        else if(dState == 5) { //tutorial text 01
            //disTut01 = true;
            PrintTutorialText(1);
        }

    }
    if(ltr === 'e' && dState == 4) { //print ermergency coms uwu
        d_t = 0;
        mapEnable = true; //enable map toggle
        cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
        dState = 5;
        intervalD_R = false;
    }
    
    //Alt interact/FIX
    if(ltr === 'f' && d_t == 0) {
        if(dState == 1) { //print fixed! 
            //console.log("fix");
            cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
            dState = 2;
            intervalD_R = false;
        }
    }

}

function PrintTutorialText(num) {
    if(num == 1) {
        tutText.text = "Toggle to ship command when at a core console ^";

    }

}

//Draw a diamond shape
//requires x/y location, scale to draw diamond and colour
function DrawArrow(x, y, size, color) {
    cosCTX.beginPath();
    cosCTX.lineTo(x - size, (y + size)-size);
    // bottom left edge
    cosCTX.lineTo(x, (y + size*2) - size);
    // bottom right edge
    cosCTX.lineTo(x + size, (y + size) - size);
    // closing the path automatically creates
    // the top right edge
    cosCTX.closePath();
    cosCTX.fillStyle = color;
    cosCTX.fill();
}

d_t = 0;
intervalD = null;
intervalD_R = false;
function PrintDialogue(str) {
    //clear canvas
    //cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
    
    if(d_t < str.length) {
        //print new text
        cosCTX.font = '14px Calibri, bold, sans-serif';
        cosCTX.fillStyle = "#FFF";
        cosCTX.fillText(str[d_t], 10+(d_t*10), 20);
        d_t++;
    } else { //reset
        DrawArrow(16, 30, 5, '#FFF');
        clearInterval(intervalD);
        //increment and reset
        intervalD_R = true;
        d_t = 0;
    }
}

tempX = -1;
tempY = -1;
function SavePlayerPos() {
    tempX = pX;
    tempY = pY;
}

/////////////////////////////////////////////////////
//PRIMARY GAME LOOP
/////////////////////////////////////////////////////
const loop = kontra.GameLoop({

    update: () => {
        //Handle scene swapping
        if(sceneChange != -1) {
            if(timer > 0) {
                timer -= 0.01;
            } else {
                //console.log("changing state");
                SceneSwitch();
                //clear UI 
                //clearRenderQ();
            }
        }

        //Update States
        if(gameState == 0) { //START MENU 
            //kickoff first
            if(!initProcessing && !preSetup) {
                console.log("Presetup INIT");
                Loading();
                
                
                prepInterval = setInterval(PreloadText, 25);

                //prepInterval = setInterval(InitPreLoad, 25);
                preSetup = true; //presetup running    
                console.log("Presetup Successful...");
                //InitPreLoad();
                //calls all process functions for graphics
                //stop console or ctx being removed by roller
                console.log(canvas);
                console.log(context);

            }
            //presetup complete, initial processing complete
            if(initProcessing && preSetup) {
                load.text = " Pre-setup complete, loading game...";
            }

        }else if (gameState == 1) { //GAME [SHIP INTERIOR]
            if(!stateInit) {
                console.log("Running initial game-state setup...");
                InitSetupState();
                stateInit = true;
                
                load.text = " [Game Running: SHIP INTERIOR]";
            }

            if(dState == 0 && !intervalD_R) {
                intervalD = setInterval(PrintDialogue(d1), 2000);
            }
            else if(dState == 1 && !intervalD_R) {
                intervalD = setInterval(PrintDialogue(d2), 2000);
            }
            else if(dState == 2 && !intervalD_R) {
                intervalD = setInterval(PrintDialogue(d3), 2000);
            }
            else if(dState == 3 && !intervalD_R) {
                intervalD = setInterval(PrintDialogue(d4), 2000);
            }
            else if(dState == 4) { // loop emergency coms
                if(d_t == 0) {
                    cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
                }
                intervalD = setInterval(PrintDialogue(d5), 5000);
            }
            else if(dState == 5 && !intervalD_R) { //emergency message
                intervalD = setInterval(PrintDialogue(d6), 2000);
            }

            if(dState == 3 ) {
                //detect player movement
                if((pX != tempX) || (pY != tempY)) {
                    console.log("player has moved");
                    dState = 4;
                    d_t = 0;
                    //move bubble
                    sBub2.x = 30;
                    sBub2.y = 90;
                }
            }

            //update player
            //TODO, setup player obj
            if(zPlayer != null) {
                zPlayer.x = pX;
                zPlayer.y = pY;
                sBody.x = pX;
                sBody.y = pY+19;
                sArmR.x = pX-7;
                sArmR.y = pY+14;
                sArmL.x = pX+16;
                sArmL.y = pY+14;
                sLegR.x = pX+10;
                sLegR.y = pY+36;
                sLegL.x = pX+2;
                sLegL.y = pY+36;
            }
        } else if(gameState == 2) { //GAME [Ship Combat]
            if(zShip != null) {
                zShip.x = pX;
                zShip.y = pY;
            }
        }

    },


    render: () => {
        //Render States
        if(load) {
            load.render();
        }
        if(tutText) {
            tutText.render();
        }

        if(gameState == 0) { //START MENU
            
        } else if (gameState == 1) { //GAME

            panelRight.render();
            panelScan.render();
            panelShip.render();

            if(!mapView) {
                if(zPlayer) {
                    //objects
                    //TODO, setup render queue
                    sComp1.render();
                    sComp2.render();
                    sStnd1.render();
                    sStnd2.render();
                    sBub1.render();
    
                    sConsole.render();
                    sCon1.render();
                    sCon2.render();
    
                    //simple state change for warning bubble
                    if(dState<2) {
                        sBub2.render();
                    }
                    
                    if(dState == 4) {
                        sBub2.render();
                    }
    
                    if(dState >= 5) {
                        warningText.render();
                    }
    
                    // //player
                    // //TODO, setup player obj
                    zPlayer.render();
                    sBody.render();
                    sArmL.render();
                    sArmR.render();
                    sLegL.render();
                    sLegR.render();   

                    //enabled button                    
                    context.beginPath();
                    context.rect(280, 10, 40, 40);
                    context.fillStyle = "#222222";
                    context.fill();
                }

                tempTest4x4.render();
                tempTest8x8.render();

                shipReadout.render();
            } else {
                
                
                commandButton.render();
                mapButton.render();

                
                GenerateGalacticStructure(context);
                
                //enabled button  
                context.beginPath();
                context.rect(320, 10, 40, 40);
                context.fillStyle = "#222222";
                context.fill();

            }
    
            commandButton.render();
            mapButton.render();

        } 
        
        //else if (gameState == 2) { //ship command  
            // panelRight.render();
            // //commandButton.render();
            
            // if(zShip) {
            //     zShip.render();
            //     zProbe.render();
            // }  
        //}


    }
});

loop.start();

/////////////////////////////////////////////////////
//BUTTONS/INPUT
////////////////////////////////////////////////////
kontra.onKey(['left', 'a', 'q'], function(e) {
    //console.log("left button");
    pX -= 14;
    //console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

kontra.onKey(['right', 'd', 'd'], function(e) {
    //console.log("right button");
    pX += 14;
    //console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

kontra.onKey(['up', 'w', 'z'], function(e) {
    //console.log("up button");
    pY -= 10;
    //console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

kontra.onKey(['down', 's'], function(e) {
    //console.log("down button");
    pY += 10;
    //console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

kontra.onKey(['f'], function(e) {
    //console.log("down button");
    InteractCheck('f');
}, 'keyup');

kontra.onKey(['e'], function(e) {
    //console.log("down button");
    InteractCheck('e');
}, 'keyup');

/////////////////////////////////////////////////////
//SFX
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
//MUSIC
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
//Render Queue
/////////////////////////////////////////////////////
let rQ = { ui: [], bg: [], sp: [] };
//UI Objects
function AddRQ_UI(obj) {
    rQ.ui.push({obj}); }
//Background Objects
function AddRQ_BG(obj) {
    rQ.bg.push({obj}); }
//Sprite Objects
function AddRQ_SP(obj) {
    rQ.sp.push({obj}); }
//Clear all render queues
function ClearRQ() {
    rQ.ui.length = 0; rQ.ui = [];
    rQ.bg.length = 0; rQ.bg = [];
    rQ.sp.length = 0; rQ.sp = []; }
//Clear just sprite render queue
function ClearRQ_SP() {
    rQ.sp.length = 0; rQ.sp = []; }