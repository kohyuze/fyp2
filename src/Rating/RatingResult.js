import React from 'react';
import * as dfd from 'danfojs';

class RatingResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tubeHEcoeff: 0,
            shellHEcoeff: 0,
            overallHEcoeff: 0,
            iteration: 0,
            shellMeanT: 0, //first iteration's values are fetched using input temp, at Tab1Form
            tubeMeanT: 0   //further iterations, this value will be updated with the mean.
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

        // o is used to hold the calculated values before we setState at the end of the function
        let o = {}

       
        console.log("Iteration " + this.state.iteration)
        this.setState({ iteration: this.state.iteration + 1 })

        // // ---- Calculation of the tube-side heat transfer coefficient using Nitsche method(pg39) -------
        // //Calculation of the flow cross section
        // const tubeCrossSection = (numberTube / numberPasses) * Math.PI * Math.pow(tubeInnerD, 2) / 4;
        // //Determination of the flow velocity in the tubes
        // const tubeFlowVelocity = tubeMFR / tubeCrossSection;
        // //Determination of the Reynolds number
        // const tubeRe = (tubeFlowVelocity * tubeInnerD) / tubeKV;
        // //Calculation of the Pr number
        // const tubePr = (tubeKV * tubeSHC * tubeD) / tubeTC;
        // //Determination of the Nusselt number
        // const tubeNu = 0.023 * Math.pow(tubeRe, 0.8) * Math.pow(tubePr, 0.33); //for Re>8000
        // //Calculation of the heat transfer coefficient
        // const tubeHEcoeff = (tubeNu * tubeTC) / tubeInnerD;
        // o.tubeHEcoeff = tubeHEcoeff.toFixed();


        // // ---- Calculation of the shell-side heat transfer coefficient using Nitsche method for Re>10(Nitsche pg40) -------
        // //Calculation of the flow cross section
        // const shellCrossSection = shellInnerDiameter * centralBaffleSpacing * (1 - (tubeOuterD / tubePitch)) //what if no baffle spacing given?
        // //Determination of the mass flow velocity in the shell
        // const shellMassVelocity = shellMFR / shellCrossSection;
        // //Determination of the Reynolds number
        // const shellRe = (shellMassVelocity * tubeOuterD) / shellDV;
        // //Calculation of the Pr number
        // const shellPr = (shellKV * shellSHC * shellD) / shellTC;//fetch this too
        // //Determination of the Nusselt number
        // const shellNu = 0.196 * shellRe**0.6 * shellPr**0.33; //for triangular pitch
        // //Calculation of the heat transfer coefficient
        // const shellHEcoeff = (shellNu * shellTC) / tubeOuterD;
        // o.shellHEcoeff = shellHEcoeff.toFixed();


        //------------------Rating problem-----------------------
        ////////////////////Geometrical Calculations, Shah 594/////////////////////////
        //Assumptions: The shell-and-tube heat exchanger is assumed to have the ideal geometrical
        //characteristics summarized in Section 8.5

        const D_otl = 0.321 //Diameter of the outer tube limit, can add to input, or we decide ourself just take D-15mm

        let X_l, X_t;
        //Determination of Longitudinal_tube_pitch and Traverse_tube_pitch from table 8.1, shah pg568
        switch (layoutAngle) {
            case 'triangular':
                X_t = tubePitch
                X_l = (Math.sqrt(3) / 2) * tubePitch
                break;
            case 'rotated-triangular':
                X_t = Math.sqrt(3) * tubePitch
                X_l = 0.5 * tubePitch
                break;
            case 'square':
                X_t = tubePitch
                X_l = tubePitch
                break;
            case 'rotated-square':
                X_t = Math.sqrt(2) * tubePitch
                X_l = tubePitch / Math.sqrt(2)
                break;
            default:
        }

        //Window Section. Let us start the calculations with computing the angle θb from Eq.(8.112):
        const θ_b = 2 * Math.acos(1 - (2 * baffleCut / shellInnerDiameter)); //rad

        //Then the gross window area A_frw from Eq. (8.111) is
        const A_frw = ((shellInnerDiameter ** 2) / 4) * (θ_b / 2 - (1 - (2 * baffleCut / shellInnerDiameter)) * Math.sin(θ_b / 2));

        //In order to calculate the fraction Fw of total tubes in the window section, first compute
        //the baffle cut angle, using Eq. (8.114), as
        const D_ctl = D_otl - tubeOuterD
        const θ_ctl = 2 * Math.acos((shellInnerDiameter - 2 * baffleCut) / D_ctl);

        //Now the fraction Fw of total tubes in the window section is given by Eq. (8.113) as
        const F_w = (θ_ctl / (2 * Math.PI)) - (Math.sin(θ_ctl) / (2 * Math.PI))

        //Consequently, the number of tubes in the window section, from Eq. (8.115), is
        const N_tw = F_w * numberTube

        //The area occupied by tubes in the window section, Eq. (8.116), is
        const A_frt = (Math.PI / 4) * (tubeOuterD ** 2) * N_tw

        //The net flow area in one window section is then, from Eq. (8.117)
        const A_ow = A_frw - A_frt

        //The hydraulic diameter for the window section is given by Eq. (8.118) as
        const D_hw = (4 * A_ow) / (Math.PI * tubeOuterD * N_tw + Math.PI * shellInnerDiameter * (θ_b / (2 * Math.PI)));

        //Finally, the number of effective tube rows in crossflow in each window is computed using Eq. (8.119) as
        const N_rcw = (0.8 / X_l) * (baffleCut - 0.5 * (shellInnerDiameter - D_ctl))

        //Crossflow Section. The fraction Fc of the total number of tubes in the crossflow section is calculated from Eq. (8.120) as
        const F_c = 1 - 2 * F_w

        //Next calculate the number of tube rows Nrcc crossed during flow through one crossflow
        //section between the baffle tips [Eq. (8.121)] as
        const N_rcc = (shellInnerDiameter - 2 * baffleCut) / X_l

        //The crossflow area at or near the shell centerline for one crossflow section may be estimated from A_ocr
        //There are different calculations for A_ocr for different conditions, see shah pg 592
        let A_ocr
        if (layoutAngle === 'triangular' || layoutAngle === 'square') {
            A_ocr = (shellInnerDiameter - D_otl + (D_ctl / X_t) * (X_t - tubeOuterD)) * centralBaffleSpacing //eqn 8.122
        }
        else if (layoutAngle === 'rotated-square' && tubePitch / tubeOuterD >= 1.707) {
            A_ocr = (shellInnerDiameter - D_otl + (D_ctl / X_t) * (X_t - tubeOuterD)) * centralBaffleSpacing //eqn 8.122
        }
        else if (layoutAngle === 'rotated-triangular' && tubePitch / tubeOuterD >= 3.732) {
            A_ocr = (shellInnerDiameter - D_otl + (D_ctl / X_t) * (X_t - tubeOuterD)) * centralBaffleSpacing //eqn 8.122
        }
        if (layoutAngle === 'rotated-triangular' || layoutAngle === 'rotated-square') {
            A_ocr = centralBaffleSpacing * (shellInnerDiameter - D_otl + 2 * (D_ctl / X_t) * (tubePitch - tubeOuterD)) //eqn 8.123
        }
        //we shall not account for finned tubes


        //Now, compute the number of baffles from Eq. (8.126) as
        const N_b = (tubeLength - clearance - clearance) / centralBaffleSpacing + 1

        //Bypass and Leakage Flow Areas. To calculate the fraction of crossflow area available for
        //flow bypass, Fbp [Eq. (8.127)], we first have to calculate the magnitude of crossflow area
        //for flow bypass:
        const Width_bypass_lane = 0.019 //assumed, can let user input, or can derive from tubePitch
        const A_obp = centralBaffleSpacing * (shellInnerDiameter - D_otl + (0.5 * numberPasses * Width_bypass_lane))

        //Consequently,
        const F_bp = A_obp / A_ocr

        //Tube to baffle hole diametral clearance = baffle hole diameter - tube outside diameter. pg593
        const 𝛿_tb = 0.000794 //this small value is assumed. Can consider having user input it.
        //Tube-to-baffle leakage area is now given by Eq. (8.129) as follows
        const A_otb = (Math.PI * tubeOuterD * 𝛿_tb * numberTube * (1 - F_w)) / 2

        // shell-to-baffle leakage area for one baffle = gap between the shell inside diameter and the baffle. pg593
        const 𝛿_sb = 0.002946 //this small value is assumed. Can consider having user input it.
        //Finally, the shell-to-baffle leakage area for one baffle [Eq. (8.130)] is
        const A_osb = Math.PI * shellInnerDiameter * (𝛿_sb / 2) * (1 - θ_b / (2 * Math.PI))

        //This concludes all geometrical characteristics needed for the thermal design/rating of a
        //shell-and-tube heat exchanger using the Bell–Delaware method.

        // console.log("A_ocr:" + A_ocr)
        // console.log("A_obp:" +A_obp)
        // console.log("F_c:" +F_c)
        // console.log("N_rcc:" +N_rcc)
        // console.log("A_osb:" +A_osb)
        // console.log("A_otb:" +A_otb)
        // console.log("N_b:" +N_b)
        // console.log("A_ow:" +A_ow)

        //Impt constants needed for HT analysis
        // const A_ocr = 0.03275
        // const A_obp = 0.00949
        // const F_c = 0.6506
        // const N_rcc = 9
        // const A_osb = 0.001027
        // const A_otb = 0.001995
        // const N_b = 14
        // const A_ow = 0.01308

        const k_w = 111 //thermal conductivity of tube wall. user input.

        //////////////Thermal calculations, Shah pg653//////////////////////////
        //-----Shell-Side Heat Transfer Coefficient-----------------------
        //Determination of the flow velocity in the shell
        const shellMassVelocity = shellMFR / A_ocr;
        //console.log("shellMassVelocity", shellMassVelocity)
        //Determination of the Reynolds number
        const shellRe = (shellMassVelocity * tubeOuterD) / shellDV;
        //console.log("shellRe", shellRe)
        //Calculation of the Pr number
        const shellPr = (shellKV * shellSHC * shellD) / shellTC;
        //Now we compute Nus from the given correlation with Re_d = Re_s. Note that we have not calculated T_w, 
        //so we cannot calculate Pr_w. So in this iteration, we consider Pr_s = Pr_w
        const shellNu = 1.04 * (shellRe ** 0.4) * (shellPr ** 0.36)
        //console.log("shellNu", shellNu)
        const h_id = (shellNu * shellTC) / tubeOuterD

        //Bell Delaware method, refer to table 9.2, shah pg648
        //Baffle cut and spacing effect correction factor
        const J_c = 0.55 + 0.72 * F_c
        //To calculate the tube-to-baffle and baffle-to-shell leakage factor J_l from Table 9.2, we need to calculate r_s and r_lm as follows       
        const r_s = A_osb / (A_osb + A_otb)
        const r_lm = (A_osb + A_otb) / A_ocr
        const J_l = 0.44 * (1 - r_s) + (1 - 0.44 * (1 - r_s)) * Math.exp(-2.2 * r_lm)
        //Let us now calculate Jb using the formula from Table 9.2 after we determine C (for Res ¼ 326), rb, and Nþ ss as follows:
        let C;
        (shellRe <= 100) ? (C = 1.35) : (C = 1.25)
        const N_ss = 1 //number of sealing strip pairs, assumed
        const r_b = A_obp / A_ocr
        const N_ssplus = N_ss / N_rcc
        const J_b = Math.exp(-1 * C * r_b * (1 - (2 * N_ssplus) ** (1 / 3)))
        //Now we compute L_iplus and L_oplus for determining unequal baffle spacing factor Js from Table 9.2.
        const L_iplus = 0.318 / 0.279
        const L_oplus = L_iplus
        const n = 0.6 //for turbulent flow. It should almost always be in turbulent flow?
        const J_s = (N_b - 1 + L_iplus ** (1 - n) + L_oplus ** (1 - n)) / (N_b - 1 + L_iplus + L_oplus)
        //Finally, the adverse temperature gradient factor Jr ¼ 1 for Res ¼ 326 > 100
        let J_r
        if (shellRe >= 100) { J_r = 1 }
        else if (shellRe <= 20) { J_r = (10 / (N_rcc + N_rcw)) ** 0.18 }
        else { //interpolation
            const x = (10 / (N_rcc + N_rcw)) ** 0.18
            J_r = x + (shellRe - 20) * (1 - x) / (100 - 20)
        }
        //Since all correction factors J are determined, the actual shell-side heat transfer coefficient is given by
        const h_s = h_id * J_c * J_l * J_b * J_s * J_r

        //This heat transfer coefficient should be corrected for the fluid property variationsas outlined in Section 7.6.1
        // once the wall temperature is calculated in the next iteration.
        o.shellHEcoeff = h_s.toFixed(6);

        //-----Tube-Side Heat Transfer Coefficient-----------------------
        //Number of tubes per pass
        const N_tp = numberTube / numberPasses
        //Tube-side flow area per pass
        const A_ot = (Math.PI / 4) * tubeInnerD ** 2 * N_tp
        //Tube-side Reynolds number
        const tubeRe = (tubeMFR * tubeInnerD) / (A_ot * tubeDV)
        // console.log("A_ot", A_ot)
        //console.log("tubeDV", tubeDV)
        //console.log("tubeRe", tubeRe)

        const tubePr = (tubeKV * tubeSHC * tubeD) / tubeTC;
        //Nusselt number
        const tubeNu = 0.024 * tubeRe ** 0.8 * tubePr ** 0.4
        //console.log("tubeNu", tubeNu)
        //Heat transfer coefficient
        const h_t = (tubeNu * tubeTC) / tubeInnerD
        //console.log("h_t", h_t)
        o.tubeHEcoeff = h_t.toFixed(6);

        //---------------Overall Heat Transfer Coefficient------------
        const U_inverse = (1 / h_s) + shellFF + ((tubeOuterD * Math.log(tubeOuterD / tubeInnerD)) / (2 * k_w)) + tubeFF * (tubeOuterD / tubeInnerD) + (1 / h_t) * (tubeOuterD / tubeInnerD)
        const overallHEcoeff = 1 / U_inverse
        console.log("overallHEcoeff", overallHEcoeff)
        o.overallHEcoeff = overallHEcoeff.toFixed(6);

        //------------- Heat Transfer Effectiveness------------------
        //Total tube outside heat transfer area
        const A_s = Math.PI * tubeLength * tubeOuterD * numberTube
        const C_tube = tubeMFR * tubeSHC
        const C_shell = shellMFR * shellSHC
        let C_min
        let C_max
        if (C_tube > C_shell) {
            C_min = C_shell
            C_max = C_tube
        }
        else if (C_tube <= C_shell) {
            C_min = C_tube
            C_max = C_shell
        }
        const C_star = C_min / C_max
        //Number of heat transfer units
        const NTU = overallHEcoeff * A_s / C_min
        //Heat exchanger effectiveness
        const coth = Math.cosh(NTU / Math.sqrt(2)) / Math.sinh(NTU / Math.sqrt(2))
        const HEeffectiveness = Math.sqrt(2) / (Math.sqrt(2) + coth)
        //console.log("HEeffectiveness", HEeffectiveness)
        o.HEeffectiveness = HEeffectiveness.toFixed(6);

        //------------------Heat Transfer Rate and Exit Temperatures----------------------
        //Heat Transfer Rate
        const Q = HEeffectiveness * C_min * (shellIT - tubeIT)
        //Shell exit temperature
        const shellOT2 = shellIT - HEeffectiveness * C_star * (shellIT - tubeIT)
        o.shellOT = shellOT2.toFixed(6);
        console.log("shellOT", shellOT2)
        //Tube exit temperature
        const tubeOT2 = tubeIT + HEeffectiveness * C_star * (shellIT - tubeIT)
        o.tubeOT = tubeOT2.toFixed(6);
        console.log("tubeOT", tubeOT2)


        //check mean temp, if difference is more than 1°C, we iterate again
        let newShellMeanT = (shellOT2 + shellIT) / 2
        let newTubeMeanT = (tubeOT2 + tubeIT) / 2
        console.log("newShellMeanT " + newShellMeanT)
        console.log("shellMeanT " + this.state.shellMeanT)
        console.log("newTubeMeanT " + newTubeMeanT)
        console.log("tubeMeanT " + this.state.tubeMeanT)

        if (Math.abs(newShellMeanT - this.state.shellMeanT) >= 1) {
            this.setState({shellMeanT: newShellMeanT}, ()=>
            updateShellProperties(newShellMeanT, shellFluid) //dun use the newly updated state, cos sometimes the 
            //state may update slowly and this function will run with the old value
            )
        }
        if (Math.abs(newTubeMeanT - this.state.tubeMeanT) >= 1) {
            this.setState({tubeMeanT: newTubeMeanT})
            updateTubeProperties(newTubeMeanT, tubeFluid)
        }

        this.setState(o)

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