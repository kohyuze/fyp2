import React from 'react';
import * as dfd from 'danfojs';
import * as EShellThermalCalc from '../EShellThermalCalc';

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
        }
    }

    calculate() {
        const {
            shellFluid,
            tubeFluid,
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
            baffleCut,
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



        let o = EShellThermalCalc.EShellThermalCalculation(this.props.data, this.state)
        this.setState(o)

        if (Math.abs(o.newShellMeanT - o.shellMeanT) >= 1) {
            this.setState({ shellMeanT: o.newShellMeanT })
            updateShellProperties(o.newShellMeanT, shellFluid) //dun use the newly updated state, cos sometimes the 
            //state may update slowly and this function will run with the old value  
        }
        if (Math.abs(o.newTubeMeanT - o.tubeMeanT) >= 1) {
            this.setState({ tubeMeanT: o.newTubeMeanT })
            updateTubeProperties(o.newTubeMeanT, tubeFluid)
        }





    }

    componentDidMount() {
        this.props.handleSubmit({
            shellIT: 65.6,
            // //shellOT: 0, 
            shellMFR: 36.3,
            // shellSHC: 2094,
            // shellDV: 0.0646,
            // //shellKV:,
            // shellTC: 0.140,
            // shellD: 849,
            // shellPr: 966,
            shellFF: 0.000176,
            tubeIT: 32.2,
            // //tubeOT,
            tubeMFR: 18.1,
            // tubeSHC: 4187,
            // tubeDV: 0.000723,
            // //tubeKV,
            // tubeTC: 0.634,
            // tubeD: 993,
            // tubePr: 4.77,
            tubeFF: 0.000088,
            tubeInnerD: 0.0166,
            tubeOuterD: 0.019,
            tubePitch: 0.025,
            numberTube: 102,
            numberPasses: 2,
            tubeLength: 4.3,
            shellFluid: 'engine oil',
            tubeFluid: 'water',


            layoutAngle: "rotated-square",
            shellInnerDiameter: 0.336,
            baffleCut: 0.0867, //this value is in m, refers to the open space of the baffles
            centralBaffleSpacing: 0.279,
            clearance: 0.318,
            recalculate: 1
        })
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
                </div>
                <button onClick={() => console.log(this.state)}>log state</button>
            </div>
        );
    }
}

export default RatingResult;