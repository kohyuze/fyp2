import React from 'react';
import * as dfd from 'danfojs';

class RatingResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tubeHEcoeff: 0,
            shellHEcoeff: 0
        }
    }

    interpolate(x, x1, x2, y1, y2) {
        return (y1 + ((x - x1) * (y2 - y1) / (x2 - x1)));
    }

    fetchProperties(inlet, outlet, callback) {
        let averageTemp = (Number(inlet) + Number(outlet)) / 2;
        console.log(inlet, outlet, averageTemp);

        dfd.read_csv("https://raw.githubusercontent.com/kohyuze/fluid-properties/main/SteamTable")
            .then(df => {
                //first we read the entire steam table, then we pick out only the temp and specific columns
                let sub_df = df.loc({ columns: ["temp", "densityL", "specHeatL", "dynamicViscL", "therCondL"] })
                // sub_df.head().print()
                // sub_df.iloc({rows:[2]}).print();
                // console.log(sub_df.iloc({ rows: [2] }).$data[0][0])

                //find the row in the steam table with the temperature
                // the $data[0] is gotten by referencing the object when u console.log the fkin thing,
                // trying to extract the fkin value from the dataframe was a huge headache.
                let j = 0;
                while (averageTemp > Number(sub_df.iloc({ rows: [j] }).$data[0][0])) {
                    j++
                }
                sub_df.iloc({ rows: [j - 1, j] }).print();

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
    updateProperties(shellIT, shellOT, tubeIT, tubeOT) {
        const { handleSubmit } = this.props;
        this.fetchProperties(shellIT, shellOT, (shellProperties) => {
            handleSubmit({ shellOT: shellOT })
            handleSubmit({ shellD: shellProperties[0] })
            handleSubmit({ shellSHC: shellProperties[1] })
            handleSubmit({ shellDV: shellProperties[2] })
            handleSubmit({ shellKV: shellProperties[3] })
            handleSubmit({ shellTC: shellProperties[4] })
        })
        this.fetchProperties(tubeIT, tubeOT, (tubeProperties) => {
            handleSubmit({ tubeOT: tubeOT })
            handleSubmit({ tubeD: tubeProperties[0] })
            handleSubmit({ tubeSHC: tubeProperties[1] })
            handleSubmit({ tubeDV: tubeProperties[2] })
            handleSubmit({ tubeKV: tubeProperties[3] })
            handleSubmit({ tubeTC: tubeProperties[4] })
        })
    }

    calculate() {
        const {
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
        } = this.props.data;
        // o is used to hold the calculated values before we setState at the end of the function
        let o = {}

        // ---- Calculation of the tube-side heat transfer coefficient using Nitsche method(pg39) -------
        //Calculation of the flow cross section
        const tubeCrossSection = (numberTube / numberPasses) * Math.PI * Math.pow(tubeInnerD, 2) / 4;
        //Determination of the flow velocity in the tubes
        const tubeFlowVelocity = tubeMFR / tubeCrossSection;
        //Determination of the Reynolds number
        const tubeRe = (tubeFlowVelocity * tubeInnerD) / tubeKV;
        //Calculation of the Pr number
        const tubePr = (tubeKV * tubeSHC * tubeD) / tubeTC;
        //Determination of the Nusselt number
        const tubeNu = 0.023 * Math.pow(tubeRe, 0.8) * Math.pow(tubePr, 0.33); //for Re>8000
        //Calculation of the heat transfer coefficient
        const tubeHEcoeff = (tubeNu * tubeTC) / tubeInnerD;
        o.tubeHEcoeff = tubeHEcoeff.toFixed();


        // ---- Calculation of the shell-side heat transfer coefficient using Nitsche method for Re>10(pg40) -------
        //Calculation of the flow cross section
        const shellCrossSection = shellInnerDiameter * centralBaffleSpacing * (1 - (tubeOuterD / tubePitch)) //what if no baffle spacing given?
        //Determination of the flow velocity in the shell
        const shellFlowVelocity = shellMFR / shellCrossSection;
        //Determination of the Reynolds number
        const shellRe = (shellFlowVelocity * tubeOuterD) / shellKV;
        //Calculation of the Pr number
        const shellPr = (shellKV * shellSHC * shellD) / shellTC;
        //Determination of the Nusselt number
        const shellNu = 0.196 * Math.pow(shellRe, 0.6) * Math.pow(shellPr, 0.33); //for triangular pitch
        //Calculation of the heat transfer coefficient
        const shellHEcoeff = (shellNu * shellTC) / tubeOuterD;
        o.shellHEcoeff = shellHEcoeff.toFixed();




        this.setState(o)
    }

    componentDidMount() {
        this.calculate()
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
                </div>
                <button onClick={() => console.log(this.state)}>log state</button>
            </div>
        );
    }
}

export default RatingResult;