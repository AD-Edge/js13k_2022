/////////////////////////////////////////////////////
//Tools and Functions
/////////////////////////////////////////////////////

var pxW = 2;
var canvasDraw = document.getElementById("canvasDraw");
var dctx = canvasDraw.getContext('2d');
//Grid Calcs / variables
var gridX = 8; //number of grid spaces, from 2 - 32
var gridY = 8; //number of grid spaces, from 2 - 32
var gridPix = 16; //number of pixels in each grid space

//New method, for generating sprite images upon request
function GenerateSpriteImage(sNum) {

    //grab data from px.js

    //build in canvas

    //create image // do we track this? dont bother for now

    //save as base 64? Maybe not, just use the image data direct?


}

//Before kicking off queue, use this image instead
function GenerateTempSpriteImage(sNum) {
    //fill canvas
    dctx.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
    //draw pixels

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

    //generate and return image

    return null;

}

function getBase64Img() {
    // return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQBAMAAAB8P++eAAAAMFBMVEX////7+/vr6+vNzc2qqqplywBWrQD/Y5T/JTf+AADmAABeeEQvNydqAAAGBAMAAAGoF14oAAAEBUlEQVR42u2WTUwUVxzA/2925LIojsyqCLtMqSQeFJeFROPHstjdNkZdkaiX9mRTovYgSYNFE43Rg5IeNG5SqyaVcGzXkvTm7hZWq9bKriAYYzSLBI3WAplp0jY2kV3fzPuYGcBxD/bmO0zevPeb//f7v0FQ5EDvwf8LFG89ixYDol9Wo+smKal2sHF6kM6q7qbE5tY03d7SHR6ygiuvwY1txkzIlPaD3NQ4Zryk/PCP1wKibBlI97dq+idXUxqgcEkVnruS/smRpuWaCbrHU5pc/wyTQsata0U77wVBTlRP9UNkT9oE61K9AHL9VERbeTVurMjNm54mqrFw8CwKmWBfpf6V2Dx/TdxN3YjMf2JwIEZ8JnjnEbEjvLAQZ1EKlxkciJ9UcdD1Z5ztDmgsgPIrMkWtMgfd41xOYXZOIjUcLB3tdchypHWIgb5k2gH0nE0zMHjRCRTLWxgY/VQrDuybcAQ/DDEwmwEn8COlSDBcTUE0GXcEjRzqoDDhDH7sfccg2szAt9hogjBFQFRmDyd9N1VTEFegXXKEVKQFJHEUd0DSKhLthIm0HSQpnNdCNizgq147GP0m7QTygNMye6NqM9ekwlG4kLI5I4cMZ+bVhMA8MwX1rw9oIjakAYX6jXlBRRJ4BF6PwmRSfQyLFhJwWy/IG8khKuirljODG0DfGAd3qCBNEol5vCqFAxqYLeUyB0H2A2Q0DspRD3BQfJEc5KBl6KprG6pNEPqqfkKzOQBsha2bQeVw6g3nSySaGYgb99ylhsLDLVYQ3E+oozOGHKzVbCBs+HkuUm6ivd4E0ZYeNTPTTrn51+0wA9TJgpZVLeaV1y+4yS8c64W0/AcFTBCHK/fFEMwFAmo4KRldE0ZxsF8cGbTuzYqHtOz8t6e8TMk5CcjNSC+kdcfgPyag9AoDhUQARmvAcIiAW3v0JzWJg64BJXdBQ21+/b4zwMqRW5dA2h3I7+onYJd+Y4i3FbyMxz4hxE7hS2MBdSq6Fgq6Bny/dxv6Sk76COj6Yz91ZG8dToQ7oYNCqu4QjX9FK5UoPt/PXO701mruhwcxGP2ecahzzxBtUtlzLHclsXtBA6wc+a2brlUc8TCvg5cPM7LiaOPT8Y4ub3bpAbqy+MQ18xRmvIe5nr83YXDt8Nca0/GveWniSHByybEVwx1dD1ccYB/6yF8DTaGcYLFA391o6DjjohaWfKXQ/xCWazmhPDhNbYf2WH4fse9zhRUkLwrXlUD+9iVD5HR77KWheclxkqsZ1bM+pqcWZ2xVe0zXjPb6pyO8IK1l5trcA7mLKuo48+VpQG0BuPmZeTbs9Vi+9oQyqv6Ieyou4FybU+HqRS4o+TH1VG7MvgFFjvfguwFfA4FobmCxcnTPAAAAAElFTkSuQmCC";

    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAiCAYAAAC5gzL5AAAAAXNSR0IArs4c6QAAANdJREFUSEvllUsOgCAMROVucGoOhymxZKz9oFEX6k7Ux3Q6xdRaa4u4SilyaXdfa93dJwmJAPw1glyI3JEAvMkURAOwCgL9EUL1XzYWOyBB2H7TWHTdywsD+P2RE63/bmy3zBBQhUSpDWMvPdHUEASVdyW4EKlgs++H5JzHUYAysQxrjlhNmoVoGTlAvKm1AuhCInMxbLTBKAeVzELYt8PJFqUUn4eeSCOt4aP1Xo438jJc2hFhljOrpBur/Xe0llrlPAu5pcVn/DDL+RjkTPTf88Q6qHF9Bd5rPYTJOkQGAAAAAElFTkSuQmCC";
}


var base64img = getBase64Img();
var base64 = null;

function Base64ToImage(base64img, callback) {
    const img = new Image();
    img.onload = function() {
        callback(img);
    };
    img.src = base64img;
    img.id = "testimg";

    //and convert back to base 64? 
    //var base64 = ImageToBase64();
    //console.log(base64);
    
}
// Base64ToImage(base64img, function(img) {
//     document.getElementById('main').appendChild(img);
//     var log = "w=" + img.width + " h=" + img.height;
//     document.getElementById('log').value = log;
    
//     //test getting that image we have just drawn back to base64
//     base64 = getBase64Image(document.getElementById("testimg"));
//     console.log(base64);
// });

//demo returning image from one embedded in html
// var img2 = document.getElementById("testimg2");
// img2.onload = function() {
//     base64 = getBase64Image(img2);
//     console.log(base64);
// }

function getBase64Image(img) {
    // var canvas = document.createElement("canvas");
    //var ctx = canvas.getContext("2d");

    canvasDraw.width = img.width;
    canvasDraw.height = img.height;
    dctx.drawImage(img, 0, 0);
    var dataURL = canvasDraw.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function ImageToBase64() {
    var dataURL = canctx.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}


//Data URI ?
//Method of embedding images and other files in webpages as a string of text, generally using base64 encoding.

//You can use btoa() and atob() to convert to and from base64 encoding.















//Decoder functions, for decoding compressed pixel art image data
var blobArr = [];
//sprite array
sprArr = [];

var output = document.getElementById("h3");
const mimeType = 'image/png';
var currentArray = 0;

var prepInterval = null;
var iInc = 0;
var scale = 4;

//Preloading setup here
function InitPreLoad() {
    if(iInc < px.length) {

    //for(var i=0; i< px.length; i++) {     
        compCTX.clearRect( 0, 0, compCanvas.width, compCanvas.height);

        //Decompile all sprites in px.js
        DecomSpr(px[iInc]);

        //Convert Canvas to Image Data
        CvstoImData(iInc);
        
        load.text = " Preloading sprite data... sprite " + (iInc+1) + " of " + px.length;
        
        //output.innerText = "Sprites processed: " + iInc;
    }

    iInc++;

}

//Decompiles sprite data (HEX compress)
function DecomSpr(data) {

    //console.log("Decompiling sprite data: [" + data + "]");
    sD = data.split(",");

    //get dimensions 
    w = sD[0]; h = sD[1];
    //console.log("Sprite width: " + w + ", height: " + h);

    bin = [];
    binaryData = [];
    br = '';
    //convert each hex element into binary
    for(var i=2; i< sD.length; i++) {
        hex = hexToBinary(sD[i]);
        bin[bin.length] = hex;
        //console.log("Hex to Binary: " + hex);
    }

    //convert each binary number into binaryData
    for(var j=0; j < bin.length; j++) { //loop all binary strings
        for(var k=0; k<bin[j].length; k++) { //loop binary string
            br += bin[j].charAt(k);
            //slice n dice
            if(br.length == w) {
                //console.log("Binary section added to binaryData: " + br);
                binaryData.push(br);
                br = '' //reset
            }
        }
    }
    
    //set colour from registers, altho this could likely be done later on somehow
    //for now just return black colour
    var color = SelectColor(0);
    
    //console.log("Hex to binary conversion complete, drawing to canvas...");

    //reset canvas and draw
    //* by some kind of size if needed? just to visualize
    compCanvas.width = w * scale; 
    compCanvas.height = h * scale;

    consCanvas.width = 640 - 18 - compCanvas.width;
    //consCanvas.height = compCanvas.height + 8;

    DrawToCvs(binaryData, color);
}

//Draws decompiled sprite to canvas - to be saved as image
function DrawToCvs(binaryData, color) {
    //colour from register
    if(color) {
        compCTX.fillStyle = color;
        //console.log("Custom fill style: " + color);
    } else { //default to white
        compCTX.fillStyle = cR[0];
    }

    currX = 0;
    //loop through all pixel row strings
    //needed = [1,0,1][1,1,1]... (previous setup)
    for (var i = 0; i < binaryData.length; i++) { //each row element
        pixels = binaryData[i]; //
        currY = 0;
        //console.log("pixels: " + pixels);
        for (var y = 0; y < pixels.length; y++) {
            row = pixels[y];
            //console.log("Drawing row: " + row);
            for (var x = 0; x < row.length; x++) {
                if (row[x]==1) {
                    //console.log("Drawing row[x]: " + row[x]);
                    compCTX.fillRect(currY + y * scale, currX, scale, scale);
                }
            }
        }
        currY += scale;
        currX += scale;
    }
    //console.log('Rendered sprite ' + iInc + ', at ' +  scale + 'x scale');
}

//Todo - replace with register list of colours (import or presetup)
//Used for quick and easy colour switching for certain images
function SelectColor(num) {
    return (
     num == 0 ? ('#FFFFFFFF') //isogrid outline
    :num == 1 ? ('#FFFFFF99') //isogrid fill
    :num == 2 ? ('#0088FF') //isogrid fill
    :num == 3 ? ('#880000') //isogrid fill
    // etc... all colour registers
    : null
    );
}

//First step in converting renderImage canvas to image data/compressed
function CvstoImData(i) {
    imageData = compCTX.getImageData(0, 0, compCanvas.width, compCanvas.height);
    // Convert canvas to Blob, then Blob to ArrayBuffer.
    compCanvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            //Set array buffer
            const arrayBuffer = reader.result;
            //Blob content -> Image & URL
                const blob = new Blob([arrayBuffer], {type: mimeType});        
                blobArr[i] = blob;

                //find out when processing is done
                if(blobArr.length == px.length) {
                    
                    GenerateSpriteArray(); //move this to preload
                    initProcessing = true;
                    clearInterval(prepInterval);
                    isProc = true;
                    
                    timer = 0.25;
                    sceneChange = 1;
                }

        });
        reader.readAsArrayBuffer(blob);
    }, mimeType);
}

function GenerateSpriteArray() {
    for(var i=0; i< blobArr.length; i++) {
        const Im = new Image();
        //kicking up issues
        Im.src = URL.createObjectURL(blobArr[i]);
        //split data array again //use a dict here perhaps (in future) 
        var sD = px[i].split(",");

        //handle dimensional values
        Im.width = parseInt(sD[0]) * scale;
        Im.height = parseInt(sD[1]) * scale;
        
        //push to final sprite array
        sprArr.push(Im);

    }

    //when complete
    initProcessing = true;
    clearInterval(prepInterval);
    timer = 0.25;
    sceneChange = 1;

}


/////////////////////////////////////////////////////
//Utility Functions
/////////////////////////////////////////////////////

function componentToHex(comp) {
    var hex = (parseInt(comp).toString(16)).toUpperCase();
    console.log("decimal " + comp + ", to hex: " + hex);
    //return hex.length == 1 ? "0" + hex : hex;
    return hex;
}

function rgbToHex(rgb) {
    var a = rgb.split(",");
    
    var b = a.map(function(x){                      //For each array element
        x = parseInt(x).toString(16);      //Convert to a base16 string
        return (x.length==1) ? "0"+x : x; //Add zero if we get only one character
    });
    //b = "0x"+b.join("");
    b = "#"+b.join("");
        
    return b;
}

function hexToBinary(hex) {
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}

//Random gen
function Rand(min, max) {
    return Math.random() * (max - min) + min;
}