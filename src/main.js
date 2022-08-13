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

/////////////////////////////////////////////////////
//GAME FUNCTIONS
/////////////////////////////////////////////////////



/////////////////////////////////////////////////////
//PRIMARY GAME LOOP
/////////////////////////////////////////////////////
const loop = GameLoop({
    update: () => {

    },
    render: () => {
                
    }
});

loop.start();


/////////////////////////////////////////////////////
//BUTTONS/INPUT
////////////////////////////////////////////////////
bindKeys(['left', 'a', 'q'], function(e) {
    document.getElementById("left").click();
}, 'keyup');

bindKeys(['right', 'd', 'd'], function(e) {
    document.getElementById("right").click();
}, 'keyup');

bindKeys(['up', 'w', 'z'], function(e) {
    document.getElementById("up").click();
}, 'keyup');

bindKeys(['down', 's'], function(e) {
    document.getElementById("down").click();
}, 'keyup');


/////////////////////////////////////////////////////
//SFX
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
//MUSIC
/////////////////////////////////////////////////////