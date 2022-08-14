//  JS13K PROTOSTELLAR   //
//  By Alex Delderfield  //
//          2022         //

////////////////////////////////////////////////////
//INITILIZATIONS
////////////////////////////////////////////////////
const { init, GameLoop, Scene, GameObject, Button, 
    Sprite, initPointer, track, bindKeys, Text } = kontra;

const { canvas, context } = init();

compCanvas = document.getElementById('compileIMG');
consCanvas = document.getElementById('canvasConsole');
compCTX = compCanvas.getContext("2d");

initPointer();
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
pX = 100;
pY = 100;
zPlayer = Sprite({
    x: pX,
    y: pY,
});

//Menu
panelRight = null;

//colour registers
cREG = ["#FFF", "#000", "", "", "", "", ""]

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

    var playerSprite = sprArr[10];
    playerSprite.width=28;
    playerSprite.height=24;

    zPlayer = Sprite({
        x: pX,
        y: pY,
        //color: 'white',
        image:playerSprite,
    });
    //chunk0.addChild(cPlayer);

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
                prepInterval = setInterval(InitPreLoad, 250);
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
                
                load.text = " [Game Running]";
            }

            //update player
            if(zPlayer != null) {
                zPlayer.x = pX;
                zPlayer.y = pY;
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
            if(zPlayer) {
                zPlayer.render();
                //console.log("rendering player..");
            }

            if(panelRight) {
                panelRight.render();
            }


        }
    }
});

loop.start();


/////////////////////////////////////////////////////
//BUTTONS/INPUT
////////////////////////////////////////////////////
// bindKeys(['left', 'a', 'q'], function(e) {
//     console.log("left button");
//     //document.getElementById("left").click();
// }, 'keyup');

// bindKeys(['right', 'd', 'd'], function(e) {
//     console.log("right button");
//     document.getElementById("right").click();
// }, 'keyup');

// bindKeys(['up', 'w', 'z'], function(e) {
//     console.log("up button");
//     document.getElementById("up").click();
// }, 'keyup');

// bindKeys(['down', 's'], function(e) {
//     console.log("down button");
//     document.getElementById("down").click();
// }, 'keyup');


/////////////////////////////////////////////////////
//SFX
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
//MUSIC
/////////////////////////////////////////////////////