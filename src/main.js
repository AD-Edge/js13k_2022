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

// const { init, GameLoop, Scene, GameObject, Button, 
//     Sprite, initPointer, initKeys, track, onKey, Text } = kontra;
const { init, initPointer, GameLoop, Sprite, 
    initKeys, onKey, Text, Button } = kontra;

const { canvas, context } = init();

compCanvas = document.getElementById('compileIMG');
consCanvas = document.getElementById('canvasConsole');
compCTX = compCanvas.getContext("2d");
cosCTX = consCanvas.getContext("2d");

initKeys();
initPointer();

//Primary Game State
//0 = Start screen/zone
//1 = Game area
//2 = Death 
gameState = 0;
stateInit = false;
preSetup = false;
initProcessing = false;
load = null;
sceneChange = -1;
timer = 0;

//Player
pX = 110;
pY = 180;
var zPlayer, zShip, sBody, sArmL, sArmR, sLegL, sLegR = null;
var sComp1, sComp2, sStnd1, sStnd2, sBub1, sBub2 = null;
var sConsole, sCon1, sCon2, sExc = null;

var tutText = Text({
    x: 130,
    y: 60,
    text: ' ... ',
    color: '#FFFFFF',
    font: '14px Calibri, bold, sans-serif'
});

//Menu
panelRight = null;
panelScan = null;
commandButton = null;

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
    load = Text({
        x: 6,
        y:10,
        text: ' Preloading sprite data...',
        color: '#FFFFFF',
        font: '16px Calibri, bold, sans-serif'
    });
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

    panelRight = Sprite({
        x: 550,
        y: 0,
        anchor: {x: 0.5, y: 0.5},
        // required for a rectangle sprite
        width: 250,
        height: 1000,
        color: '#555'
      });
    panelScan = Sprite({
        x: 530,
        y: 95,
        anchor: {x: 0.5, y: 0.5},
        // required for a rectangle sprite
        width: 180,
        height: 150,
        color: '#AAA'
      });
    commandButton = Button({
        x: 380, y:-50,
        color: '#777',
        width: 40,
        height: 40,
        onDown() {
            this.color = '#38C';
            SwitchCommand();
        },
        onUp() { this.color = '#777'; },
        onOver() { this.color = '#CCC'},
        onOut: function() { this.color = '#777';}
    });

    //Player Sprites
    zPlayer = CreateSpriteObj(37, 0.4, pX, pY);
    zShip = CreateSpriteObj(48, 0.4, pX, pY);

    sBody = CreateSpriteObj(38, 0.4, pX, pY);
    sArmR = CreateSpriteObj(39, 0.4, pX, pY);
    sArmL = CreateSpriteObj(40, 0.4, pX, pY);
    sLegR = CreateSpriteObj(41, 0.6, pX, pY);
    sLegL = CreateSpriteObj(41, 0.6, pX, pY);
    
    //Object Sprites
    sComp1 = CreateSpriteObj(50, 0.82, 190, 150);
    sComp2 = CreateSpriteObj(50, 0.82, 75, 200);
    sStnd1 = CreateSpriteObj(43, 0.82, 75, 224);
    sStnd2 = CreateSpriteObj(43, 0.82, 190, 174);
    sBub1 = CreateSpriteObj(42, 0.75, 182, 120);
    sBub2 = CreateSpriteObj(42, 0.75, 70, 170);
    
    //main console
    sConsole = CreateSpriteObj(44, 0.55, 30, 120);
    sCon1 = CreateSpriteObj(45, 0.55, 22, 144);
    sCon2 = CreateSpriteObj(46, 0.55, 62, 125);
    //TODO - add chunks/parent objects, etc
    //chunk0.addChild(cPlayer);

}

function SwitchCommand() {
    console.log("command window switched");
    stateInit = true;
    sceneChange = 2;

    pX = 190;
    pY = 180;

    load.text = " [Game Running: SHIP COMMAND]";
    tutText.text = " <Instructions for ship scanning>";
}

function CreateMenuPanel() {

}

function CreateSpriteObj(sNum, scale, offX, offY) {   
    
    
    const tempSprite = sprArr[sNum];
    tempSprite.width *= scale;
    tempSprite.height *= scale;

    console.log("tempSprite '" + sNum + "' width: " + tempSprite.width);

    const gameObj = Sprite({
        x: offX,
        y: offY,
        image:tempSprite,
    });

    return gameObj;

}

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
        commandButton.y = 10;
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
const loop = GameLoop({

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
                Loading();
                prepInterval = setInterval(InitPreLoad, 25);
                preSetup = true; //presetup running
                //InitPreLoad();
                //calls all process functions for graphics
                //stop console or ctx being removed by roller
                // console.log(canvas);
                // console.log(context);
            }
            //presetup complete, initial processing complete
            if(initProcessing && preSetup) {
                load.text = " Pre-setup complete, loading game...";
            }

        }else if (gameState == 1) { //GAME
            if(!stateInit) {
                //console.log("Setup state init");
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
        } else if(gameState == 2) {
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
                    commandButton.render();
                }

                //player
                //TODO, setup player obj
                zPlayer.render();
                sBody.render();
                sArmL.render();
                sArmR.render();
                sLegL.render();
                sLegR.render();
            }
        } else if (gameState == 2) { //ship command
            
            panelRight.render();
            panelScan.render();
            commandButton.render();

            if(zShip) {
                zShip.render();
            }
        }
    }
});

loop.start();

/////////////////////////////////////////////////////
//BUTTONS/INPUT
////////////////////////////////////////////////////
onKey(['left', 'a', 'q'], function(e) {
    //console.log("left button");
    pX -= 14;
    //console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

onKey(['right', 'd', 'd'], function(e) {
    //console.log("right button");
    pX += 14;
    //console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

onKey(['up', 'w', 'z'], function(e) {
    //console.log("up button");
    pY -= 10;
    //console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

onKey(['down', 's'], function(e) {
    //console.log("down button");
    pY += 10;
    //console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

onKey(['f'], function(e) {
    //console.log("down button");
    InteractCheck('f');
}, 'keyup');

onKey(['e'], function(e) {
    //console.log("down button");
    InteractCheck('e');
}, 'keyup');

/////////////////////////////////////////////////////
//SFX
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
//MUSIC
/////////////////////////////////////////////////////