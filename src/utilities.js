/////////////////////////////////////////////////////
//Tools and Functions
/////////////////////////////////////////////////////

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

    // for(var i=0; i< px.length; i++) {     
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
    consCanvas.height = compCanvas.height + 8;

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
                    // initProcessing = true;
                    // clearInterval(prepInterval);
                    //isProc = true;
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