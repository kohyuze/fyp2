import React from 'react';
import RatingAnalysisPage from './RatingAnalysisPage';
import RatingInputPage from './RatingInputPage';
import RatingResultPage from './RatingResult';



class RatingAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.state = {
            // fluids 
            shellFluid: '',
            tubeFluid: '',
            // constants for shell
            shellIT: 20,//required
            shellOT: 0, 
            shellMFR: 0,
            shellSHC: 0,
            shellDV: 0,
            shellKV: 0,
            shellTC: 0,
            shellD: 0,
            shellFF: 0,
            // Constant for tube
            tubeIT: 65,//required
            tubeOT: 0,
            tubeMFR: 0,
            tubeSHC: 0,
            tubeDV: 0,
            tubeKV: 0,
            tubeTC: 0,
            tubeD: 0,
            tubeFF: 0,
            // Constant for Constraints and physical Dimensions
            tubeInnerD: 0,
            tubeOuterD: 0,
            tubePitch: 0,
            numberTube: 0,
            numberPasses: 1,
            layoutAngle: 0,
            shellInnerDiameter: 0,
            baffleCut: 0,
            centralBaffleSpacing: 0,
            clearance: 0,
            shellSideFluidDynamicViscocity: 0,
            tubeMaterialThermalConductivity: 0,
            // Constant for material design
            tubeUnsupportedLength: 0,
            tubeYoungModule: 0,
            tubeLongitudeStress: 0,
            addedMassCoefficient: 0,
            metalMassUnitLength: 0,
            //TEMA configs
            head: 'A_1',
            shell: 'E',
            rear: 'M_1',
            // App states
            currentPage: "forms"
        };
    }


    handleSubmit(value) {
        for (var property in value) {
            //this loop converts all the data input into float so we can do arithmetic
            if (!isNaN(value[property])){
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
                    <RatingAnalysisPage
                        data={this.state}
                        handleSubmit={this.handleSubmit}
                        handlePageChange={this.handlePageChange}
                    />
                </div>
                <div className={`${this.state.currentPage === "inputCheck" ? "" : "hide"}`}>
                    <RatingInputPage 
                    data={this.state}
                    handleSubmit={this.handleSubmit}
                    handlePageChange={this.handlePageChange}/>
                </div>
                <div className={`${this.state.currentPage === "result" ? "" : "hide"}`}>
                    <RatingResultPage 
                    data={this.state}
                    handleSubmit={this.handleSubmit}
                    handlePageChange={this.handlePageChange}/>
                </div>
            </div>

        );
    }
}
export default RatingAnalysis;