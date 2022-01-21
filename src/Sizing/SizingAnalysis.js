import React from 'react';
import SizingAnalysisPage from './SizingAnalysisPage';
import SizingInputPage from './SizingInputPage';
import SizingResultPage from './SizingResult';
import * as dfd from 'danfojs';
import * as util from '../util';



class SizingAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.updateTubeProperties = this.updateTubeProperties.bind(this);
        this.updateShellProperties = this.updateShellProperties.bind(this);

        this.state = {
            // fluids 
            shellFluid: '',
            tubeFluid: '',
            // constants for shell
            shellIT: 0,//required
            shellOT: 0,
            shellOTreq: 0,
            shellMFR: 0,
            shellSHC: 0.01,  //put 0.01 cos sometimes the initial value of 0 will cause program to crash
            shellDV: 0.01,
            shellKV: 0.01,
            shellTC: 0.01,
            shellD: 0.01,
            shellFF: 0.01,
            // Constant for tube
            tubeIT: 0,//required
            tubeOT: 0,
            tubeOTreq: 0,
            tubeMFR: 0,
            tubeSHC: 0.01,
            tubeDV: 0.01,
            tubeKV: 0.01,
            tubeTC: 0.01,
            tubeD: 0.01,
            tubeFF: 0.01,
            // Constant for Constraints and physical Dimensions
            tubeInnerD: 0.010,
            tubeOuterD: 0.012,
            tubePitch: 0, //default is 0, then will auto calculate
            numberTube: 130,
            numberPasses: 1,
            layoutAngle: "square",
            shellInnerDiameter: 0.5,
            baffleCutPercent: 0,
            centralBaffleSpacing: 0,
            clearance: 0,
            shellSideFluidDynamicViscocity: 0,
            tubeMaterialThermalConductivity: 0,
            tubeMaterial: "Admiralty (70% Cu, 30% Ni)",
            tubeLength: 0, //new
            // Constant for material design
            // tubeUnsupportedLength: 0,
            // tubeYoungModule: 0,
            // tubeLongitudeStress: 0,
            // addedMassCoefficient: 0,
            // metalMassUnitLength: 0,
            //TEMA configs
            head: 'A_1',
            shell: 'E',
            rear: 'L_1',
            // pressure drop needed parameters
            // tubeRe: 0,
            // sigma: 0,
            Kc: 0,
            ke: 0,
            // App states
            currentPage: "forms",
            recalculate: 0,
            redraw: 0,
        };
    }

    //call this function as u iterate to update the new fluid properties
    updateTubeProperties(tubeAveT, tubeFluid, tubeRe, sigma) {
        util.fetchProperties(tubeAveT, tubeFluid, (tubeProperties) => {
            this.handleSubmit({ tubeD: tubeProperties[0] })
            this.handleSubmit({ tubeSHC: tubeProperties[1] })
            this.handleSubmit({ tubeDV: tubeProperties[2] })
            this.handleSubmit({ tubeKV: tubeProperties[3] })
            this.handleSubmit({ tubeTC: tubeProperties[4] })

            // need to check whether tubeRe is defined as the programs will run a few iterations before returnig a defined value
            if (typeof tubeRe !== "undefined") {
                util.calculate_Kc_and_Ke(tubeRe, sigma, 'Kc', (K) => {
                    this.handleSubmit({ Kc: K })
                    util.calculate_Kc_and_Ke(tubeRe, sigma, 'Ke', (K) => {
                        this.handleSubmit({ Ke: K })
                        this.handleSubmit({ recalculate: 1 })
                    })
                })
            }
            else {
                this.handleSubmit({ recalculate: 1 })
                //putting recalculate:1 here will ensure the fluid properties are fully updated
                //before running recalculation
            }

        })
    }

    updateShellProperties(shellAveT, shellFluid) {
        util.fetchProperties(shellAveT, shellFluid, (shellProperties) => {
            this.handleSubmit({ shellD: shellProperties[0] })
            this.handleSubmit({ shellSHC: shellProperties[1] })
            this.handleSubmit({ shellDV: shellProperties[2] })
            this.handleSubmit({ shellKV: shellProperties[3] })
            this.handleSubmit({ shellTC: shellProperties[4] })
            this.handleSubmit({ recalculate: 1 })
        })
    }



    handleSubmit(value) {
        for (var property in value) {
            //this loop converts all the numeric data input into float so we can do arithmetic
            if (!isNaN(value[property])) {
                value[property] = parseFloat(value[property])
            }
        }
        this.setState(value);
    }

    handlePageChange(value) {
        this.setState(value);
    }

    render() {
        return (
            <div>
                <button onClick={() => console.log(this.state)}>log state</button>

                <div className={`${this.state.currentPage === "forms" ? "" : "hide"}`}>
                    <SizingAnalysisPage
                        data={this.state}
                        handleSubmit={this.handleSubmit}
                        handlePageChange={this.handlePageChange}
                        updateTubeProperties={this.updateTubeProperties}
                        updateShellProperties={this.updateShellProperties}
                    />
                </div>
                <div className={`${this.state.currentPage === "inputCheck" ? "" : "hide"}`}>
                    <SizingInputPage
                        data={this.state}
                        handleSubmit={this.handleSubmit}
                        handlePageChange={this.handlePageChange} />
                </div>
                <div className={`${this.state.currentPage === "result" ? "" : "hide"}`}>
                    <SizingResultPage
                        data={this.state}
                        handleSubmit={this.handleSubmit}
                        handlePageChange={this.handlePageChange}
                        updateTubeProperties={this.updateTubeProperties}
                        updateShellProperties={this.updateShellProperties}
                    />
                </div>
            </div>

        );
    }
}
export default SizingAnalysis;