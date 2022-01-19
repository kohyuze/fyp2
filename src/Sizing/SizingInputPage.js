import React from 'react';
import * as dfd from 'danfojs';

class InputPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    
    render() {
        const {
            // fluids 
            shellFluid,
            tubeFluid,
            // constants for shell
            shellIT,
            shellOTreq,
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
            tubeOTreq,
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
            baffleCutPercent,
            centralBaffleSpacing,
            numberBaffles,
            clearance,
            shellSideFluidDynamicViscocity,
            tubeMaterialThermalConductivity,
            tubeMaterial,
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
                    <h2>Shell-side Fluid: {shellFluid}</h2>
                    {/* I use h5 tags to style the numbers differently */}
                    <div><p>Inlet Temperature:</p> <h5>{shellIT}°C</h5></div>
                    <div><p>Target Outlet Temperature:</p> <h5>{shellOTreq}°C</h5></div>
                    <div><p>Mass Flow Rate:</p> <h5>{shellMFR}kg/s</h5></div>
                    <div><p>Specific Heat Capacity:</p> <h5>{shellSHC}J/kg.K</h5></div>
                    <div><p>Dynamic Viscosity:</p> <h5>{shellDV}Pa.s</h5></div>
                    <div><p>Thermal Conductivity:</p> <h5>{shellTC}W/m.K</h5></div>
                    <div><p>Density:</p> <h5>{shellD}kg/m³</h5></div>
                    <h2>Tube-side Fluid: {tubeFluid}</h2>
                    <div><p>Inlet Temperature:</p> <h5>{tubeIT}°C</h5></div>
                    <div><p>Target Outlet Temperature:</p> <h5>{tubeOTreq}°C</h5></div>
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
                    <div><p>Baffle Cut</p> <h5>{baffleCutPercent}%</h5></div>
                    <div><p>Number of baffles</p> <h5>{numberBaffles}</h5></div>
                    <div><p>Clearance</p> <h5>{clearance}m</h5></div>
                    <div><p>Number of Tube Passes</p> <h5>{numberPasses}</h5></div>
                    <div><p>Tube Material</p> <h5>{tubeMaterial}</h5></div>
                    <div><p>Tube Wall Thermal Conductivity</p> <h5>{tubeMaterialThermalConductivity}W/m.K</h5></div>
                    <button className='calculate' onClick={() => handlePageChange({ currentPage: 'result' })}>Calculate</button>
                </div>
            </div>
        );
    }
}

export default InputPage;