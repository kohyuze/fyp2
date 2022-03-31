import React from 'react';
import * as dfd from 'danfojs';
import * as EShellThermalCalc from '../EShellCalc';
import * as FShellThermalCalc from '../FShellCalc';
import * as GShellThermalCalc from '../GShellCalc';
import * as HShellThermalCalc from '../HShellCalc';
import * as JShellThermalCalc from '../JShellCalc';


class SizingResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tubeHEcoeff: 0,
            shellHEcoeff: 0,
            overallHEcoeff: 0,
            // iteration: 0,
            shellMeanT: this.props.data.shellIT, //first iteration's values are fetched using input temp, at Tab1Form
            newShellMeanT: 0,
            tubeMeanT: this.props.data.tubeIT,   //further iterations, this value will be updated with the mean.
            newTubeMeanT: 0,
            HEeffectiveness: 0,
            shellOT: 0,
            tubeOT: 0,
            tubePressureDrop: 0,
            shellPressureDrop: 0,
        }
    }

    calculate() {
        let {
            shell,
            shellFluid,
            tubeFluid,
            tubeMaterial,
            // constants for shell
            shellIT,
            shellOT,
            shellOTreq,
            // Constant for tube
            tubeIT,
            tubeOTreq,
            // Constant for Constraints and physical Dimensions
            tubeInnerD,
            numberTube,
            clearance,
            tubeLength,
            iteration
        } = this.props.data;

        const {
            handleSubmit,
            updateTubeProperties,
            updateShellProperties
        } = this.props;



        console.log("Iteration " + iteration)
        // this.setState({ iteration: iteration + 1 })
        handleSubmit({ iteration: iteration + 1 })

        //need to update the tube materials conductivity
        switch (tubeMaterial) {
            case "Admiralty (70% Cu, 30% Ni)":
                handleSubmit({ tubeMaterialThermalConductivity: 111 })
                break
            case "Admiralty":
                handleSubmit({ tubeMaterialThermalConductivity: 111 })
                break
            case "Stainless Steel":
                handleSubmit({ tubeMaterialThermalConductivity: 25 })
                break
            case "Mild Steel":
                handleSubmit({ tubeMaterialThermalConductivity: 50 })
                break
            case "Copper":
                handleSubmit({ tubeMaterialThermalConductivity: 386 })
                break
            case "Nickle":
                handleSubmit({ tubeMaterialThermalConductivity: 92 })
                break
            case "Aluminium":
                handleSubmit({ tubeMaterialThermalConductivity: 239 })
                break
            case "Borosilicate Glass":
                handleSubmit({ tubeMaterialThermalConductivity: 1.15 })
                break
            case "Zinc":
                handleSubmit({ tubeMaterialThermalConductivity: 113 })
                break
            case "Titanium Alloy":
                handleSubmit({ tubeMaterialThermalConductivity: 7.5 })
                break
            default: //Admiralty
                handleSubmit({ tubeMaterialThermalConductivity: 111 })
                break
        }

        //procedure for sizing: we need to determine the length of the HX needed to meet the HT load. 
        //we assume one small value for the length first, then we do the rating exercise. Increase the value and repeat until HT load is met.

        let o;

        //min tubeLength need to be 2x clearance. We'll set the min here to be 3xClearance and start iterating from here
        if (tubeLength == 0) {
            tubeLength = 3 * clearance
        }

        // diff HT area needs different increment steps, if the HT area is very small, then the program will hang if we
        // increment by 0.1. So we need a way to scale the increment size by the HT area.
        // the smaller the HTarea, the larger the increment
        const HTarea = Math.PI * tubeInnerD * numberTube //per unit length.
        // to get inverse relationship, we need 1/HTarea
        let increment = 1 / HTarea
        // console.log("increment", increment)


        // we know the output temperature, so we can set the fluid properties and no need to iterate.
        const shellMeanTemp = (shellIT + shellOTreq) / 2
        const tubeMeanTemp = (tubeIT + tubeOTreq) / 2
        if (iteration < 2) {
            updateShellProperties(shellMeanTemp, shellFluid)
            updateTubeProperties(tubeMeanTemp, tubeFluid)
        }

        let newTubeLength
        switch (shell) {
            case 'E':
                o = EShellThermalCalc.EShellThermalCalculation(this.props.data, this.state, tubeLength)
                this.setState(o)

                if (shellIT > tubeIT) { //shell fluid hot
                    //this first "if" reduces the number of loops by jumping bigger
                    if (o.shellOT > shellOTreq + 1 && o.tubeOT < tubeOTreq - 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                } else { // tube fluid hot
                    if (o.shellOT < shellOTreq - 1 && o.tubeOT > tubeOTreq + 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT < shellOTreq && o.tubeOT > tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                }
                break;

            case 'F':
                o = FShellThermalCalc.FShellThermalCalculation(this.props.data, this.state, tubeLength)
                this.setState(o)

                if (shellIT > tubeIT) { //shell fluid hot
                    if (o.shellOT > shellOTreq + 1 && o.tubeOT < tubeOTreq - 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                } else { // tube fluid hot
                    if (o.shellOT < shellOTreq - 1 && o.tubeOT > tubeOTreq + 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT < shellOTreq && o.tubeOT > tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                }
                break;

            case 'G':
                o = GShellThermalCalc.GShellThermalCalculation(this.props.data, this.state, tubeLength)
                this.setState(o)

                if (shellIT > tubeIT) { //shell fluid hot
                    if (o.shellOT > shellOTreq + 1 && o.tubeOT < tubeOTreq - 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                } else { // tube fluid hot
                    if (o.shellOT < shellOTreq - 1 && o.tubeOT > tubeOTreq + 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT < shellOTreq && o.tubeOT > tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                }
                break;
            case 'H':
                o = HShellThermalCalc.HShellThermalCalculation(this.props.data, this.state, tubeLength)
                this.setState(o)

                if (shellIT > tubeIT) { //shell fluid hot
                    if (o.shellOT > shellOTreq + 1 && o.tubeOT < tubeOTreq - 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                } else { // tube fluid hot
                    if (o.shellOT < shellOTreq - 1 && o.tubeOT > tubeOTreq + 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT < shellOTreq && o.tubeOT > tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                }
                break;
            case 'J':
                o = JShellThermalCalc.JShellThermalCalculation(this.props.data, this.state, tubeLength)
                this.setState(o)

                if (shellIT > tubeIT) { //shell fluid hot
                    if (o.shellOT > shellOTreq + 1 && o.tubeOT < tubeOTreq - 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                } else { // tube fluid hot
                    if (o.shellOT < shellOTreq - 1 && o.tubeOT > tubeOTreq + 1 && iteration > 3 && iteration < 50) { 
                        newTubeLength = tubeLength + 5 * increment      
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    else if (o.shellOT < shellOTreq && o.tubeOT > tubeOTreq && iteration > 3 && iteration < 50) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                        newTubeLength = tubeLength + increment
                        handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                    }
                    // Updates the Kc and Ke values for tube P drop calculation
                    if (iteration < 3) {
                        updateTubeProperties(tubeMeanTemp, tubeFluid, o.tubeRe, o.sigma)
                    }
                }
                break;
            default: 
                console.log("Invalid Shell type")
                break
        }

        //sometimes the program just stops before it's done, so this will force it to continue
        if (iteration < 3) {
            console.log("FORCED LOOP")
            updateTubeProperties(o.newTubeMeanT, tubeFluid, o.tubeRe, o.sigma)
        }

        this.setState({ tubeLength: tubeLength.toFixed(2) })
        console.log("FINAL TUBE LENGTH", tubeLength)



    }

    componentDidMount() {
        this.props.updateShellProperties(65.6, 'Engine Oil')
        this.props.updateTubeProperties(32.2, 'Water')
        this.calculate()
    }



    // This function reloads the whole page and redo all the calculations whenever an input is changed and recalculate is set to 1. 
    // When we update the new meanTemp this function also redo the calculations all over again
    // which is why we don't have to write a loop function above
    componentDidUpdate(prevProps, prevState) {
        if (this.props.data.recalculate) {
            this.props.handleSubmit({ recalculate: 0 });
            // console.log('recalculating..')
            this.calculate()
        }
    }

    render() {
        const {
            handlePageChange
        } = this.props;
        let {
            shellOTreq,
            tubeOTreq,
        } = this.props.data;
        return (
            <div>
                <button className="previous" onClick={() => handlePageChange({ currentPage: 'inputCheck' })}>&laquo; Back to Inputs</button>
                <h1>Results</h1>
                <div className='input-Container'>
                    <div><p>Tube-side heat transfer coefficient:</p> <h5>{this.state.tubeHEcoeff}W/m²·K</h5></div>
                    <div><p>Shell-side heat transfer coefficient:</p> <h5>{this.state.shellHEcoeff}W/m²·K</h5></div>
                    <div><p>Overall heat transfer coefficient:</p> <h5>{this.state.overallHEcoeff}W/m²·K</h5></div>
                    <div><p></p> <h5></h5></div>
                    <div><p>Target Shell output temperature:</p> <h5>{shellOTreq}°C</h5></div>
                    <div><p>Final Shell output temperature:</p> <h5>{this.state.shellOT}°C</h5></div>
                    <div><p>Target Tube output temperature:</p> <h5>{tubeOTreq}°C</h5></div>
                    <div><p>Final Tube output temperature:</p> <h5>{this.state.tubeOT}°C</h5></div>
                    <div><p>Heat Transfer Rate</p> <h5>{(this.state.Q/1000).toFixed(2)}kW</h5></div>
                    <div><p></p> <h5></h5></div>
                    <div><p>Shell pressure drop:</p> <h5>{(this.state.shellPressureDrop/1000).toFixed(2)}kPa</h5></div>
                    <div><p>Tube pressure drop:</p> <h5>{(this.state.tubePressureDrop/1000).toFixed(2)}kPa</h5></div>
                    <div><p></p> <h5></h5></div>
                    <div><p>Minimum tube length:</p> <h5>{this.state.tubeLength}m</h5></div>
                </div>
            </div>
        );
    }
}

export default SizingResult;