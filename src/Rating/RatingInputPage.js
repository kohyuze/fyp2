import React from 'react';
import * as dfd from 'danfojs';

class InputPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

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
    updateProperties(shellIT,shellOT,tubeIT,tubeOT) {
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

    componentDidMount() {
        let {
            shellIT,
            shellOT,
            tubeIT,
            tubeOT,
        } = this.props.data;

        shellOT = shellIT;
        tubeOT = tubeIT;
        
        this.updateProperties(shellIT,shellOT,tubeIT,tubeOT)
    }

    render() {
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
            //ShellPN, //not filled in form
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
            //TubePN, //not filled in form
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
            // Constant for material design
            tubeUnsupportedLength,
            tubeYoungModule,
            tubeLongitudeStress,
            addedMassCoefficient,
            metalMassUnitLength,
        } = this.props.data;
        const {
            handleSubmit,
            handlePageChange
        } = this.props;
        return (
            <div>
                <button className="previous" onClick={() => handlePageChange({ currentPage: 'forms' })}>&laquo; Edit Inputs</button>
                <button onClick={() => console.log(this.props.data)}>log props</button>

                <h2>Inputs</h2>

                <div className='input-Container'>
                    <h2>Shell-side Fluid</h2>
                    {/* I use h5 tags to style the numbers differently */}
                    <div><p>Inlet Temperature:</p> <h5>{shellIT}°C</h5></div>
                    <div><p>Mass Flow Rate:</p> <h5>{shellMFR}kg/s</h5></div>
                    <div><p>Specific Heat Capacity:</p> <h5>{shellSHC}J/kg.K</h5></div>
                    <div><p>Dynamic Viscosity:</p> <h5>{shellDV}Pa.s</h5></div>
                    <div><p>Thermal Conductivity:</p> <h5>{shellTC}W/m.K</h5></div>
                    <div><p>Density:</p> <h5>{shellD}kg/m³</h5></div>
                    <h2>Tube-side Fluid</h2>
                    <div><p>Inlet Temperature:</p> <h5>{tubeIT}°C</h5></div>
                    <div><p>Mass Flow Rate:</p> <h5>{tubeMFR}kg/s</h5></div>
                    <div><p>Specific Heat Capacity:</p> <h5>{tubeSHC}J/kg.K</h5></div>
                    <div><p>Dynamic Viscosity:</p> <h5>{tubeDV}Pa.s</h5></div>
                    <div><p>Thermal Conductivity:</p> <h5>{tubeTC}W/m.K</h5></div>
                    <div><p>Density:</p> <h5>{tubeD}kg/m³</h5></div>
                    <h2>Physical Dimensions</h2>
                    <div><p>Number of Tubes:</p> <h5>{numberTube}</h5></div>
                    <div><p>Tube Inner Diameter</p> <h5>{tubeInnerD}m</h5></div>
                    <div><p>Tube Outer Diameter</p> <h5>{tubeOuterD}m</h5></div>
                    <div><p>Shell Inner Diameter</p> <h5>{shellInnerDiameter}m</h5></div>
                    <div><p>Tube Pitch</p> <h5>{tubePitch}m</h5></div>
                    <div><p>Tube Layout</p> <h5>{layoutAngle}</h5></div>
                    <div><p>Baffle Cut</p> <h5>{baffleCut}%</h5></div>
                    <div><p>Central Baffles Spacing</p> <h5>{centralBaffleSpacing}m</h5></div>
                    <div><p>Clearance</p> <h5>{clearance}m</h5></div>
                    <div><p>Number of Tube Passes</p> <h5>{numberPasses}</h5></div>
                    <button className='calculate' onClick={() => handlePageChange({ currentPage: 'result' })}>Calculate</button>
                </div>
            </div>
        );
    }
}

export default InputPage;