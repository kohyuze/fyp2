import React from 'react';
import * as dfd from 'danfojs';
import * as EShellThermalCalc from '../EShellCalc';
import * as FShellThermalCalc from '../FShellCalc';
import * as GShellThermalCalc from '../GShellCalc';
import * as HShellThermalCalc from '../HShellCalc';
import * as JShellThermalCalc from '../JShellCalc';


class RatingResult extends React.Component {
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
        const {
            shell,
            shellFluid,
            tubeFluid,
            tubeMaterial,
            Kc,
            Ke,
            // constants for shell
            shellIT,
            shellOT,
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

        let o;
        switch (shell) {
            case 'E':
                o = EShellThermalCalc.EShellThermalCalculation(this.props.data, this.state)
                this.setState(o)

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
                o = FShellThermalCalc.FShellThermalCalculation(this.props.data, this.state, this.props.data.shellIT, this.props.data.tubeIT)
                this.setState(o)

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
                o = GShellThermalCalc.GShellThermalCalculation(this.props.data, this.state, this.props.data.shellIT, this.props.data.tubeIT)
                this.setState(o)

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
                o = HShellThermalCalc.HShellThermalCalculation(this.props.data, this.state, this.props.data.shellIT, this.props.data.tubeIT)
                this.setState(o)

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
                o = JShellThermalCalc.JShellThermalCalculation(this.props.data, this.state, this.props.data.shellIT, this.props.data.tubeIT)
                this.setState(o)

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


    }

    componentDidMount() {
        this.props.handleSubmit({
            shellFluid: 'engine oil',
            tubeFluid: 'water',
            shell: 'E',
            shellIT: 65.6,
            shellMFR: 36.3,
            shellFF: 0.000176,
            tubeIT: 32.2,
            tubeMFR: 18.1,
            tubeFF: 0.000088,
            
            numberTube: 102,
            tubeInnerD: 0.0166,
            tubeOuterD: 0.019,
            shellInnerDiameter: 0.336,
            // tubePitch: 0.025,    
            tubePitch: 0,             
            layoutAngle: "rotated-square",
            
            numberPasses: 2,
            tubeLength: 4.3,            
            baffleCutPercent: 25.8, //0.0867, //this value is in m, refers to the open space of the baffles
            numberBaffles: 14,
            //centralBaffleSpacing: 0.279, //not using this
            clearance: 0.318,
            recalculate: 1
            

            // tubeIT: 65.6,
            // tubeMFR: 36.3,
            // tubeFF: 0.000176,
            // shellIT: 32.2,
            // shellMFR: 18.1,  
            // shellFF: 0.000088,
            // tubeInnerD: 0.0166,
            // tubeOuterD: 0.019,
            // tubePitch: 0.025,
            // numberTube: 102,
            // numberPasses: 2,
            // tubeLength: 4.3,
            // tubeFluid: 'engine oil',
            // shellFluid: 'water',

            
        })
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
                </div>
                <button onClick={() => console.log(this.state)}>log state</button>
            </div>
        );
    }
}

export default RatingResult;