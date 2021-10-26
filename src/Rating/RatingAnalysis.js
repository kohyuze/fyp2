import React from 'react';
import RatingAnalysisPage from './RatingAnalysisPage';
import RatingInputPage from './RatingInputPage';
import RatingResultPage from './RatingResult';
import * as dfd from 'danfojs';


class RatingAnalysis extends React.Component {
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
            shellMFR: 0,
            shellSHC: 0,
            shellDV: 0,
            shellKV: 0,
            shellTC: 0,
            shellD: 0,
            shellFF: 0,
            // Constant for tube
            tubeIT: 0,//required
            tubeOT: 0,
            tubeMFR: 0,
            tubeSHC: 0,
            tubeDV: 0,
            tubeKV: 0,
            tubeTC: 0,
            tubeD: 0,
            tubeFF: 0,
            // Constant for Constraints and physical Dimensions
            tubeInnerD: 0.010,
            tubeOuterD: 0.012,
            tubePitch: 0,
            numberTube: 130,
            numberPasses: 1,
            layoutAngle: "square",
            shellInnerDiameter: 0.5,
            baffleCut: 0,
            centralBaffleSpacing: 0,
            clearance: 0,
            shellSideFluidDynamicViscocity: 0,
            tubeMaterialThermalConductivity: 0,
            tubeLength: 0, //new
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
            currentPage: "forms",
            recalculate: 0,
            redraw: 0,
        };
    }



    interpolate(x, x1, x2, y1, y2) {
        return (y1 + ((x - x1) * (y2 - y1) / (x2 - x1)));
    }

    //After fluid and temperature are given, the properties are fetched
    fetchProperties(AveT, fluid, callback) {
        let averageTemp = Number(AveT)

        console.log("fetching " + fluid)
        let fluidProperties = ''
        switch (fluid) {
            case 'water':  
                fluidProperties = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/SteamTable"
                break;
            case 'engine oil':
                fluidProperties = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/engineOilUnused"
                break;
            default:
                //think of a way to catch this error
                fluidProperties = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/SteamTable"
        }

        dfd.read_csv(fluidProperties)
            .then(df => {
                //first we read the entire steam table, then we pick out only the temp and specific columns
                let sub_df = df.loc({ columns: ["temp", "densityL", "specHeatL", "dynamicViscL", "therCondL"] })
                // sub_df.head().print()
                // sub_df.iloc({rows:[2]}).print();
                // console.log(sub_df.iloc({ rows: [2] }).$data[0][0])

                // find the row in the steam table with the temperature
                // the $data[0] is gotten by referencing the object when u console.log the fkin thing,
                // trying to extract the fkin value from the dataframe was a huge headache.
                let j = 0;
                while (averageTemp > Number(sub_df.iloc({ rows: [j] }).$data[0][0])) {
                    j++
                }

                let density = this.interpolate(
                    averageTemp,
                    Number(sub_df.iloc({ rows: [j - 1] }).$data[0][0]),
                    Number(sub_df.iloc({ rows: [j] }).$data[0][0]),
                    Number(sub_df.iloc({ rows: [j - 1] }).$data[0][1]),
                    Number(sub_df.iloc({ rows: [j] }).$data[0][1])
                )
                let specificHeat = this.interpolate(
                    averageTemp,
                    Number(sub_df.iloc({ rows: [j - 1] }).$data[0][0]),
                    Number(sub_df.iloc({ rows: [j] }).$data[0][0]),
                    Number(sub_df.iloc({ rows: [j - 1] }).$data[0][2]),
                    Number(sub_df.iloc({ rows: [j] }).$data[0][2])
                )
                let dynamicVis = this.interpolate(
                    averageTemp,
                    Number(sub_df.iloc({ rows: [j - 1] }).$data[0][0]),
                    Number(sub_df.iloc({ rows: [j] }).$data[0][0]),
                    Number(sub_df.iloc({ rows: [j - 1] }).$data[0][3]),
                    Number(sub_df.iloc({ rows: [j] }).$data[0][3])
                )
                let kinematicVis = dynamicVis / density;
                let therConductivity = this.interpolate(
                    averageTemp,
                    Number(sub_df.iloc({ rows: [j - 1] }).$data[0][0]),
                    Number(sub_df.iloc({ rows: [j] }).$data[0][0]),
                    Number(sub_df.iloc({ rows: [j - 1] }).$data[0][4]),
                    Number(sub_df.iloc({ rows: [j] }).$data[0][4])
                )

                const Properties = [density, specificHeat, dynamicVis, kinematicVis, therConductivity];
                console.log(Properties)
                callback(Properties);
            }).catch(err => {
                console.log(err);
            })
    }

    //call this function as u iterate to update the new fluid properties
    updateTubeProperties(tubeAveT, tubeFluid) {
        this.fetchProperties(tubeAveT, tubeFluid, (tubeProperties) => {
            this.handleSubmit({ tubeD: tubeProperties[0] })
            this.handleSubmit({ tubeSHC: tubeProperties[1] })
            this.handleSubmit({ tubeDV: tubeProperties[2] })
            this.handleSubmit({ tubeKV: tubeProperties[3] })
            this.handleSubmit({ tubeTC: tubeProperties[4] })
            this.handleSubmit({recalculate: 1}) 
            //putting recalculate:1 here will ensure the fluid properties are fully updated
            //before running recalculation
        })
    }

    updateShellProperties(shellAveT, shellFluid) {
        this.fetchProperties(shellAveT, shellFluid, (shellProperties) => {
            this.handleSubmit({ shellD: shellProperties[0] })
            this.handleSubmit({ shellSHC: shellProperties[1] })
            this.handleSubmit({ shellDV: shellProperties[2] })
            this.handleSubmit({ shellKV: shellProperties[3] })
            this.handleSubmit({ shellTC: shellProperties[4] })
            this.handleSubmit({recalculate: 1})
        })
    }

    
    handleSubmit(value) {
        for (var property in value) {
            //this loop converts all the numeric data input into float so we can do arithmetic
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
                        updateTubeProperties={this.updateTubeProperties}
                        updateShellProperties={this.updateShellProperties}
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