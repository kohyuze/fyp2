import { useEffect, useRef } from "react";
import E from '../Resources/E.png'
//import F from '../Resources/F.png'
//import U from '../Resources/U.png'
import A_1 from '../Resources/A_1.png'
import A_2 from '../Resources/A_2.png'
import B_1 from '../Resources/B_1.png'
import B_2 from '../Resources/B_2.png'
import L_1 from '../Resources/L_1.png'
import L_0 from '../Resources/L_0.png'
import M_1 from '../Resources/M_1.png'
import M_0 from '../Resources/M_0.png'

const Tab1 = (props) => {

    const {
        //TEMA configs
        head,
        shell,
        rear,
        tubeLength,
        shellInnerDiameter,
        baffleCutPercent,
        centralBaffleSpacing,
        clearance,
        numberPasses
    } = props.data;

    let headSelected;
    let shellSelected;
    let rearSelected;

    switch (head) {
        case 'A_1':
            headSelected = A_1;
            break;
        case 'A_2':
            headSelected = A_2;
            break;
        case 'B_1':
            headSelected = B_1;
            break;
        case 'B_2':
            headSelected = B_2;
            break;
    }

    //We'll load plain E shell without nozzles. We'll draw the nozzles in later to show different shell types
    shellSelected = shell;

    switch (rear) {
        case 'L_1':
            rearSelected = L_1;
            break;
        case 'L_0':
            rearSelected = L_0;
            break;
        case 'M_1':
            rearSelected = M_1;
            break;
        case 'M_0':
            rearSelected = M_0;
            break;
    }

    useEffect(() => {
        prepareCanvas();
    });
    //it reloads every time currentTab is changed
    //empty array here means useEffect only runs once on Mount. 

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const prepareCanvas = () => {
        const head = new Image();
        head.src = headSelected;
        const shell = new Image();
        shell.src = E;
        const rear = new Image();
        rear.src = rearSelected;

        const canvas = canvasRef.current
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const w = canvas.width
        const h = canvas.height

        //adjust these values for the size of the images
        const shellWidth = w / 1.5
        const headrearWidth = w / 6
        const imgHeight = h / 1.5



        const c = canvas.getContext("2d")

        //onload ensures images are loaded for the page, which was a recurring problem. The images would frequently not load when the website
        //is opened initially, and would only appear when we click reload.
        head.onload = function () {
            var topLeftX = w / 2 - shellWidth / 2 - headrearWidth
            var topLeftY = h / 2 - imgHeight / 2.15
            var partitionThickness = 0.02 * h //arbitrary as fuck
            c.drawImage(head, topLeftX, topLeftY, headrearWidth, 0.9 * imgHeight);

            // if (numberPasses == 2) {
            if (true) {
                var imgData = c.getImageData(topLeftX, topLeftY + 0.45 * imgHeight - 0.5 * partitionThickness, shellWidth, partitionThickness);
                var i;
                for (i = 0; i < imgData.data.length; i += 4) {
                    if ( //this picks out the blue colors in the image, which is the area we want to draw in for the baffles and partitions
                        imgData.data[i] > 150 && imgData.data[i] < 200 &&
                        imgData.data[i + 1] > 200 && imgData.data[i + 1] < 250 &&
                        imgData.data[i + 2] > 200 && imgData.data[i + 2] < 250 &&
                        imgData.data[i + 3] == 255
                    ) {
                        //this is the color of the wall in the images
                        imgData.data[i] = 146
                        imgData.data[i + 1] = 120
                        imgData.data[i + 2] = 134
                        imgData.data[i + 3] = 255
                    }
                }
                c.putImageData(imgData, topLeftX, topLeftY + 0.45 * imgHeight - 0.5 * partitionThickness);
            }



            // var imgData = c.getImageData(topLeftX, topLeftY, shellWidth, imgHeight);
            // var i;
            // for (i = 0; i < imgData.data.length; i += 4) {
            //     if (
            //         imgData.data[i] == 153 &&
            //         imgData.data[i + 1] == 217 &&
            //         imgData.data[i + 2] == 234 &&
            //         imgData.data[i + 3] == 255
            //     ){
            //         imgData.data[i] = 255
            //         imgData.data[i + 1] = 192
            //         imgData.data[i + 2] = 203
            //         imgData.data[i + 3] = 255
            //     }    
            // }
            // c.putImageData(imgData, topLeftX, topLeftY);
        }




        shell.onload = function () {
            var topLeftX = w / 2 - shellWidth / 2
            var topLeftY = h / 2 - imgHeight / 2
            c.drawImage(shell, topLeftX, topLeftY, shellWidth, imgHeight);

            // values are tweaked till they're in place, theres no logic to it w / 1.78 - shellWidth / 2;
            var shellTopLeftX = 0.565 * w - shellWidth / 2;
            var shellTopLeftY = h / 2 - imgHeight / 4.2;
            var shellInsideHeight = h / 3.33;
            var shellInsideWidth = 0.8 * shellWidth;
            var baffleWidth = 0.005 * shellWidth;
            var baffleHeight = (1 - baffleCutPercent/100) * (shellInsideHeight)
            var noOfBaffles = (tubeLength - 2 * clearance) / centralBaffleSpacing
            var baffleClearance = (clearance / tubeLength) * shellInsideWidth //at the two ends
            var baffleSpacing = (centralBaffleSpacing / tubeLength) * shellInsideWidth //central baffle spacing

            // var imgData = c.getImageData(topLeftX, topLeftY, shellWidth, imgHeight);
            // var i;
            // for (i = 0; i < imgData.data.length; i += 4) {
            //     if (
            //         imgData.data[i] == 153 &&
            //         imgData.data[i + 1] == 217 &&
            //         imgData.data[i + 2] == 234 &&
            //         imgData.data[i + 3] == 255
            //     ){
            //         imgData.data[i] = 255
            //         imgData.data[i + 1] = 192
            //         imgData.data[i + 2] = 203
            //         imgData.data[i + 3] = 255
            //     }    
            // }
            // c.putImageData(imgData, topLeftX, topLeftY);

            //this is just to help me see the space we're working with, comment out when unneeded.
            // c.fillStyle = 'red';
            // c.fillRect(shellTopLeftX, shellTopLeftY, shellInsideWidth, shellInsideHeight)

            c.fillStyle = 'black';
            var nozzleWidth = shellInsideWidth * 0.10
            var nozzleWidthThickness = 0.035 * shellInsideHeight
            var nozzleHeight = 0.6 * shellInsideHeight
            var nozzleHeightThickness = 0.005 * shellWidth

            switch (shellSelected) {
                case 'E':
                    var inputNozzleX = shellTopLeftX + 0.5 * baffleClearance;
                    var inputNozzleY = shellTopLeftY - nozzleHeight;
                    var outputNozzleX = shellTopLeftX + shellInsideWidth - 0.5 * baffleClearance;
                    var outputNozzleY = shellTopLeftY + shellInsideHeight;

                    //Draw the shell input nozzle
                    c.fillRect(inputNozzleX, inputNozzleY, nozzleHeightThickness, nozzleHeight)
                    c.fillRect(inputNozzleX - 0.5 * nozzleWidth, inputNozzleY, nozzleWidth, nozzleWidthThickness)
                    //Draw the shell output nozzle            
                    c.fillRect(outputNozzleX, outputNozzleY, nozzleHeightThickness, nozzleHeight)
                    c.fillRect(outputNozzleX - 0.5 * nozzleWidth, outputNozzleY + nozzleHeight, nozzleWidth, nozzleWidthThickness)

                    // draw the first and last baffle. 
                    c.fillStyle = 'black';
                    c.fillRect(shellTopLeftX + baffleClearance, shellTopLeftY, baffleWidth, baffleHeight)
                    c.fillRect(shellTopLeftX + shellInsideWidth - baffleClearance, shellTopLeftY + shellInsideHeight - baffleHeight, baffleWidth, baffleHeight)

                    //draw the remaining baffles. Split the space between equally.
                    var i = 1;
                    while (i < noOfBaffles - 1) {
                        c.fillRect(shellTopLeftX + baffleClearance + i * baffleSpacing, shellTopLeftY + shellInsideHeight - baffleHeight, baffleWidth, baffleHeight)
                        c.fillRect(shellTopLeftX + baffleClearance + (i + 1) * baffleSpacing, shellTopLeftY, baffleWidth, baffleHeight)
                        i = i + 2;
                    }
                    break;
                case 'F':
                    var inputNozzleX = shellTopLeftX + 0.5 * baffleClearance;
                    var inputNozzleY = shellTopLeftY - nozzleHeight;
                    var outputNozzleX = shellTopLeftX + 0.5 * baffleClearance;
                    var outputNozzleY = shellTopLeftY + shellInsideHeight;

                    //Draw the shell input nozzle
                    c.fillRect(inputNozzleX, inputNozzleY, nozzleHeightThickness, nozzleHeight)
                    c.fillRect(inputNozzleX - 0.5 * nozzleWidth, inputNozzleY, nozzleWidth, nozzleWidthThickness)
                    //Draw the shell output nozzle            
                    c.fillRect(outputNozzleX, outputNozzleY, nozzleHeightThickness, nozzleHeight)
                    c.fillRect(outputNozzleX - 0.5 * nozzleWidth, outputNozzleY + nozzleHeight, nozzleWidth, nozzleWidthThickness)

                    //draw longitudinal baffle
                    c.fillRect(shellTopLeftX, shellTopLeftY + 0.5 * shellInsideHeight, shellInsideWidth - baffleClearance, nozzleWidthThickness)
                    
                    // draw the first and last baffle. 
                    c.fillStyle = 'black';
                    c.fillRect(shellTopLeftX + baffleClearance, shellTopLeftY, baffleWidth, 0.5 * baffleHeight)
                    c.fillRect(shellTopLeftX + baffleClearance, shellTopLeftY + shellInsideHeight - 0.5 * baffleHeight, baffleWidth, 0.5* baffleHeight)
                    c.fillRect(shellTopLeftX + shellInsideWidth - baffleClearance, shellTopLeftY + 0.5*shellInsideHeight - 0.5*baffleHeight, baffleWidth, baffleHeight ) 

                    //draw the remaining baffles. Split the space between equally.
                    var i = 1;
                    while (i < noOfBaffles - 1) {
                        c.fillRect(shellTopLeftX + baffleClearance + i * baffleSpacing, shellTopLeftY + 0.5*shellInsideHeight - 0.5*baffleHeight, baffleWidth,  baffleHeight)
                        c.fillRect(shellTopLeftX + baffleClearance + (i + 1) * baffleSpacing, shellTopLeftY, baffleWidth, 0.5 * baffleHeight)
                        c.fillRect(shellTopLeftX + baffleClearance + (i + 1) * baffleSpacing, shellTopLeftY + shellInsideHeight - 0.5 * baffleHeight, baffleWidth, 0.5 * baffleHeight)
                        i = i + 2;
                    }
                    break;
                case 'U':
                    shellSelected = E;
                    break;
            }

            

            //this loop draws the tubes
            // c.fillStyle = "black";
            // for (let i = 0; i < 10; i++) {
            //     c.fillRect(w / 1.85 - 0.468 * shellWidth, h / 2 - imgHeight / 4.5 + 0.03 * i * h, 0.815 * shellWidth, 0.008 * h)
            // }
        }





        rear.onload = function () {
            var topLeftX = w / 2 + shellWidth / 2
            var topLeftY = h / 2 - imgHeight / 2.15
            var partitionThickness = 0.02 * h //arbitrary as fuck
            c.drawImage(rear, topLeftX, topLeftY, headrearWidth, 0.9 * imgHeight);

            var imgData = c.getImageData(topLeftX, topLeftY + 0.45 * imgHeight - 0.5 * partitionThickness, shellWidth, partitionThickness);
            var i;
            for (i = 0; i < imgData.data.length; i += 4) {
                if ( //this picks out the blue colors in the image, which is the area we want to draw in for the baffles and partitions
                    imgData.data[i] > 150 && imgData.data[i] < 200 &&
                    imgData.data[i + 1] > 200 && imgData.data[i + 1] < 250 &&
                    imgData.data[i + 2] > 200 && imgData.data[i + 2] < 250 &&
                    imgData.data[i + 3] == 255
                ) {
                    //this is the color of the wall in the images
                    imgData.data[i] = 146
                    imgData.data[i + 1] = 120
                    imgData.data[i + 2] = 134
                    imgData.data[i + 3] = 255
                }
            }
            c.putImageData(imgData, topLeftX, topLeftY + 0.45 * imgHeight - 0.5 * partitionThickness);
        }





        // const logMousePosition = e => {
        //     console.log("X-", e.clientX, "Y-", e.clientY)
        //     var imgData = c.getImageData(e.pageX, e.pageY, 1, 1);
        //     var red = imgData.data[0];
        //     var green = imgData.data[1];
        //     var blue = imgData.data[2];
        //     var alpha = imgData.data[3];
        //     console.log(red + " " + green + " " + blue + " " + alpha);
        //     imgData.data[0] = 255
        //     imgData.data[1] = 192
        //     imgData.data[2] = 203
        //     c.putImageData(imgData, e.pageX, e.pageY);

        // };

        // window.addEventListener("click", logMousePosition);


    };



    return (
        <div id='Tab1'>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default Tab1;