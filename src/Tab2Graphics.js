import { useEffect, useRef } from "react";


//write program to check if all numbers of tubes can be drawn and fit into circle properly
const Tab2 = (props) => {
    const {
        // Constant for Constraints and physical Dimensions
        tubeInnerD,
        tubeOuterD,
        tubePitch,
        numberTube,
        layoutAngle,//square, triangular, rotated square

        shellInnerDiameter,
        shell,
    } = props.data;

    const tubeDiameter = tubeInnerD //we just use the tube inner D for drawing
    const shellDiameter = shellInnerDiameter

    const canvasRef = useRef(null);

    useEffect(() => {
        prepareCanvas();
    });

    //where the naming has "img" in it, it refers to the size in the drawing. Else it refers to the actual HX size.

    const prepareCanvas = () => {

        const canvas = canvasRef.current
        const shellImgDiameter = canvas.height / 1.1
        const c = canvas.getContext("2d")


        const tubeImgDiameter = (tubeDiameter / shellDiameter) * shellImgDiameter

        //user will enter tubePitch = 0 if they want to auto calculate.
        const findingTubePitch = (shellImgDiameter, numberTube, tubeImgDiameter, layoutAngle, tubePitch) => { //horizontal distance between two tubes
            if (tubePitch != 0 ){
                const imgTubePitch = tubePitch * shellImgDiameter / shellDiameter
                return (imgTubePitch)
            } else if (layoutAngle === "triangular") {
                //recalculate imgTubePitch since triangular layout is more compact
                // sin60 = 0.866
                const shellImgArea = Math.PI * (shellImgDiameter ** 2) / 4 - tubeImgDiameter;
                const tubeImgArea = shellImgArea / (numberTube / 0.35714) //each triangle has 0.35714 tubes
                const imgTubePitch = (4 * tubeImgArea / 0.866) ** 0.5
                return (imgTubePitch)
            }
            else {
                //each tube occupy a square space, how much space can each square have?
                //method inspired by the die in wafer problem, see https://math.stackexchange.com/questions/3007527/how-many-squares-fit-in-a-circle
                const shellImgArea = Math.PI * (shellImgDiameter ** 2) / 4;
                const B = (Math.PI * shellImgDiameter) / (Math.sqrt(2) * numberTube);
                const C = ((-1) * shellImgArea) / (numberTube)
                const imgTubePitch = (-B + (B ** 2 - 4 * C) ** 0.5) / 2
                return (imgTubePitch)
            }
        }

        let imgTubePitch = findingTubePitch(shellImgDiameter, numberTube, layoutAngle)

        //express the diameter in terms of tube
        const tubeStayWithinDiameter = shellImgDiameter - imgTubePitch
        const numTubeInCenterRow = tubeStayWithinDiameter / imgTubePitch * 1.07 //give it abit of margin
        imgTubePitch = (tubeStayWithinDiameter / Math.floor(numTubeInCenterRow)) //reset imgTubePitch so that the rows are evenly spread out

        const xleft = canvas.width / 2 - tubeStayWithinDiameter / 2
        const ycenter = canvas.height / 2
        const xcenter = canvas.width / 2

        //this function checks if tube is within the circle before drawing
        const CheckTubePosition = (x, y) => {
            const distFromCenter = Math.sqrt((x - xcenter) ** 2 + (y - ycenter) ** 2)
            if (distFromCenter <= tubeStayWithinDiameter / 2) { return true }
            else { return false }
        }

        let draw = true;
        // this is a loop cos sometimes we cannot fit all the tubes in, then we reduce tubepitch and try again
        while (draw) {
            //start drawing
            c.clearRect(0, 0, canvas.width, canvas.height);
            c.beginPath();
            c.arc(canvas.width / 2, canvas.height / 2, shellImgDiameter / 2, 0, 2 * Math.PI); //this draw the shell
            c.stroke();

            let tubeDrawn = 0
            let currentRow //change this to 2 to leave center row empty for longitudinal baffle, 1 to fill the center row

            if (shell == "E" || shell == "J") {
                currentRow = 1
            } else {
                currentRow = 2
                //draw longitudinal baffle
                let baffleImgHeight = 0.02 * shellImgDiameter
                c.fillRect(xcenter - 0.5 * shellImgDiameter, ycenter - 0.5 * baffleImgHeight, shellImgDiameter, baffleImgHeight)
            }



            switch (layoutAngle) {
                case 'square':
                    while (tubeDrawn < numberTube && currentRow < numberTube) {
                        if (currentRow === 1) {
                            //draw center row
                            for (let i = 0; i <= numTubeInCenterRow; i++) {
                                const x = xleft + (i * imgTubePitch)
                                const y = ycenter
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                                //console.log(tubeDrawn, i)
                            }
                            //console.log(tubeDrawn, currentRow)
                            currentRow++
                        }
                        else if (currentRow % 2 === 0) {
                            for (let i = 0; i <= numTubeInCenterRow; i++) {
                                //move up draw another row above
                                const x = xleft + (i * imgTubePitch)
                                const y = ycenter + ((currentRow / 2) * imgTubePitch)
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                            }
                            //console.log(tubeDrawn, currentRow)
                            currentRow++

                        }
                        else if (currentRow % 2 === 1) {
                            for (let i = 0; i <= numTubeInCenterRow; i++) {
                                //draw row below
                                const x = xleft + (i * imgTubePitch)
                                const y = ycenter - ((currentRow / 2 - 0.5) * imgTubePitch)
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                            }
                            //console.log(tubeDrawn, currentRow)
                            currentRow++

                        }
                    }
                    break;
                case 'rotated-square':
                    while (tubeDrawn < numberTube && currentRow < numberTube) {
                        if (currentRow === 1) {
                            //draw center row
                            for (let i = 0; i <= numTubeInCenterRow; i++) {
                                const x = xleft + (i * Math.sqrt(2) * imgTubePitch)
                                const y = ycenter
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                                //console.log(tubeDrawn, i)
                            }
                            //console.log(tubeDrawn, currentRow)
                            currentRow++
                        }
                        else if (currentRow % 2 === 0) { //these will be the offset rows, every alternate row is offset
                            for (let i = 0; i <= numTubeInCenterRow; i++) {
                                //move up draw another row above
                                let x = xleft + (i * Math.sqrt(2) * imgTubePitch) + imgTubePitch / Math.sqrt(2)
                                let y = ycenter - ((currentRow) * imgTubePitch / Math.sqrt(2)) + imgTubePitch / Math.sqrt(2)
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                                //draw one below
                                x = xleft + (i * Math.sqrt(2) * imgTubePitch) + imgTubePitch / Math.sqrt(2)
                                y = ycenter + ((currentRow) * imgTubePitch / Math.sqrt(2)) - imgTubePitch / Math.sqrt(2)
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                            }
                            //console.log(tubeDrawn, currentRow)
                            currentRow++

                        }
                        else if (currentRow % 2 === 1) {
                            for (let i = 0; i <= numTubeInCenterRow; i++) {
                                //draw row above
                                let x = xleft + (i * Math.sqrt(2) * imgTubePitch)
                                let y = ycenter - ((currentRow / 2 - 0.5) * imgTubePitch / Math.sqrt(2)) * 2
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                                //draw row below
                                x = xleft + (i * Math.sqrt(2) * imgTubePitch)
                                y = ycenter + ((currentRow / 2 - 0.5) * imgTubePitch / Math.sqrt(2)) * 2
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                            }
                            //console.log(tubeDrawn, currentRow)
                            currentRow++

                        }
                    }
                    break;
                case 'triangular':
                    // sin60 = 0.866
                    while (tubeDrawn < numberTube && currentRow < numberTube) {
                        if (currentRow === 1) {
                            //draw center row
                            for (let i = 0; i <= numTubeInCenterRow; i++) {
                                const x = xleft + (i * imgTubePitch)
                                const y = ycenter
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                                //console.log(tubeDrawn, i)
                            }
                            //console.log(tubeDrawn, currentRow)
                            currentRow++
                        }
                        else if (currentRow % 2 === 0) { //these will be the offset rows, every alternate row is offset
                            for (let i = 0; i <= numTubeInCenterRow; i++) {
                                //move up draw another row above
                                let x = xleft + (i * imgTubePitch) + imgTubePitch / 2
                                let y = ycenter - ((currentRow) * 0.866 * imgTubePitch) + 0.866 * imgTubePitch
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                                //draw one below
                                x = xleft + (i * imgTubePitch) + imgTubePitch / 2
                                y = ycenter + ((currentRow) * 0.866 * imgTubePitch) - 0.866 * imgTubePitch
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                            }
                            //console.log(tubeDrawn, currentRow)
                            currentRow++

                        }
                        else if (currentRow % 2 === 1) {
                            for (let i = 0; i <= numTubeInCenterRow; i++) {
                                //draw row above
                                let x = xleft + (i * imgTubePitch)
                                let y = ycenter - ((currentRow / 2 - 0.5) * 0.866 * imgTubePitch) * 2
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                                //draw row below
                                x = xleft + (i * imgTubePitch)
                                y = ycenter + ((currentRow / 2 - 0.5) * 0.866 * imgTubePitch) * 2
                                if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                                else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                                else if (tubeDrawn >= numberTube) { break }
                                else {
                                    c.beginPath();
                                    c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                                    c.stroke();
                                    tubeDrawn++
                                }
                            }
                            //console.log(tubeDrawn, currentRow)
                            currentRow++
                        }
                    }
                    break
            }
            
            const calculatedTubePitch = (imgTubePitch * (shellDiameter / shellImgDiameter)).toPrecision(2)
            //console.log("CALCULATED TUBEPITCH", calculatedTubePitch)

            if (currentRow >= tubeDrawn) { //means not all tubes are fit into the circle, then we reduce tubePitch to make it more cramped.
                //console.log("Tubes not fully drawn")
                imgTubePitch = imgTubePitch * 0.95
            }
            else {
                //console.log("Tubes fully drawn")
                draw = false;
                
                //tubePitch == 0 means the user wants auto calculate. 
                //tubePitch > calculatedTubePitch means the user input tubePitch cannot fit all the tubes, then we auto resize the tubePitch
                if (tubePitch == 0 || tubePitch > calculatedTubePitch){  
                    props.handleSubmit({tubePitch: calculatedTubePitch,
                                        //recalculate: 1
                                    })
                    //console.log('rewriting tube pitch!')
                }
            }
        }
    }

    return (
        <div id='Tab2'>
            <canvas ref={canvasRef} />
        </div>
    );

}
export default Tab2;