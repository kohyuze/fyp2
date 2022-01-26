import React from 'react';
import RatingAnalysisPage from './RatingAnalysisPage';
import RatingInputPage from './RatingInputPage';
import RatingResultPage from './RatingResult';
import * as dfd from 'danfojs';
import * as util from '../util';


class RatingAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.updateTubeProperties = this.updateTubeProperties.bind(this);
        this.updateShellProperties = this.updateShellProperties.bind(this);

        this.state = {
            // fluids 
            shellFluid: 'engine oil',
            tubeFluid: 'water',
            // constants for shell
            shellIT: 65.6,
            shellOT: 0,
            shellMFR: 36.3,
            shellSHC: 0.1,  //put 0.1 cos sometimes the initial value of 0 will cause program to crash
            shellDV: 0.1,
            shellKV: 0.1,
            shellTC: 0.1,
            shellD: 0.1,
            shellFF: 0.000176,
            // Constant for tube
            tubeIT: 32.2,
            tubeOT: 0,
            tubeMFR: 18.1,
            tubeSHC: 0.1,
            tubeDV: 0.1,
            tubeKV: 0.1,
            tubeTC: 0.1,
            tubeD: 0.1,
            tubeFF: 0.000088,
            // Constant for Constraints and physical Dimensions
            tubeInnerD: 0.0166,
            tubeOuterD: 0.0190,
            tubePitch: 0, //default is 0, then will auto calculate
            numberTube: 102,
            numberPasses: 2,
            layoutAngle: "rotated-square",//"triangular" ,
            shellInnerDiameter: 0.336,
            baffleCutPercent: 25.8,
            centralBaffleSpacing: 0,
            numberBaffles: 13,
            clearance: 0.318,
            // shellSideFluidDynamicViscocity: 0,
            tubeMaterialThermalConductivity: 0,
            tubeLength: 4.3, 
            tubeMaterial: "Admiralty (70% Cu, 30% Ni)",

            //TEMA configs
            head: 'A',
            shell: 'E',
            rear: 'L',
            // pressure drop needed parameters
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
                {/* <button onClick={() => console.log(this.state)}>log state</button> */}

                <div className={`${this.state.currentPage === "forms" ? "" : "hide"}`}>
                    <RatingAnalysisPage
                        data={this.state}
                        handleSubmit={this.handleSubmit}
                        handlePageChange={this.handlePageChange}
                        updateTubeProperties={this.updateTubeProperties}
                        updateShellProperties={this.updateShellProperties}
                    />
                </div>
                <div className={`${this.state.currentPage === "inputCheck" ? "" : "hide"}`}>
                    <RatingInputPage
                        data={this.state}
                        handleSubmit={this.handleSubmit}
                        handlePageChange={this.handlePageChange} />
                </div>
                <div className={`${this.state.currentPage === "result" ? "" : "hide"}`}>
                    <RatingResultPage
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
export default RatingAnalysis;