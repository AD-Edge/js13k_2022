//  JS13K PROTOSTELLAR   //
//  By Alex Delderfield  //
//          2022         //

////////////////////////////////////////////////////
//INITILIZATIONS
////////////////////////////////////////////////////
const { init, GameLoop, Scene, GameObject, Button, 
    Sprite, initPointer, initKeys, track, onKey, Text } = kontra;

const { canvas, context } = init();

compCanvas = document.getElementById('compileIMG');
consCanvas = document.getElementById('canvasConsole');
compCTX = compCanvas.getContext("2d");
cosCTX = consCanvas.getContext("2d");

initPointer();
initKeys();
kontra.initKeys();

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
var zPlayer = null;
var sBody = null;
var sArmL = null;
var sArmR = null;
var sLegL = null;
var sLegR = null;

var sComp1 = null;
var sComp2 = null;
var sBub1 = null;
var sBub2 = null;

//Menu
panelRight = null;

//colour registers
cREG = ["#FFF", "#000", "", "", "", "", ""]

//temp dialogue
dState=0;
d1 = "Almost got this darn module fixed ... [E to continue]";
d2 = ">Press F to interact with the module [REPAIR]";
d3 = "Great! That should be operational again ...";
d4 = "Now lets get that other one fixed up too.";
d5 = "** EMERGENCY ALARM **           ";

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

    //TODO - optimise these next processes
    var playerSprite = sprArr[37];
    playerSprite.width *= 0.33;
    playerSprite.height *= 0.33;
    var bodySprite = sprArr[38];
    bodySprite.width *= 0.33;
    bodySprite.height *= 0.33;
    var armRSprite = sprArr[39];
    armRSprite.width *= 0.33;
    armRSprite.height *= 0.33;
    var armLSprite = sprArr[40];
    armLSprite.width *= 0.33;
    armLSprite.height *= 0.33;
    var legSprite = sprArr[41];
    legSprite.width *= 0.33;
    legSprite.height *= 0.33;
    
    var bubSprite = sprArr[42]
    bubSprite.width *= 0.6;
    bubSprite.height *= 0.6;
    var compSprite = sprArr[43]
    compSprite.width *= 0.6;
    compSprite.height *= 0.6;

    zPlayer = Sprite({
        x: pX,
        y: pY,
        //color: 'white',
        image:playerSprite,
    });
    sBody = Sprite({
        x: pX,
        y: pY+14,
        //color: 'white',
        image:bodySprite,
    });
    sArmR = Sprite({
        x: pX-6,
        y: pY+12,
        //color: 'white',
        image:armRSprite,
    });
    sArmL = Sprite({
        x: pX+14,
        y: pY+12,
        //color: 'white',
        image:armLSprite,
    });
    sLegR = Sprite({
        x: pX+6,
        y: pY+26,
        //color: 'white',
        image:legSprite,
    });
    sLegL = Sprite({
        x: pX,
        y: pY+26,
        //color: 'white',
        image:legSprite,
    });

    sComp1 = Sprite({
        x: 190,
        y: 150,
        //color: 'white',
        image:compSprite,
    });
    sComp2 = Sprite({
        x: 75,
        y: 200,
        //color: 'white',
        image:compSprite,
    });
    sBub1 = Sprite({
        x: 185,
        y: 120,
        //color: 'white',
        image:bubSprite,
    });
    sBub2 = Sprite({
        x: 70,
        y: 170,
        //color: 'white',
        image:bubSprite,
    });

    //chunk0.addChild(cPlayer);

}

function CreateSpriteObj(obj, sprite, scale) {   
}

function InteractCheck(ltr) {
    //Next dialogue prompt/Interact/Access
    if(ltr === 'e' && d_t == 0) {
        if(dState == 0) {
            //console.log("moving to next bit of dialogue");
            cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
            dState = 1;
            intervalD_R = false;
        }
        if(dState == 2) {
            SavePlayerPos();
            cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
            dState = 3;
            intervalD_R = false;
        }
    }
    
    //Alt interact/FIX
    if(ltr === 'f' && d_t == 0) {
        if(dState == 1) {
            //console.log("fix");
            cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
            dState = 2;
            intervalD_R = false;
        }
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
            if(dState == 1 && !intervalD_R) {
                intervalD = setInterval(PrintDialogue(d2), 2000);
            }
            if(dState == 2 && !intervalD_R) {
                intervalD = setInterval(PrintDialogue(d3), 2000);
            }
            if(dState == 3 && !intervalD_R) {
                intervalD = setInterval(PrintDialogue(d4), 2000);
            }

            if(dState == 3 ) {
                //detect player movement
                if((pX != tempX) || (pY != tempY)) {
                    console.log("player has moved");
                    dState = 4;
                    d_t = 0;
                }
            }

            if(dState == 4) {
                if(d_t == 0) {
                    cosCTX.clearRect( 0, 0, consCanvas.width, consCanvas.height);
                }
                intervalD = setInterval(PrintDialogue(d5), 5000);
            }



            //update player
            //TODO, setup player obj
            if(zPlayer != null) {
                zPlayer.x = pX;
                zPlayer.y = pY;
                sBody.x = pX;
                sBody.y = pY+14;
                sArmR.x = pX-6;
                sArmR.y = pY+12;
                sArmL.x = pX+14;
                sArmL.y = pY+12;
                sLegR.x = pX+6;
                sLegR.y = pY+26;
                sLegL.x = pX;
                sLegL.y = pY+26;
            }
        }

    },


    render: () => {
        //Render States
        if(load) {
            load.render();
        }

        if(gameState == 0) { //START MENU
            
        } else if (gameState == 1) { //GAME
            panelRight.render();



            if(zPlayer) {
                //objects
                //TODO, setup render queue
                sComp1.render();
                sComp2.render();
                sBub1.render();

                //simple state change for warning bubble
                if(dState<2) {
                    sBub2.render();
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
    console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

onKey(['right', 'd', 'd'], function(e) {
    //console.log("right button");
    pX += 14;
    console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

onKey(['up', 'w', 'z'], function(e) {
    //console.log("up button");
    pY -= 10;
    console.log("DEBUG POS: " + pX + ", " + pY);
}, 'keyup');

onKey(['down', 's'], function(e) {
    //console.log("down button");
    pY += 10;
    console.log("DEBUG POS: " + pX + ", " + pY);
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