import { useEffect, useRef } from "react";

import E from '../Resources/E.png'
import F from '../Resources/F.png'
import U from '../Resources/U.png'
import A_1 from '../Resources/A_1.png'
import A_2 from '../Resources/A_2.png'
import B_1 from '../Resources/B_1.png'
import B_2 from '../Resources/B_2.png'
import L_1 from '../Resources/L_1.png'
import L_0 from '../Resources/L_0.png'
import M_1 from '../Resources/M_1.png'
import M_0 from '../Resources/M_0.png'

const Tab1 = () => {

    const headSelected = A_1;
    const shellSelected = F;
    const rearSelected = M_1;

    useEffect(() => {
        prepareCanvas();
    }, []);
    //it reloads every time currentTab is changed
    //empty array here means useEffect only runs once on Mount. 

    const canvasRef = useRef(null);
    // const contextRef = useRef(null);


    const prepareCanvas = () => {
        const head = document.querySelector(".head")
        const shell = document.querySelector(".shell")
        const rear = document.querySelector(".rear")
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

        c.drawImage(head, w / 2 - shellWidth / 2 - headrearWidth, h / 2 - imgHeight / 2.15, headrearWidth, 0.9*imgHeight)
        c.drawImage(shell, w / 2 - shellWidth / 2, h / 2 - imgHeight / 2, shellWidth, imgHeight)
        c.drawImage(rear, w / 2 + shellWidth / 2, h / 2 - imgHeight / 2.15, headrearWidth, 0.9*imgHeight)

        //values are tweaked till they're in place, theres no logic to it
        c.fillStyle = 'red';
        c.fillRect(w/1.78 - shellWidth/2, h/2-imgHeight/4.2 , 0.815*shellWidth, h/3.33)

        //this loop draws the tubes
        c.fillStyle = "lightblue";
        for (let i=0; i<10; i++) {
            c.fillRect(w/1.85 - 0.468*shellWidth, h/2-imgHeight/4.5 + 0.03*i*h , 0.815*shellWidth, 0.008*h)
        }
        // //the head and rear
        // c.fillRect(0.033*w, 0.33*h , 0.133*w , 0.34*h)
        // c.fillRect(0.833*w, 0.333*h , 0.133*w , 0.34*h)
        // c.fillRect(0.089*w, 0.18*h , 0.022*w , 0.34*h)
        // c.fillRect(0.89*w, 0.6*h , 0.022*w , 0.223*h)
    };

    return (
        <div id='Tab1'>
            <canvas ref={canvasRef} />
            <img src={headSelected} alt="head" className='head' />
            <img src={shellSelected} alt="Shell" className='shell' />
            <img src={rearSelected} alt="Rear" className='rear' />
        </div>
    );
}

export default Tab1;