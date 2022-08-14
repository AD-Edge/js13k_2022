//  JS13K PROTOSTELLAR   //
//  By Alex Delderfield  //
//          2022         //

////////////////////////////////////////////////////
//INITILIZATIONS
////////////////////////////////////////////////////
const { init, GameLoop, Scene, GameObject, Button, 
    Sprite, initPointer, track, bindKeys, Text } = kontra;

const { canvas, context } = init();

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

/////////////////////////////////////////////////////
//GAME FUNCTIONS
/////////////////////////////////////////////////////
function Loading() {
    load = Text({
        x: 6,
        y:10,
        text: 'Loading...',
        color: '#FFFFFF',
        font: '16px Calibri, bold, sans-serif'
    });
}

//do preloading setup here
function InitPreLoad() {

}

//init setup state
function InitSetupState() {

}

function DrawMenuPanel() {
    ctx.beginPath();
    ctx.rect(20, 20, 150, 100);
    ctx.stroke();
}

/////////////////////////////////////////////////////
//PRIMARY GAME LOOP
/////////////////////////////////////////////////////
const loop = GameLoop({
    update: () => {

        //Update States
        if(gameState == 0) { //START MENU 
            //kickoff first
            if(!initProcessing && !preSetup) {
                Loading();
                InitPreLoad();
                preSetup = true;
                //calls all process functions for graphics
            }
            if(!initProcessing && preSetup) {
                
            }

        }else if (gameState == 1) { //GAME
            if(!stateInit) {
                //console.log("Setup state init");
                InitSetupState();
                stateInit = true;
            }
        }

    },


    render: () => {
        //Render States
        if(gameState == 0) { //START MENU
            if(load) {
                load.render();
            }
        } else if (gameState == 1) { //GAME

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