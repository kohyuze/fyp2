import React from 'react';
import * as dfd from 'danfojs';

class RatingResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tubeHEcoeff: 0,
            shellHEcoeff: 0,
            overallHEcoeff: 0
        }
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
            //tubePitch,
            numberTube,
            numberPasses,
            layoutAngle,
            shellInnerDiameter,
            baffleCut,
            //centralBaffleSpacing,
            clearance,
            shellSideFluidDynamicViscocity,
            tubeMaterialThermalConductivity,
            tubeLength,
        } = this.props.data;
        const {
            handleSubmit,
            handlePageChange
        } = this.props;

        // o is used to hold the calculated values before we setState at the end of the function
        let o = {}

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

        //what are these?
        const D_otl = 0.321 //Diameter of the outer tube limit
        const centralBaffleSpacing = 0.279
        const Longitudinal_tube_pitch = 0.0177 //whats this?
        const Traverse_tube_pitch = 0.0354
        const tubePitch = 0.025
        //const tubeLength = 4.3
        const inletBaffleSpacing = 0.318
        const outletBaffleSpacing = 0.318
        const Width_bypass_lane = 0.019
        const Tube_to_baffle_hole_diametral_clearance = 0.000794
        const Shell_to_baffle_diametral_clearance = 0.002946

        //Window Section. Let us start the calculations with computing the angle θb from Eq.(8.112):
        const θ_b = 2*Math.acos(1-(2*baffleCut/shellInnerDiameter)); //rad

        //Then the gross window area A_frw from Eq. (8.111) is
        const A_frw = ((shellInnerDiameter**2)/4)*(θ_b/2 - (1-(2*baffleCut/shellInnerDiameter))*Math.sin(θ_b/2 ));

        //In order to calculate the fraction Fw of total tubes in the window section, first compute
        //the baffle cut angle, using Eq. (8.114), as
        const D_ctl = D_otl-tubeOuterD
        const θ_ctl = 2*Math.acos((shellInnerDiameter-2*baffleCut)/D_ctl); 

        //Now the fraction Fw of total tubes in the window section is given by Eq. (8.113) as
        const F_w = (θ_ctl/ (2*Math.PI)) - (Math.sin(θ_ctl)/ (2*Math.PI))

        //Consequently, the number of tubes in the window section, from Eq. (8.115), is
        const N_tw = F_w*numberTube

        //The area occupied by tubes in the window section, Eq. (8.116), is
        const A_frt = (Math.PI/4)*(tubeOuterD**2)*N_tw

        //The net flow area in one window section is then, from Eq. (8.117)
        const A_ow = A_frw - A_frt

        //The hydraulic diameter for the window section is given by Eq. (8.118) as
        const D_hw = (4*A_ow)/(Math.PI*tubeOuterD*N_tw + Math.PI*shellInnerDiameter*(θ_b/(2*Math.PI)));

        //Finally, the number of effective tube rows in crossflow in each window is computed using Eq. (8.119) as
        const N_rcw = (0.8/Longitudinal_tube_pitch)*(baffleCut-0.5*(shellInnerDiameter-D_ctl))

        //Crossflow Section. The fraction Fc of the total number of tubes in the crossflow section is calculated from Eq. (8.120) as
        const F_c = 1 - 2*F_w

        //Next calculate the number of tube rows Nr;cc crossed during flow through one crossflow
        //section between the baffle tips [Eq. (8.121)] as
        const N_rcc = (shellInnerDiameter-2*baffleCut)/Longitudinal_tube_pitch

        //The crossflow area for the 458 tube layout bundle with plain tubes at or near the shell
        //centerline for one crossflow section can be calculated, using Eq. (8.123), as
        const A_ocr = centralBaffleSpacing*(shellInnerDiameter - D_otl + 2*(D_ctl/Traverse_tube_pitch)*(tubePitch - tubeOuterD))

        //Now, compute the number of baffles from Eq. (8.126) as
        const N_b = (tubeLength-inletBaffleSpacing-outletBaffleSpacing)/centralBaffleSpacing + 1

        //Bypass and Leakage Flow Areas. To calculate the fraction of crossflow area available for
        //flow bypass, Fbp [Eq. (8.127)], we first have to calculate the magnitude of crossflow area
        //for flow bypass:
        const A_obp = centralBaffleSpacing*(shellInnerDiameter-D_otl+(0.5*numberPasses*Width_bypass_lane))

        //Consequently,
        const F_bp = A_obp/A_ocr

        //Tube-to-baffle leakage area is now given by Eq. (8.129) as follows
        const A_otb = (Math.PI*tubeOuterD*Tube_to_baffle_hole_diametral_clearance*numberTube*(1-F_w))/2

        //Finally, the shell-to-baffle leakage area for one baffle [Eq. (8.130)] is
        const A_osb = Math.PI * shellInnerDiameter * (Shell_to_baffle_diametral_clearance/2) * (1 - θ_b/(2*Math.PI))

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

    
        // const A_ocr = 0.03275
        // const A_obp = 0.00949
        // const F_c = 0.6506
        // const N_rcc = 9
        // const A_osb = 0.001027
        // const A_otb = 0.001995
        // const N_b = 14
        // const A_ow = 0.01308

        const k_w = 111

        

        //////////////Thermal calculations, Shah pg653//////////////////////////
        //-----Shell-Side Heat Transfer Coefficient-----------------------
        //Determination of the flow velocity in the shell
        const shellMassVelocity = shellMFR / A_ocr;
        console.log("shellMassVelocity", shellMassVelocity)
        //Determination of the Reynolds number
        const shellRe = (shellMassVelocity * tubeOuterD) / shellDV;
        console.log("shellRe", shellRe)
        //Calculation of the Pr number
        const shellPr = (shellKV * shellSHC * shellD) / shellTC;
        //Now we compute Nus from the given correlation with Re_d = Re_s. Note that we have not calculated T_w, 
        //so we cannot calculate Pr_w. So in this iteration, we consider Pr_s = Pr_w
        const shellNu = 1.04 * (shellRe ** 0.4) * (shellPr ** 0.36)
        console.log("shellNu", shellNu)
        const h_id = (shellNu * shellTC) / tubeOuterD
        //Baffle cut and spacing effect correction factor
        const J_c = 0.55 + 0.72 * F_c
        //To calculate the tube-to-baffle and baffle-to-shell leakage factor J_l from Table 9.2, we need to calculate r_s and r_lm as follows       
        const r_s = A_osb / (A_osb + A_otb)
        const r_lm = (A_osb + A_otb) / A_ocr
        const J_l = 0.44 * (1 - r_s) + (1 - 0.44 * (1 - r_s)) * Math.exp(-2.2 * r_lm)
        //Let us now calculate Jb using the formula from Table 9.2 after we determine C (for Res ¼ 326), rb, and Nþ ss as follows:
        const C = 1.25
        const N_ss = 1
        const r_b = A_obp / A_ocr
        const N_ssplus = N_ss / N_rcc
        const J_b = Math.exp(-1 * C * r_b * (1 - (2 * N_ssplus) ** (1 / 3)))
        //Now we compute L_iplus and L_oplus for determining unequal baffle spacing factor Js from Table 9.2.
        const L_iplus = 0.318 / 0.279
        const L_oplus = L_iplus
        const n = 0.6
        const J_s = (N_b - 1 + L_iplus ** (1 - n) + L_oplus ** (1 - n)) / (N_b - 1 + L_iplus + L_oplus)
        //Finally, the adverse temperature gradient factor Jr ¼ 1 for Res ¼ 326 > 100
        const J_r = 1
        //Since all correction factors J are determined, the actual shell-side heat transfer coefficient is given by
        const h_s = h_id * J_c * J_l * J_b * J_s * J_r
        console.log("h_s", h_s)
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
        console.log("A_ot", A_ot)
        console.log("tubeDV", tubeDV)
        console.log("tubeRe", tubeRe)

        const tubePr = (tubeKV * tubeSHC * tubeD) / tubeTC;
        //Nusselt number
        const tubeNu = 0.024 * tubeRe ** 0.8 * tubePr ** 0.4
        console.log("tubeNu", tubeNu)
        //Heat transfer coefficient
        const h_t = (tubeNu * tubeTC) / tubeInnerD
        console.log("h_t", h_t)
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
        //if (C_tube > C_shell) {
        let C_min = C_shell
        let C_max = C_tube
        //}
        if (C_tube <= C_shell) {
            C_min = C_tube
            C_max = C_shell
        }
        const C_star = C_min / C_max
        //Number of heat transfer units
        const NTU = overallHEcoeff * A_s / C_min
        //Heat exchanger effectiveness
        const coth = Math.cosh(NTU / Math.sqrt(2)) / Math.sinh(NTU / Math.sqrt(2))
        const HEeffectiveness = Math.sqrt(2) / (Math.sqrt(2) + coth)
        console.log("HEeffectiveness", HEeffectiveness)
        o.HEeffectiveness = HEeffectiveness.toFixed(6);

        //------------------Heat Transfer Rate and Exit Temperatures----------------------
        //Heat Transfer Rate
        const Q = HEeffectiveness * C_min * (shellIT - tubeIT)
        //Shell exit temperature
        const shellOT2 = shellIT - HEeffectiveness * C_star * (shellIT - tubeIT)
        console.log("shellOT", shellOT2)
        //Tube exit temperature
        const tubeOT2 = tubeIT + HEeffectiveness * C_star * (shellIT - tubeIT)
        console.log("tubeOT", tubeOT2)



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
            baffleCut: 0.0867, //this value is in mm, calc also in mm. Need to change to %
            centralBaffleSpacing: 0.279,
            recalculate: 1
        })
        this.calculate()
    }

 


    componentDidUpdate(prevProps, prevState) {
        if (this.props.data.recalculate) {
            this.props.handleSubmit({recalculate: 0});
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
                </div>
                <button onClick={() => console.log(this.state)}>log state</button>
            </div>
        );
    }
}

export default RatingResult;