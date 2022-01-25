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
            iteration: 0,
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
            Kc,
            Ke,
            tubeMaterial,
            // constants for shell
            shellIT,
            shellOT,
            shellOTreq,
            shellMFR,
            shellSHC,
            shellDV,
            shellKV,
            shellTC,
            shellD,
            shellFF,
            // Constant for tube
            tubeIT,
            tubeOT,
            tubeOTreq,
            tubeMFR,
            tubeSHC,
            tubeDV,
            tubeKV,
            tubeTC,
            tubeD,
            tubeFF,
            // Constant for Constraints and physical Dimensions
            tubeInnerD,
            tubeOuterD,
            tubePitch,
            numberTube,
            numberPasses,
            layoutAngle,
            shellInnerDiameter,
            baffleCutPercent,
            centralBaffleSpacing,
            clearance,
            shellSideFluidDynamicViscocity,
            tubeMaterialThermalConductivity,
            tubeLength,
        } = this.props.data;

        const {
            handleSubmit,
            handlePageChange,
            updateTubeProperties,
            updateShellProperties
        } = this.props;

        

        console.log("Iteration " + this.state.iteration)
        this.setState({ iteration: this.state.iteration + 1 })

        //need to update the tube materials conductivity
        switch (tubeMaterial) {
            case "Admiralty (70% Cu, 30% Ni)":
                handleSubmit({tubeMaterialThermalConductivity: 111})
                break
            case "Stainless Steel":
                handleSubmit({tubeMaterialThermalConductivity: 25})
                break
            case "Mild Steel":
                handleSubmit({tubeMaterialThermalConductivity: 50})
                break
            case "Copper":
                handleSubmit({tubeMaterialThermalConductivity: 386})
                break
            case "Nickle":
                handleSubmit({tubeMaterialThermalConductivity: 92})
                break
            case "Aluminium":
                handleSubmit({tubeMaterialThermalConductivity: 239})
                break
            case "Borosilicate Glass":
                handleSubmit({tubeMaterialThermalConductivity: 1.15})
                break
            case "Zinc":
                handleSubmit({tubeMaterialThermalConductivity: 113})
                break
            case "Titanium Alloy":
                handleSubmit({tubeMaterialThermalConductivity: 7.5})
                break
            default: //Admiralty
                handleSubmit({tubeMaterialThermalConductivity: 111})
                break
        }

        //procedure for sizing: we need to determine the length of the HX needed to meet the HT load. 
        //we assume one small value for the length first, then we do the rating exercise. Increase the value and repeat until HT load is met.

        let o;

        //min tubeLength need to be 2x clearance. We'll set the min here to be 3xClearance and start iterating from here
        if (tubeLength == 0){
            tubeLength = 0.1
        }

        // diff tube number needs different increment steps 
        let increment
        if (numberTube < 5){increment = 100}
        else if (numberTube < 10){increment = 10}
        else if (numberTube < 20){increment = 0.6}
        else if (numberTube < 40){increment = 0.3}
        else if (numberTube < 80 ){increment = 0.2}
        else if (numberTube >= 80) {increment = 0.1}


        let newTubeLength
        switch (shell) {
            case 'E':
                o = EShellThermalCalc.EShellThermalCalculation(this.props.data, this.state, tubeLength)
                this.setState(o)

                //this first "if" reduces the number of loops by jumping bigger
                if (Math.abs(o.shellOT - shellOTreq) > 1 && Math.abs(o.tubeOT - tubeOTreq) > 1 && this.state.iteration > 2) { 
                    newTubeLength = tubeLength + 5*increment      
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }
                else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && this.state.iteration > 2) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                    newTubeLength = tubeLength + increment
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }


                // Checks if iteration is needed. Updates fluid properties with new mean temps and iterates.
                if (Math.abs(o.newShellMeanT - o.shellMeanT) >= 1) {
                    this.setState({ shellMeanT: o.newShellMeanT })
                    updateShellProperties(o.newShellMeanT, shellFluid) //dun use the newly updated state, cos sometimes the 
                    //state may update slowly and this function will run with the old value  
                }
                if (Math.abs(o.newTubeMeanT - o.tubeMeanT) >= 1) {
                    this.setState({ tubeMeanT: o.newTubeMeanT })
                    updateTubeProperties(o.newTubeMeanT, tubeFluid, o.tubeRe, o.sigma)
                }
                break;

            case 'F':
                o = FShellThermalCalc.FShellThermalCalculation(this.props.data, this.state, this.props.data.shellIT, this.props.data.tubeIT, tubeLength)
                this.setState(o)

                //this first "if" reduces the number of loops cos every loop is +0.5
                if ( (Math.abs(o.shellOT - shellOTreq) > 1 || Math.abs(o.tubeOT - tubeOTreq) > 1 ) && this.state.iteration > 2) { 
                    newTubeLength = tubeLength + 0.5
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }
                else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && this.state.iteration > 2) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                    newTubeLength = tubeLength + 0.1
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }
                if (Math.abs(o.newShellMeanT - o.shellMeanT) >= 1) {
                    this.setState({ shellMeanT: o.newShellMeanT })
                    updateShellProperties(o.newShellMeanT, shellFluid)
                }
                if (Math.abs(o.newTubeMeanT - o.tubeMeanT) >= 1) {
                    this.setState({ tubeMeanT: o.newTubeMeanT })
                    updateTubeProperties(o.newTubeMeanT, tubeFluid, o.tubeRe, o.sigma)
                } 
                break;

            case 'G':
                o = GShellThermalCalc.GShellThermalCalculation(this.props.data, this.state, this.props.data.shellIT, this.props.data.tubeIT, tubeLength)
                this.setState(o)

                //this first "if" reduces the number of loops cos every loop is +0.5
                if (Math.abs(o.shellOT - shellOTreq) > 1 && Math.abs(o.tubeOT - tubeOTreq) > 1 && this.state.iteration > 2) { 
                    newTubeLength = tubeLength + 0.5
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }
                else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && this.state.iteration > 2) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                    newTubeLength = tubeLength + 0.1
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }
                if (Math.abs(o.newShellMeanT - o.shellMeanT) >= 1) {
                    this.setState({ shellMeanT: o.newShellMeanT })
                    updateShellProperties(o.newShellMeanT, shellFluid)
                }
                if (Math.abs(o.newTubeMeanT - o.tubeMeanT) >= 1) {
                    this.setState({ tubeMeanT: o.newTubeMeanT })
                    updateTubeProperties(o.newTubeMeanT, tubeFluid, o.tubeRe, o.sigma)
                }
                break;
            case 'H':
                o = HShellThermalCalc.HShellThermalCalculation(this.props.data, this.state, this.props.data.shellIT, this.props.data.tubeIT, tubeLength)
                this.setState(o)

                //this first "if" reduces the number of loops cos every loop is +0.5
                if (Math.abs(o.shellOT - shellOTreq) > 1 && Math.abs(o.tubeOT - tubeOTreq) > 1 && this.state.iteration > 2) { 
                    newTubeLength = tubeLength + 0.5
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }
                else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && this.state.iteration > 2) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                    newTubeLength = tubeLength + 0.1
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }
                if (Math.abs(o.newShellMeanT - o.shellMeanT) >= 1) {
                    this.setState({ shellMeanT: o.newShellMeanT })
                    updateShellProperties(o.newShellMeanT, shellFluid)
                }
                if (Math.abs(o.newTubeMeanT - o.tubeMeanT) >= 1) {
                    this.setState({ tubeMeanT: o.newTubeMeanT })
                    updateTubeProperties(o.newTubeMeanT, tubeFluid, o.tubeRe, o.sigma)
                }
                break;
            case 'J':
                o = JShellThermalCalc.JShellThermalCalculation(this.props.data, this.state, this.props.data.shellIT, this.props.data.tubeIT, tubeLength)
                this.setState(o)

                //this first "if" reduces the number of loops cos every loop is +0.5
                if (Math.abs(o.shellOT - shellOTreq) > 1 && Math.abs(o.tubeOT - tubeOTreq) > 1 && this.state.iteration > 2) { 
                    newTubeLength = tubeLength + 0.5
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }
                else if (o.shellOT > shellOTreq && o.tubeOT < tubeOTreq && this.state.iteration > 2) { //iteration > 3 cos of some weird reason the first few iterations are crazy.
                    newTubeLength = tubeLength + 0.1
                    handleSubmit({ tubeLength: newTubeLength, recalculate: 1 })
                }
                if (Math.abs(o.newShellMeanT - o.shellMeanT) >= 1) {
                    this.setState({ shellMeanT: o.newShellMeanT })
                    updateShellProperties(o.newShellMeanT, shellFluid)
                }
                if (Math.abs(o.newTubeMeanT - o.tubeMeanT) >= 1) {
                    this.setState({ tubeMeanT: o.newTubeMeanT })
                    updateTubeProperties(o.newTubeMeanT, tubeFluid, o.tubeRe, o.sigma)
                }
                break;
        }

        //sometimes the program just stops before it's done, so this will force it to continue
        if (this.state.iteration < 3) {
            console.log("FORCED LOOP")
            updateTubeProperties(o.newTubeMeanT, tubeFluid, o.tubeRe, o.sigma)
        }

        // this.setState({ tubeLength: tubeLength.toFixed(2) })
        console.log("FINAL TUBE LENGTH", tubeLength)



    }

    componentDidMount() {
        // this.props.handleSubmit({

            
        // })
        this.props.updateShellProperties(65.6, 'engine oil')
        this.props.updateTubeProperties(32.2, 'water')
        this.calculate()
    }



    // This function reloads the whole page and redo all the calculations whenever an input is changed and recalculate is set to 1. 
    // When we update the new meanTemp this function also redo the calculations all over again
    // which is why we don't have to write a loop function above
    componentDidUpdate(prevProps, prevState) {
        if (this.props.data.recalculate) {
            this.props.handleSubmit({ recalculate: 0 });
            console.log('recalculating..')
            this.calculate()
        }
    }

    render() {
        const {
            handlePageChange
        } = this.props;
        return (
            <div>
                <button className="previous" onClick={() => handlePageChange({ currentPage: 'inputCheck' })}>&laquo; Back to Inputs</button>
                <h1>Results</h1>
                <div className='input-Container'>
                    <div><p>Tube-side heat transfer coefficient:</p> <h5>{this.state.tubeHEcoeff}W/m².K</h5></div>
                    <div><p>Shell-side heat transfer coefficient:</p> <h5>{this.state.shellHEcoeff}W/m².K</h5></div>
                    <div><p>Overall heat transfer coefficient:</p> <h5>{this.state.overallHEcoeff}W/m².K</h5></div>
                    <div><p></p> <h5></h5></div>
                    <div><p>Shell output temperature:</p> <h5>{this.state.shellOT}°C</h5></div>
                    <div><p>Tube output temperature:</p> <h5>{this.state.tubeOT}°C</h5></div>
                    <div><p></p> <h5></h5></div>
                    <div><p>Shell pressure drop:</p> <h5>{this.state.shellPressureDrop}Pa</h5></div>
                    <div><p>Tube pressure drop:</p> <h5>{this.state.tubePressureDrop}Pa</h5></div>
                    <div><p></p> <h5></h5></div>
                    <div><p>Minimum tube length:</p> <h5>{this.state.tubeLength}m</h5></div>
                </div>
                {/* <button onClick={() => console.log(this.state)}>log state</button> */}
            </div>
        );
    }
}

export default SizingResult;