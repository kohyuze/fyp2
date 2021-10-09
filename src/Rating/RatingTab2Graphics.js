import { useEffect, useRef } from "react";


//write program to check if all numbers of tubes can be drawn and fit into circle properly
const Tab2 = () => {
    const tubeNo = 230
    const tubeDiameter = 0.03
    const shellDiameter = 1.3
    const tubeConfig = "triangular" //square, triangular, rotated square

    const canvasRef = useRef(null);

    useEffect(() => {
        prepareCanvas();
    }, []);

    const prepareCanvas = () => {
        const canvas = canvasRef.current
        const shellImgDiameter = canvas.height / 1.1
        const c = canvas.getContext("2d")
        c.beginPath();
        c.arc(canvas.width / 2, canvas.height / 2, shellImgDiameter / 2, 0, 2 * Math.PI);
        c.stroke();

        const tubeImgDiameter = (tubeDiameter / shellDiameter) * shellImgDiameter
        
        
        const findTubeImgSpacing = (shellImgDiameter, tubeNo, tubeImgDiameter, tubeConfig) => { //horizontal distance between two tubes
            if (tubeConfig === "triangular"){
                //recalculate tubeImgSpacing since triangular layout is more compact
                // sin60 = 0.866
                const shellImgArea = Math.PI * (shellImgDiameter ** 2) / 4 - tubeImgDiameter;
                const tubeImgArea = shellImgArea/(tubeNo / 0.35714 ) //each triangle has 0.35714 tubes
                const tubeImgSpacing = (4*tubeImgArea/0.866)**0.5
                return (tubeImgSpacing)
            }
            else {
                //each tube occupy a square space, how much space can each square have?
                //method inspired by the die in wafer problem, see https://math.stackexchange.com/questions/3007527/how-many-squares-fit-in-a-circle
                const shellImgArea = Math.PI * (shellImgDiameter ** 2) / 4;
                const B = (Math.PI * shellImgDiameter) / (Math.sqrt(2) * tubeNo);
                const C = ((-1) * shellImgArea) / (tubeNo)
                const tubeImgSpacing = (-B + (B ** 2 - 4 * C) ** 0.5) / 2
                return (tubeImgSpacing)
            }
        }

        let tubeImgSpacing = findTubeImgSpacing(shellImgDiameter, tubeNo, tubeConfig)
        
        //express the diameter in terms of tube
        const tubeStayWithinDiameter = shellImgDiameter - tubeImgSpacing
        const noTubeCenterRow = tubeStayWithinDiameter / tubeImgSpacing * 1.02 //give it abit of margin
        tubeImgSpacing = (tubeStayWithinDiameter / Math.floor(noTubeCenterRow))//reset tubeImgSpacing so that the rows are evenly spread out

        const xleft = canvas.width / 2 - tubeStayWithinDiameter / 2
        const ycenter = canvas.height / 2
        const xcenter = canvas.width / 2

        //this function checks if tube is within the circle before drawing
        const CheckTubePosition = (x, y) => {
            const distFromCenter = Math.sqrt((x - xcenter) ** 2 + (y - ycenter) ** 2)
            if (distFromCenter <= tubeStayWithinDiameter / 2) { return true }
            else { return false }
        }


        let tubeDrawn = 0
        let currentRow = 1 //change this to 2 to leave center row empty for baffles

        if (tubeConfig === "square") {
            while (tubeDrawn < tubeNo && currentRow < tubeNo) {
                if (currentRow === 1) {
                    //draw center row
                    for (let i = 0; i <= noTubeCenterRow; i++) {
                        const x = xleft + (i * tubeImgSpacing)
                        const y = ycenter
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                        // console.log(tubeDrawn, i)
                    }
                    console.log(tubeDrawn, currentRow)
                    currentRow++
                }
                else if (currentRow % 2 === 0) {
                    for (let i = 0; i <= noTubeCenterRow; i++) {
                        //move up draw another row above
                        const x = xleft + (i * tubeImgSpacing)
                        const y = ycenter + ((currentRow / 2) * tubeImgSpacing)
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                    }
                    console.log(tubeDrawn, currentRow)
                    currentRow++

                }
                else if (currentRow % 2 === 1) {
                    for (let i = 0; i <= noTubeCenterRow; i++) {
                        //draw row below
                        const x = xleft + (i * tubeImgSpacing)
                        const y = ycenter - ((currentRow / 2 - 0.5) * tubeImgSpacing)
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                    }
                    console.log(tubeDrawn, currentRow)
                    currentRow++

                }
            }
        }


        else if (tubeConfig === "rotated square"){
            while (tubeDrawn < tubeNo && currentRow < tubeNo) {
                if (currentRow === 1) {
                    //draw center row
                    for (let i = 0; i <= noTubeCenterRow; i++) {
                        const x = xleft + (i * Math.sqrt(2) * tubeImgSpacing)
                        const y = ycenter
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                        // console.log(tubeDrawn, i)
                    }
                    console.log(tubeDrawn, currentRow)
                    currentRow++
                }
                else if (currentRow % 2 === 0) { //these will be the offset rows, every alternate row is offset
                    for (let i = 0; i <= noTubeCenterRow; i++) {
                        //move up draw another row above
                        let x = xleft + (i * Math.sqrt(2) * tubeImgSpacing) + tubeImgSpacing/Math.sqrt(2)
                        let y = ycenter - ((currentRow ) * tubeImgSpacing/Math.sqrt(2)) + tubeImgSpacing/Math.sqrt(2)
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                        //draw one below
                        x = xleft + (i * Math.sqrt(2) * tubeImgSpacing) + tubeImgSpacing/Math.sqrt(2)
                        y = ycenter + ((currentRow ) * tubeImgSpacing/Math.sqrt(2)) - tubeImgSpacing/Math.sqrt(2)
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                    }
                    console.log(tubeDrawn, currentRow)
                    currentRow++

                }
                else if (currentRow % 2 === 1) { 
                    for (let i = 0; i <= noTubeCenterRow; i++) {
                        //draw row above
                        let x = xleft + (i * Math.sqrt(2) * tubeImgSpacing)
                        let y = ycenter - ((currentRow / 2 - 0.5) * tubeImgSpacing/Math.sqrt(2)) * 2
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                        //draw row below
                        x = xleft + (i * Math.sqrt(2) * tubeImgSpacing)
                        y = ycenter + ((currentRow / 2 - 0.5) * tubeImgSpacing/Math.sqrt(2)) * 2
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                    }
                    console.log(tubeDrawn, currentRow)
                    currentRow++

                }
            }
        }

        else if (tubeConfig === "triangular"){
            // sin60 = 0.866
            while (tubeDrawn < tubeNo && currentRow < tubeNo) {
                if (currentRow === 1) {
                    //draw center row
                    for (let i = 0; i <= noTubeCenterRow; i++) {
                        const x = xleft + (i * tubeImgSpacing)
                        const y = ycenter
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                        // console.log(tubeDrawn, i)
                    }
                    console.log(tubeDrawn, currentRow)
                    currentRow++
                }
                else if (currentRow % 2 === 0) { //these will be the offset rows, every alternate row is offset
                    for (let i = 0; i <= noTubeCenterRow; i++) {
                        //move up draw another row above
                        let x = xleft + (i * tubeImgSpacing) + tubeImgSpacing/2
                        let y = ycenter - ((currentRow ) * 0.866*tubeImgSpacing) + 0.866*tubeImgSpacing
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                        //draw one below
                        x = xleft + (i * tubeImgSpacing) + tubeImgSpacing/2
                        y = ycenter + ((currentRow ) * 0.866*tubeImgSpacing) - 0.866*tubeImgSpacing
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                    }
                    console.log(tubeDrawn, currentRow)
                    currentRow++

                }
                else if (currentRow % 2 === 1) { 
                    for (let i = 0; i <= noTubeCenterRow; i++) {
                        //draw row above
                        let x = xleft + (i * tubeImgSpacing)
                        let y = ycenter - ((currentRow / 2 - 0.5) * 0.866*tubeImgSpacing) * 2
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                        //draw row below
                        x = xleft + (i * tubeImgSpacing)
                        y = ycenter + ((currentRow / 2 - 0.5) * 0.866*tubeImgSpacing) * 2
                        if (!CheckTubePosition(x, y) && x < xcenter) { continue }
                        else if (!CheckTubePosition(x, y) && x >= xcenter) { break }
                        else if (tubeDrawn >= tubeNo) { break }
                        else {
                            c.beginPath();
                            c.arc(x, y, tubeImgDiameter / 2, 0, 2 * Math.PI);
                            c.stroke();
                            tubeDrawn++
                        }
                    }
                    console.log(tubeDrawn, currentRow)
                    currentRow++
                }
            }
        }
    }

    return (
        <div id='Tab2'>
            <canvas ref={canvasRef} />
            {/* <div className="big_circle">
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div>
                <div className="tube-row">{tubes}</div> 
                
            </div>
            <div className="shellDiameter">
                <p>Shell Diameter: {shellDiameter}m</p>
                <p>No. of tubes: {tubeNo}m</p>
            </div> */}
        </div>
    );

}
export default Tab2;