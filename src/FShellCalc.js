

// For the F shell exchanger, we have two-tube and two-shell passes by the use of a
// longitudinal baffle. If this baffle is not welded on both sides to the shell, there will
// be fluid leakage from the upstream to the downstream pass on the shell side due to 
// the pressure difference. Also, there will be heat leakage across the baffle by heat
// conduction from the hotter to colder side of the shell-side pass. These effects may
// not be negligible in some cases. If we neglect these effects, the Bell–Delaware
// method remains identical except that all flow and surface areas need to be reduced
// by half compared to a single shell-side pass.


// There is only 1 configuration for F shell exchangers.
// It will be a two pass pure counterflow arrangement.

// The method i used to calculate is essentially treating the F shell HX as 2 separate 1-1 E shell HX in counterflow, in series.

import * as math from 'mathjs';

export function FShellThermalCalculation(data, State, Length) {

    let {
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
        baffleCutPercent,
        centralBaffleSpacing,
        numberBaffles,
        clearance,
        tubeMaterialThermalConductivity,
        tubeLength,
        Kc,
        Ke
    } = data;

    // o is used to hold the calculated values before we return at the end of the function
    let o = {
        tubeHEcoeff: State.tubeHEcoeff,
        shellHEcoeff: State.shellHEcoeff,
        overallHEcoeff: State.overallHEcoeff,
        shellMeanT: State.shellMeanT, //first iteration's values are fetched using input temp, at Tab1Form
        newShellMeanT: State.newShellMeanT,
        tubeMeanT: State.tubeMeanT,   //further iterations, this value will be updated with the mean.
        newTubeMeanT: State.newTubeMeanT,
        HEeffectiveness: State.HEeffectiveness,
        shellOT: State.shellOT,
        tubeOT: State.tubeOT,
    }

    if (Length) { //this is here for sizing calculation
        tubeLength = Length
    }

    //------------------Rating problem-----------------------
    ////////////////////Geometrical Calculations, Shah 594/////////////////////////
    //Assumptions: The shell-and-tube heat exchanger is assumed to have the ideal geometrical
    //characteristics summarized in Section 8.5


    // calculate the centralBaffleSpacing from the numberBaffles
    centralBaffleSpacing = Math.abs((tubeLength - 2 * clearance)/(numberBaffles - 1) - 0.003 )//3mm acounts for the thickness of the baffle
    // console.log("Baffle Spacing ", centralBaffleSpacing)

    

    let X_l, X_t;
    //Determination of Longitudinal_tube_pitch and Traverse_tube_pitch from table 8.1, shah pg568
    switch (layoutAngle) {
        case 'triangular':
            X_t = tubePitch
            X_l = (Math.sqrt(3) / 2) * tubePitch
            break;
        // case 'rotated-triangular':
        //     X_t = Math.sqrt(3) * tubePitch
        //     X_l = 0.5 * tubePitch
        //     break;
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

    //Convert the baffle cut from percent to meters. The value is then halfed since it is an F shell.
    const baffleCut = baffleCutPercent/100 * shellInnerDiameter * 0.5

    //Window Section. Let us start the calculations with computing the angle θb from Eq.(8.112):
    const θ_b = 2 * Math.acos(1 - (2 * baffleCut / shellInnerDiameter)); //rad

    //Then the gross window area A_frw from Eq. (8.111) is
    const A_frw = ((shellInnerDiameter ** 2) / 4) * (θ_b / 2 - (1 - (2 * baffleCut / shellInnerDiameter)) * Math.sin(θ_b / 2));

    //Area of the semi circle
    const A_semi = 0.5 * ((shellInnerDiameter ** 2) / 4) * Math.PI

    // Modeled E shell diameter (this is the E shell that we imagine to replace the half of F shell)
    const shellInnerDiameter_new = (A_semi * 4 / Math.PI) ** 0.5
    const D_otl = shellInnerDiameter_new - 0.015 //Diameter of the outer tube limit, can add to input, or we decide ourself just take D-15mm
    
    // From the above, we have obtained the info we need to recreate an "E shell" to replace the F shell half.

    //In order to calculate the fraction Fw of total tubes in the window section, first compute
    //the baffle cut angle, using Eq. (8.114), as
    const D_ctl = D_otl - tubeOuterD
    const θ_ctl = 2 * Math.acos((shellInnerDiameter_new - 2 * baffleCut) / D_ctl);

    //Now the fraction Fw of total tubes in the window section is given by Eq. (8.113) as
    const F_w = (θ_ctl / (2 * Math.PI)) - (Math.sin(θ_ctl) / (2 * Math.PI))

    //Consequently, the number of tubes in the window section, from Eq. (8.115), is
    const N_tw = F_w * numberTube * 0.5 // halfed since only half the tubes are in one side of F shell

    //The area occupied by tubes in the window section, Eq. (8.116), is
    const A_frt = (Math.PI / 4) * (tubeOuterD ** 2) * N_tw

    //The net flow area in one window section is then, from Eq. (8.117)
    const A_ow = A_frw - A_frt

    //The hydraulic diameter for the window section is given by Eq. (8.118) as
    const D_hw = (4 * A_ow) / (Math.PI * tubeOuterD * N_tw + Math.PI * shellInnerDiameter_new * (θ_b / (2 * Math.PI)));

    //Finally, the number of effective tube rows in crossflow in each window is computed using Eq. (8.119) as
    const N_rcw = Math.round((0.8 / X_l) * (baffleCut - 0.5 * (shellInnerDiameter_new - D_ctl)))

    //Crossflow Section. The fraction Fc of the total number of tubes in the crossflow section is calculated from Eq. (8.120) as
    const F_c = 1 - 2 * F_w

    //Next calculate the number of tube rows Nrcc crossed during flow through one crossflow
    //section between the baffle tips [Eq. (8.121)] as
    const N_rcc = Math.round((shellInnerDiameter_new - 2 * baffleCut) / X_l)

    //The crossflow area at or near the shell centerline for one crossflow section may be estimated from A_ocr
    //There are different calculations for A_ocr for different conditions, see shah pg 592
    let A_ocr
    if (layoutAngle === 'triangular' || layoutAngle === 'square') {
        A_ocr = (shellInnerDiameter_new - D_otl + (D_ctl / X_t) * (X_t - tubeOuterD)) * centralBaffleSpacing //eqn 8.122
    }
    else if (layoutAngle === 'rotated-square' && tubePitch / tubeOuterD >= 1.707) {
        A_ocr = (shellInnerDiameter_new - D_otl + (D_ctl / X_t) * (X_t - tubeOuterD)) * centralBaffleSpacing //eqn 8.122
    }
    else if (layoutAngle === 'rotated-triangular' && tubePitch / tubeOuterD >= 3.732) {
        A_ocr = (shellInnerDiameter_new - D_otl + (D_ctl / X_t) * (X_t - tubeOuterD)) * centralBaffleSpacing //eqn 8.122
    }
    else if (layoutAngle === 'rotated-triangular' || layoutAngle === 'rotated-square') {
        A_ocr = centralBaffleSpacing * (shellInnerDiameter_new - D_otl + 2 * (D_ctl / X_t) * (tubePitch - tubeOuterD)) //eqn 8.123
    }
    //we shall not account for finned tubes


    //Now, compute the number of baffles from Eq. (8.126) as
    const N_b = numberBaffles
    //Math.floor((tubeLength - clearance - clearance) / centralBaffleSpacing + 1)

    //Bypass and Leakage Flow Areas. To calculate the fraction of crossflow area available for
    //flow bypass, Fbp [Eq. (8.127)], we first have to calculate the magnitude of crossflow area
    //for flow bypass:
    const Width_bypass_lane = 0.019 //assumed, can let user input, or can derive from tubePitch
    const A_obp = centralBaffleSpacing * (shellInnerDiameter_new - D_otl) // + (0.5 * numberPasses * Width_bypass_lane)) // No bypass lane in my illustration

    //Consequently,
    const F_bp = A_obp / A_ocr

    //Tube to baffle hole diametral clearance = baffle hole diameter - tube outside diameter. pg593
    const 𝛿_tb = 0.000794 //this small value is assumed. Can consider having user input it.
    //Tube-to-baffle leakage area is now given by Eq. (8.129) as follows
    const A_otb = (Math.PI * tubeOuterD * 𝛿_tb * numberTube * (1 - F_w)) / 2

    // shell-to-baffle leakage area for one baffle = gap between the shell inside diameter and the baffle. pg593
    const 𝛿_sb = 0.002946 //this small value is assumed. Can consider having user input it.
    //Finally, the shell-to-baffle leakage area for one baffle [Eq. (8.130)] is
    const A_osb = Math.PI * shellInnerDiameter_new * (𝛿_sb / 2) * (1 - θ_b / (2 * Math.PI))

    //This concludes all geometrical characteristics needed for the thermal design/rating of a
    //shell-and-tube heat exchanger using the Bell–Delaware method.


    const k_w = tubeMaterialThermalConductivity //thermal conductivity of tube wall. user input.

    
    //////////////Thermal calculations, Shah pg653//////////////////////////
    //-----Shell-Side Heat Transfer Coefficient-----------------------
    //Determination of the flow velocity in the shell
    const shellMassVelocity = shellMFR / A_ocr;
    //// console.log("shellMassVelocity", shellMassVelocity)
    //Determination of the Reynolds number
    const shellRe = (shellMassVelocity * tubeOuterD) / shellDV;
    //// console.log("shellRe", shellRe)
    //Calculation of the Pr number
    const shellPr = (shellKV * shellSHC * shellD) / shellTC;
    //Now we compute Nus from the given correlation with Re_d = Re_s. Note that we have not calculated T_w, 
    //so we cannot calculate Pr_w. So in this iteration, we consider Pr_s = Pr_w
    const shellNu = 1.04 * (shellRe ** 0.4) * (shellPr ** 0.36)
    //// console.log("shellNu", shellNu)
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
    const L_iplus = clearance / centralBaffleSpacing
    const L_oplus = clearance / centralBaffleSpacing
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
    o.shellHEcoeff = h_s.toFixed(2);

    //-----Tube-Side Heat Transfer Coefficient-----------------------
    //Number of tubes per pass
    const N_tp = numberTube / 2 //F shell is fixed with 2 passes. 1 pass per "E shell".
    //Tube-side flow area per pass
    const A_ot = (Math.PI / 4) * tubeInnerD ** 2 * N_tp
    //Tube-side Reynolds number
    const tubeRe = (tubeMFR * tubeInnerD) / (A_ot * tubeDV)
    o.tubeRe = tubeRe
    // // console.log("A_ot", A_ot)
    //// console.log("tubeDV", tubeDV)
    //// console.log("tubeRe", tubeRe)

    const tubePr = (tubeKV * tubeSHC * tubeD) / tubeTC;
    //Nusselt number
    const tubeNu = 0.024 * tubeRe ** 0.8 * tubePr ** 0.4
    //// console.log("tubeNu", tubeNu)
    //Heat transfer coefficient
    const h_t = (tubeNu * tubeTC) / tubeInnerD
    //// console.log("h_t", h_t)
    o.tubeHEcoeff = h_t.toFixed(2);

    //---------------Overall Heat Transfer Coefficient------------
    const U_inverse = (1 / h_s) + shellFF + ((tubeOuterD * Math.log(tubeOuterD / tubeInnerD)) / (2 * k_w)) + tubeFF * (tubeOuterD / tubeInnerD) + (1 / h_t) * (tubeOuterD / tubeInnerD)
    const overallHEcoeff = 1 / U_inverse
    //// console.log("overallHEcoeff", overallHEcoeff)
    o.overallHEcoeff = overallHEcoeff.toFixed(2);

    //------------- Heat Transfer Effectiveness------------------
    //Total tube outside heat transfer area
    const A_s = Math.PI * tubeLength * tubeOuterD * numberTube/2 //one Eshell has half the tubes(on each side of longitudinal baffle)v
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
    //Heat exchanger effectiveness for pure counter flow (table 3.3)
    let HEeffectiveness;
    if (C_star > 0.95 && C_star < 1.05) { //approximately = 1
        HEeffectiveness = NTU / (1 + NTU)
    } else {
        const exp = Math.exp(-1*NTU*(1-C_star))
        HEeffectiveness = (1 - exp)/(1 - C_star*exp)
    }
    
    // console.log("HEeffectiveness", HEeffectiveness)
    o.HEeffectiveness = HEeffectiveness.toFixed(2);

    //------------------Heat Transfer Rate and Exit Temperatures----------------------
    // Refer to report on this segment. Pg ___

    let T_ti, T_to, T_si, T_so, T_1, T_2 = 0; //initial value.
    let C_t, C_s; 

    T_ti = tubeIT;
    C_t = C_tube
    T_si = shellIT;
    C_s = C_shell

    // console.log("ShellIT ", shellIT)
    // console.log("TubeIT ", tubeIT)

    const EC = HEeffectiveness * C_min
    let matrixA = math.matrix([[-1*C_t, 0, 0, 0], 
                                 [0, 0, C_s, 0],
                                 [-1*(EC-C_t), -C_t, EC, 0],
                                 [-1*EC, 0, EC-C_s, C_s]]);
    
    let matrixB = math.matrix([[(EC - C_t) * T_ti - EC*T_si], 
                                 [EC * T_ti - (EC - C_s) * T_si],
                                 [0],
                                 [0]]);
    
    let matrixX
    // // console.log("determinant",math.det(matrixA))
    if (math.det(matrixA) > 0.1 || math.det(matrixA) < -0.1) { //to avoid determinant=0 error
        matrixX = math.multiply(math.inv(matrixA), matrixB); 

        T_1 = matrixX.get([0, 0])
        T_to = matrixX.get([1, 0])
        T_2 = matrixX.get([2, 0])
        T_so = matrixX.get([3, 0])

        // console.log(matrixX)
        // console.log("T_ti", T_ti)
        // console.log("T1", T_1)
        // console.log("T_to", T_to)
        // console.log("T_si", T_si)
        // console.log("T2", T_2)
        // console.log("T_so", T_so)
    }                
   

    //Heat Transfer Rate
    const Q = C_s * Math.abs(T_si - T_so)
    o.Q = Q.toFixed(2)

    //Exit temperature
    let shellOT2, tubeOT2;
    shellOT2 = Number(T_so)
    tubeOT2 = Number(T_to)

    o.shellOT = shellOT2.toFixed(2);
    o.tubeOT = tubeOT2.toFixed(2);

    //check mean temp, if difference is more than 1°C, we iterate again
    o.newShellMeanT = (shellOT2 + shellIT) / 2
    o.newTubeMeanT = (tubeOT2 + tubeIT) / 2
    // console.log("newShellMeanT " + o.newShellMeanT)
    // console.log("shellMeanT " + o.shellMeanT)
    // console.log("newTubeMeanT " + o.newTubeMeanT)
    // console.log("tubeMeanT " + o.tubeMeanT)

    // console.log("ShellOT ", shellOT2)
    // console.log("TubeOT ", tubeOT2)

    //------------------Shell side pressure drop shah pg656----------------------
    const b = 6.59 / (1 + 0.14 * shellRe ** 0.52)
    const F_id = 3.5 * (1.33 * (tubeOuterD / tubePitch)) ** b * shellRe ** (-0.476)

    //the ideal pressure drop without correction
    //assuming the wall viscosity is v similar to bulk vioscosity
    const deltaP_bid = (4 * F_id * shellMassVelocity ** 2 * N_rcc) / (2 * shellD)  *1.2 //this adds 20% cos my calculations always underestimate due to difference in values used

    //finding the correction factors ζ_b, ζ_l and ζ_s
    let ζ_b
    if (N_ssplus >= 0.5) { ζ_b = 1 }
    else {
        let D;
        if (shellRe > 100) { D = 3.7 }
        else { D = 4.5 }
        ζ_b = Math.exp(-1 * D * r_b * (1 - (2 * N_ssplus) ** (1 / 3)))
    }

    const p = -0.15 * (1 + r_s) + 0.8
    const ζ_l = Math.exp(-1.33 * (1+r_s) *  r_lm ** p)

    const n_prime = 0.2 //assuming turbulent flow. I think quite unlikely for laminar flow in shell side leh.
    const ζ_s = (centralBaffleSpacing/clearance)**(2 - n_prime) + (centralBaffleSpacing/clearance)**(2 - n_prime)

    // finding the deltaPs
    const deltaP_cr = deltaP_bid * (N_b - 1) * ζ_b * ζ_l
    const G_w = shellMFR/((A_ocr * A_ow)**0.5)
    const deltaP_w = N_b * (2 + 0.6* N_rcw) * ((G_w**2) / (2 * shellD)) * ζ_l
    const deltaP_io = 2 * deltaP_bid * (1 + (N_rcw/N_rcc)) * ζ_b * ζ_s

    const shellPressureDrop = (deltaP_cr + deltaP_w + deltaP_io) * 2 //since F shell is 2 shells
    o.shellPressureDrop = shellPressureDrop.toFixed(2)

    //------------------Tube side pressure drop shah pg657----------------------
    const frictionFactor = 0.046 * tubeRe ** -0.2; //eqn 7.72

    const sigma = (2 * (tubePitch - tubeOuterD)) / (1.414 * tubePitch)
    o.sigma = sigma

    //we'll only do the calculations when Kc and Ke are updated with their values
    if ((typeof Kc !== "undefined") && (typeof Ke !== "undefined")) {
        // eqn from Shah pg 658. its too long so I break it up.
        const entranceEffect = 1 - sigma ** 2 + Kc
        const exitEffect = 1 - sigma ** 2 - Ke
        const coeff_in_front = tubeMFR ** 2 / (2 * tubeD * A_ot ** 2)
        const firstTerm = (4 * frictionFactor * tubeLength / tubeInnerD)
        const tubePressureDrop = coeff_in_front * (firstTerm + entranceEffect - exitEffect) * numberPasses
        o.tubePressureDrop = tubePressureDrop.toFixed(2)
        // console.log("tubePressureDrop ", tubePressureDrop)
    }

    return (o)
}