var canvas = document.getElementById('canvasMain');
var ctx = canvas.getContext("2d");
var coreX = canvas.width / 2.25;
var coreY = canvas.height / 2;
var pxW = 6;
var coreThickness = 1;

function GenerateGalacticStructure() {
    a = 1.2;
    b = 1.2;
    scale = 1.5;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.moveTo(coreX, coreY);
    ctx.beginPath();

    //Arm 1
    for (i = 6; i < 90; i++) {
        angle = 0.1 * i;
        x = (coreX + (((a + b)+0.4*i) * angle/scale + 0.4*(0.8*i)) * Math.cos(angle)) + 0.25*i;
        y = (coreY + (((a + b)+0.2*i) * angle/scale + 0.1*(0.8*i)) * Math.sin(angle)) + 0.25*i;
        //console.log("x: " + x + ", y: " + y);
        ctx.lineTo(x, y);
        //get point in grid
        DrawPixelInGrid(x, y);
    }
    ctx.strokeStyle = "#FFF";
    ctx.stroke();
    
    //Arm 2
    ctx.moveTo(coreX, coreY);
    ctx.beginPath();
    
    for (i = 6; i < 90; i++) {
        angle = 0.1 * i;
        x = (coreX - (((a + b)+0.5*i) * angle/scale + 0.4*(0.8*i)) * Math.cos(angle)) + 0.15*i;
        y = (coreY - (((a + b)+0.2*i) * angle/scale + 0.1*(0.8*i)) * Math.sin(angle)) + 0.15*i;
        ctx.lineTo(x, y);
        //get point in grid
        DrawPixelInGrid(x, y);
    }
    ctx.strokeStyle = "#FFF";
    ctx.stroke();
}

function DrawPixelInGrid(x, y) {
    var xPixel = Math.floor(x/pxW);
    var yPixel = Math.floor(y/pxW);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#FFF';

    for(var i = xPixel-coreThickness; i <= xPixel+coreThickness; i++) {
        for(var j = yPixel-coreThickness; j <= yPixel+coreThickness; j++) {
            ctx.fillRect( (i*pxW), (j*pxW), pxW, pxW);
        }
    }
    //console.log("pixel " + x + ", " + y + " is in grid: " + xPixel + ", " + yPixel);
}

function DrawPixelMap() {
    //draw pixels
    var pix = 0;
    for(var i = 0; i < canvas.height; i+=pxW) {
        for(var j = 0; j < canvas.width; j+=pxW) {
            if( pix & 1 ) {
                //console.log("odd");
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = '#FFF';
                ctx.fillRect( (j), (i), pxW, pxW);
            } 
            pix++;
        }
        pix++;
    }
}

const GRID_SIZE = 3; //scale of noise map/detail
const RESOLUTION = 32; //32 = pixelated, 128 = smooth
const COLOR_SCALE = 250; //colour range

let pixel_size = canvas.width / RESOLUTION;
let node_size = GRID_SIZE / RESOLUTION;

var gradients = {};
var memory = {};

const SEED = 340;

function PerlinNoiseMap() {
    for(let y = 0; y < GRID_SIZE; y += node_size/ GRID_SIZE) {
        for(let x = 0; x < GRID_SIZE; x += node_size/ GRID_SIZE) {
            let v = parseInt(CalcPerlin(x,y) * COLOR_SCALE);
            ctx.fillStyle = 'hsl('+v+',50%,50%)';
            ctx.fillRect( x / GRID_SIZE * canvas.width,
                          y / GRID_SIZE * canvas.width,
                        pixel_size,pixel_size);
        }
    }
}

function CalcPerlin(x, y) {
    if (memory.hasOwnProperty([x,y]))
    return memory[[x,y]];

    let xf = Math.floor(x);
    let yf = Math.floor(y);
    //interpolate
    let tl = DotProductGrid(x, y, xf,   yf);
    let tr = DotProductGrid(x, y, xf+1, yf);
    let bl = DotProductGrid(x, y, xf,   yf+1);
    let br = DotProductGrid(x, y, xf+1, yf+1);
    let xt = Interpret(x-xf, tl, tr);
    let xb = Interpret(x-xf, bl, br);
    let v = Interpret(y-yf, xt, xb);
    memory[[x,y]] = v;

    return v;
}

function RandomVector() {
    //var theta = Math.random() * 2 * Math.PI;
    var theta = Mulberry32(SEED) * 2 * Math.PI;
    return {
        x: Math.cos(theta),
        y: Math.sin(theta)
    };
}

function Mulberry32(a) {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function DotProductGrid(x, y, vx, vy, seed){
    let g_vect;
    let d_vect = {x: x - vx, y: y - vy};
    if (gradients[[vx,vy]]){
        g_vect = gradients[[vx,vy]];
    } else {
        g_vect = RandomVector(seed);
        gradients[[vx, vy]] = g_vect;
    }
    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
}

function SmoothStep(x) {
    return 6*x**5 - 15*x**4 + 10*x**3;
}

function Interpret(x, a, b) {
    return a + SmoothStep(x) * (b-a);
}

function CreateRandomWithSeed(seed) {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let imul = Math.imul(seed ^ seed >>> 15, 1 | seed);
    imul = imul + Math.imul(imul ^ imul >>> 7, 61 | imul) ^ imul;
    
    return ((imul ^ imul >>> 14) >>> 0) / 4294967296;
}


GenerateGalacticStructure();

//DrawPixelMap();

PerlinNoiseMap();

var seed_new = CreateRandomWithSeed(4285375);
var test = Mulberry32(seed_new);

// console.log("Generating random num via Mulberry32: " + test*10);
console.log("Generating random seed: " + seed_new);


//outer expansion added
// a = 1.2;
// b = 1.2;
// scale = 2.2;

// ctx.clearRect(0, 0, canvas.width, canvas.height);
// ctx.moveTo(coreX, coreY);
// ctx.beginPath();

// //Arm 1
// for (i = 6; i < 90; i++) {
//     angle = 0.1 * i;
//     x = (coreX + (((a + b)+0.4*i) * angle/scale + 0.4*(0.8*i)) * Math.cos(angle)) + 0.25*i;
//     y = (coreY + (((a + b)+0.2*i) * angle/scale + 0.1*(0.8*i)) * Math.sin(angle)) + 0.25*i;

//     console.log("x: " + x + ", y: " + y);

//     ctx.lineTo(x, y);
// }
// ctx.strokeStyle = "#FFF";
// ctx.stroke();

// //Arm 2
// ctx.moveTo(coreX, coreY);
// ctx.beginPath();

// for (i = 6; i < 90; i++) {
//     angle = 0.1 * i;
//     x = (coreX - (((a + b)+0.5*i) * angle/scale + 0.4*(0.8*i)) * Math.cos(angle)) + 0.15*i;
//     y = (coreY - (((a + b)+0.2*i) * angle/scale + 0.1*(0.8*i)) * Math.sin(angle)) + 0.15*i;

//     ctx.lineTo(x, y);
// }
// ctx.strokeStyle = "#FFF";
// ctx.stroke();

//nicely distorted, just needs outer expansion
// a = 1.2;
//     b = 1.2;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.moveTo(coreX, coreY);
//     ctx.beginPath();

//     //Arm 1
//     for (i = 6; i < 90; i++) {
//         angle = 0.1 * i;
//         x = (coreX + (a + b * angle + 2*(0.8*i)) * Math.cos(angle)) + 0.25*i;
//         y = (coreY + (a + b * angle + 1*(0.8*i)) * Math.sin(angle)) + 0.25*i;

//         console.log("x: " + x + ", y: " + y);

//         ctx.lineTo(x, y);
//     }
//     ctx.strokeStyle = "#FFF";
//     ctx.stroke();
    
//     //Arm 2
//     ctx.moveTo(coreX, coreY);
//     ctx.beginPath();

//     for (i = 6; i < 90; i++) {
//         angle = 0.1 * i;
//         x = (coreX - (a + b * angle + 2*(0.8*i)) * Math.cos(angle)) + 0.15*i;
//         y = (coreY - (a + b * angle + 1*(0.8*i)) * Math.sin(angle)) + 0.15*i;

//         ctx.lineTo(x, y);
//     }
//     ctx.strokeStyle = "#FFF";
//     ctx.stroke();


//some distortion 
// a = 10.0;
// b = 10.0;

// ctx.clearRect(0, 0, canvas.width, canvas.height);
// ctx.moveTo(coreX, coreY);
// ctx.beginPath();

// //Arm 1
// for (i = 0; i < 90; i++) {
//     angle = 0.1 * i;
//     x = (coreX + (a + b * angle + 18) * Math.cos(angle)) + 0.25*i;
//     y = (coreY + (a + b * angle) * Math.sin(angle)) + 0.25*i;

//     console.log("x: " + x + ", y: " + y);

//     ctx.lineTo(x, y);
// }
// ctx.strokeStyle = "#FFF";
// ctx.stroke();

// //Arm 2
// ctx.moveTo(coreX, coreY);
// ctx.beginPath();

// for (i = 0; i < 90; i++) {
//     angle = 0.1 * i;
//     x = (coreX - (a + b * angle + 18) * Math.cos(angle)) + 0.15*i;
//     y = (coreY - (a + b * angle) * Math.sin(angle)) + 0.15*i;

//     ctx.lineTo(x, y);
// }
// ctx.strokeStyle = "#FFF";
// ctx.stroke();





//Simple/Single spiral
// a = 10.0;
// b = 10.0;

// ctx.clearRect(0, 0, canvas.width, canvas.height);
// ctx.moveTo(coreX, coreY);
// ctx.beginPath();

// //Arm 1
// for (i = 0; i < 100; i++) {
//     angle = 0.1 * i;
//     x = coreX + (a + b * angle ) * Math.cos(angle);
//     // x = coreX + (a + b * angle +10) * Math.cos(angle);
//     y = coreY + (a + b * angle) * Math.sin(angle);

//     console.log("x: " + x + ", y: " + y);

//     ctx.lineTo(x, y);
// }
// ctx.strokeStyle = "#FFF";
// ctx.stroke();