// The method i used to calculate is essentially treating the G shell HX as 2 separate F shell HXs in parallel on the shell side, which means 4 E shells.

import * as math from 'mathjs';


export function GShellThermalCalculation(data, State, Length) {
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

    //for G shells, tube length needs to be halved, massFlowRate needs to be halved too.
    let tubeLengthPerSide = 0.5 * tubeLength
    let shellMFRPerSide = 0.5 * shellMFR

    // calculate the centralBaffleSpacing from the numberBaffles
    let numberBafflesPerSide = Math.floor(numberBaffles/2)
    centralBaffleSpacing = Math.abs((tubeLengthPerSide - 2 * clearance)/(numberBafflesPerSide - 1) - 0.003) //3mm acounts for the thickness of the baffle
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

    //Convert the baffle cut from percent to meters. The value is then halfed since there is a longitudinal baffle.
    const baffleCut = baffleCutPercent / 100 * shellInnerDiameter * 0.5

    //Window Section. Let us start the calculations with computing the angle ??b from Eq.(8.112):
    const ??_b = 2 * Math.acos(1 - (2 * baffleCut / shellInnerDiameter)); //rad

    //Then the gross window area A_frw from Eq. (8.111) is
    const A_frw = ((shellInnerDiameter ** 2) / 4) * (??_b / 2 - (1 - (2 * baffleCut / shellInnerDiameter)) * Math.sin(??_b / 2));

    //Area of the semi circle
    const A_semi = 0.5 * ((shellInnerDiameter ** 2) / 4) * Math.PI

    // Modeled E shell diameter (this is the E shell that we imagine to replace the half of F shell)
    const shellInnerDiameter_new = (A_semi * 4 / Math.PI) ** 0.5
    const D_otl = shellInnerDiameter_new - 0.015 //Diameter of the outer tube limit, can add to input, or we decide ourself just take D-15mm

    // From the above, we have obtained the info we need to recreate an "E shell" to replace the F shell half.

    //In order to calculate the fraction Fw of total tubes in the window section, first compute
    //the baffle cut angle, using Eq. (8.114), as
    const D_ctl = D_otl - tubeOuterD
    const ??_ctl = 2 * Math.acos((shellInnerDiameter_new - 2 * baffleCut) / D_ctl);

    //Now the fraction Fw of total tubes in the window section is given by Eq. (8.113) as
    const F_w = (??_ctl / (2 * Math.PI)) - (Math.sin(??_ctl) / (2 * Math.PI))

    //Consequently, the number of tubes in the window section, from Eq. (8.115), is
    const N_tw = F_w * numberTube * 0.5 // halfed since only half the tubes are in one side of F shell

    //The area occupied by tubes in the window section, Eq. (8.116), is
    const A_frt = (Math.PI / 4) * (tubeOuterD ** 2) * N_tw

    //The net flow area in one window section is then, from Eq. (8.117)
    const A_ow = A_frw - A_frt

    //The hydraulic diameter for the window section is given by Eq. (8.118) as
    const D_hw = (4 * A_ow) / (Math.PI * tubeOuterD * N_tw + Math.PI * shellInnerDiameter_new * (??_b / (2 * Math.PI)));

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
    const N_b = numberBafflesPerSide
    //Math.floor((tubeLengthPerSide - clearance - clearance) / centralBaffleSpacing + 1)
    // console.log("Nb", N_b)

    //Bypass and Leakage Flow Areas. To calculate the fraction of crossflow area available for
    //flow bypass, Fbp [Eq. (8.127)], we first have to calculate the magnitude of crossflow area
    //for flow bypass:
    const Width_bypass_lane = 0.019 //assumed, can let user input, or can derive from tubePitch
    const A_obp = centralBaffleSpacing * (shellInnerDiameter_new - D_otl) // + (0.5 * numberPasses * Width_bypass_lane)) // No bypass lane in my illustration

    //Consequently,
    const F_bp = A_obp / A_ocr

    //Tube to baffle hole diametral clearance = baffle hole diameter - tube outside diameter. pg593
    const ????_tb = 0.000794 //this small value is assumed. Can consider having user input it.
    //Tube-to-baffle leakage area is now given by Eq. (8.129) as follows
    const A_otb = (Math.PI * tubeOuterD * ????_tb * numberTube * (1 - F_w)) / 2

    // shell-to-baffle leakage area for one baffle = gap between the shell inside diameter and the baffle. pg593
    const ????_sb = 0.002946 //this small value is assumed. Can consider having user input it.
    //Finally, the shell-to-baffle leakage area for one baffle [Eq. (8.130)] is
    const A_osb = Math.PI * shellInnerDiameter_new * (????_sb / 2) * (1 - ??_b / (2 * Math.PI))

    //This concludes all geometrical characteristics needed for the thermal design/rating of a
    //shell-and-tube heat exchanger using the Bell???Delaware method.


    const k_w = tubeMaterialThermalConductivity //thermal conductivity of tube wall. user input. 


    //////////////Thermal calculations, Shah pg653//////////////////////////
    //-----Shell-Side Heat Transfer Coefficient-----------------------
    //Determination of the flow velocity in the shell
    const shellMassVelocity = shellMFRPerSide / A_ocr;
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
    //Let us now calculate Jb using the formula from Table 9.2 after we determine C (for Res ?? 326), rb, and N?? ss as follows:
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
    //Finally, the adverse temperature gradient factor Jr ?? 1 for Res ?? 326 > 100
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
    const N_tp = numberTube / numberPasses
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
    const A_s = Math.PI * tubeLengthPerSide * tubeOuterD * numberTube / 2 //one Eshell has half the tubes(on each side of longitudinal baffle)
    const C_tube = tubeMFR * tubeSHC
    const C_shell = shellMFRPerSide * shellSHC
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
    let HEeffectiveness_counterflow;
    if (C_star > 0.95 && C_star < 1.05) { //approximately = 1
        HEeffectiveness_counterflow = NTU / (1 + NTU)
    } else {
        const exp = Math.exp(-1 * NTU * (1 - C_star))
        HEeffectiveness_counterflow = (1 - exp) / (1 - C_star * exp)
    }

    //Heat exchanger effectiveness for parallel flow (table 3.3)
    let HEeffectiveness_parallelflow;
    if (C_star > 0.95 && C_star < 1.05) { //approximately = 1
        HEeffectiveness_parallelflow = 0.5 * (1 - Math.exp(-1 * NTU))
    } else {
        const exp = Math.exp(-1 * NTU * (1 + C_star))
        HEeffectiveness_parallelflow = (1 - exp) / (1 + C_star)
    }

    // // console.log("HEeffectiveness", HEeffectiveness)
    // o.HEeffectiveness = HEeffectiveness.toFixed(2);

    //------------------Heat Transfer Rate and Exit Temperatures----------------------
    // Refer to report on this segment. Pg ___

    let T_ti, T_to, T_si, T_soa, T_sob, T_so, T_1, T_2, T_3, T_4, T_5, T_6, T_7, T_8, T_9  = 0; //initial value.
    let C_t, C_s; 

    T_ti = tubeIT;
    C_t = C_tube
    T_si = shellIT;
    C_s = C_shell

    // console.log("ShellIT ", shellIT)
    // console.log("TubeIT ", tubeIT)

    const EC_c = HEeffectiveness_counterflow * C_min
    const EC_p = HEeffectiveness_parallelflow * C_min

    let matrixA, matrixB, matrixX

    switch (Number(numberPasses)) {
        case 1:
            matrixA = math.matrix([[0, 0, 0, 0, C_s, 0],
                                    [0, 0, 0, -EC_p, 0, C_s],
                                    [0, C_s, 0, 0, EC_p-C_s, 0],
                                    [0, 0, C_s, -EC_c, 0, EC_c-C_s],
                                    [0, C_s, 0, C_t, 0, 0],                                    
                                    [C_t, 0, C_s, -C_t, 0, 0]]);

            matrixB = math.matrix([[(C_s - EC_c) * T_si + EC_c * T_ti],
                                    [(C_s - EC_p) * T_si],
                                    [EC_p * T_ti],
                                    [0],
                                    [C_s * T_si + C_t * T_ti],
                                    [C_s * T_si]]);

            if (math.det(matrixA) > 0.1 || math.det(matrixA) < -0.1) { //to avoid determinant=0 error
                matrixX = math.multiply(math.inv(matrixA), matrixB);

                T_to = matrixX.get([0, 0])
                T_soa = matrixX.get([1, 0])
                T_sob = matrixX.get([2, 0])
                T_1 = matrixX.get([3, 0])
                T_2 = matrixX.get([4, 0])
                T_3 = matrixX.get([5, 0])

                T_so = (T_soa + T_sob) / 2
            }
            break
        case 2:
            matrixA = math.matrix([[0, 0, 0, -C_t, 0, 0, EC_p, 0],
                                    [0, C_s, 0, C_t, 0, 0, -C_s, 0],
                                    [0, 0, 0, C_t - EC_c, -C_t, 0, 0, EC_c],
                                    [0, 0, C_s, -C_t, C_t, 0, 0, -C_s],
                                    [0, 0, 0, 0, (EC_c - C_t), C_t, 0, 0],
                                    [0, 0, 0, 0, -C_t, C_t, 0, C_s],
                                    [C_t, 0, 0, 0, 0, (EC_p-C_t), 0, 0],
                                    [C_t, 0, 0, 0, 0, -C_t, C_s, 0]]);

            matrixB = math.matrix([[(EC_p-C_t)*T_ti],
                                    [C_t * T_ti],
                                    [0],
                                    [0],
                                    [EC_c * T_si],
                                    [C_s * T_si],
                                    [EC_p*T_si],
                                    [C_s * T_si]]);

            if (math.det(matrixA) > 0.1 || math.det(matrixA) < -0.1) { //to avoid determinant=0 error
                matrixX = math.multiply(math.inv(matrixA), matrixB);
        
                T_to = matrixX.get([0, 0])
                T_soa = matrixX.get([1, 0])
                T_sob = matrixX.get([2, 0])
                T_1 = matrixX.get([3, 0])
                T_2 = matrixX.get([4, 0])
                T_3 = matrixX.get([5, 0])
                T_4 = matrixX.get([6, 0])
                T_5 = matrixX.get([7, 0])
        
                T_so = (T_soa + T_sob)/2       
            }
            break
        case 4:
            matrixA = math.matrix([[0, 0, 0, -C_t, 0, 0, 0, 0, 0, 0, EC_p, 0],
                                    [0, 0, 0, C_t-EC_c, -C_t, 0, 0, 0, 0, 0, 0, EC_c],
                                    [0, 0, 0, 0, C_t-EC_p, -C_t, 0, 0, 0, 0, 0, EC_p],
                                    [0, 0, 0, 0, 0, C_t-EC_c, -C_t, 0, 0, 0, EC_c, 0],
                                    [0, 0, 0, 0, 0, 0, EC_c-C_t, C_t, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, EC_p-C_t, C_t, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, EC_c-C_t, C_t, 0, 0],
                                    [C_t, 0, 0, 0, 0, 0, 0, 0, 0, EC_p-C_t, 0, 0],
                                    [0, C_s, 0, C_t, 0, -C_t, C_t, 0, 0, 0, -C_s, 0],
                                    [0, 0, C_s, -C_t, 0, C_t, 0, 0, 0, 0, 0, -C_s],
                                    [C_t, 0, 0, 0, 0, 0, -C_t, C_t, 0, -C_t, C_s, 0],                                    
                                    [0, 0, 0, 0, 0, 0, 0, -C_t, 0, C_t, 0, C_s]]);

            matrixB = math.matrix([[(EC_p-C_t)*T_ti],
                                    [0],
                                    [0],
                                    [0],
                                    [EC_c*T_si],
                                    [EC_p*T_si],
                                    [EC_c*T_si],
                                    [EC_p*T_si],
                                    [C_t*T_ti],
                                    [0],
                                    [C_s*T_si],
                                    [C_s*T_si]]);

            if (math.det(matrixA) > 0.1 || math.det(matrixA) < -0.1) { //to avoid determinant=0 error
                matrixX = math.multiply(math.inv(matrixA), matrixB);

                T_to = matrixX.get([0, 0])
                T_soa = matrixX.get([1, 0])
                T_sob = matrixX.get([2, 0])
                T_1 = matrixX.get([3, 0])
                T_2 = matrixX.get([4, 0])
                T_3 = matrixX.get([5, 0])
                T_4 = matrixX.get([6, 0])
                T_5 = matrixX.get([7, 0])
                T_6 = matrixX.get([8, 0])
                T_7 = matrixX.get([9, 0])
                T_8 = matrixX.get([10, 0])
                T_9 = matrixX.get([11, 0])

                T_so = (T_soa + T_sob) / 2
            }
            break
        default:
            // console.log("G Shell calculation numberPasses invalid.")
            break
    }

    

    

    // // console.log(matrixX)
    // console.log("T_ti", T_ti)
    // console.log("T_to", T_to)
    // console.log("T_si", T_si)
    // console.log("T_so", T_so)
    // console.log("T_1", T_1)
    // console.log("T_2", T_2)
    // console.log("T_3", T_3)
    // // console.log("T_4", T_4)
    // // console.log("T_5", T_5)
    // // console.log("T_6", T_6)
    // // console.log("T_7", T_7)
    // // console.log("T_8", T_8)
    // // console.log("T_9", T_9)
    // // console.log("T_3", T_3)
    // console.log("T_soa", T_soa)
    // console.log("T_sob", T_sob)


    //Heat Transfer Rate
    const Q = C_s * Math.abs(T_si - T_so)
    o.Q = Q.toFixed(2)

    //Exit temperature
    let shellOT2, tubeOT2;

    shellOT2 = Number(T_so)
    tubeOT2 = Number(T_to)

    o.shellOT = shellOT2.toFixed(2);
    o.tubeOT = tubeOT2.toFixed(2);

    //check mean temp, if difference is more than 1??C, we iterate again
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

    //finding the correction factors ??_b, ??_l and ??_s
    let ??_b
    if (N_ssplus >= 0.5) { ??_b = 1 }
    else {
        let D;
        if (shellRe > 100) { D = 3.7 }
        else { D = 4.5 }
        ??_b = Math.exp(-1 * D * r_b * (1 - (2 * N_ssplus) ** (1 / 3)))
    }

    const p = -0.15 * (1 + r_s) + 0.8
    const ??_l = Math.exp(-1.33 * (1 + r_s) * r_lm ** p)

    const n_prime = 0.2 //assuming turbulent flow. I think quite unlikely for laminar flow in shell side leh.
    const ??_s = (centralBaffleSpacing / clearance) ** (2 - n_prime) + (centralBaffleSpacing / clearance) ** (2 - n_prime)

    // finding the deltaPs
    const deltaP_cr = deltaP_bid * (N_b - 1) * ??_b * ??_l
    const G_w = shellMFRPerSide / ((A_ocr * A_ow) ** 0.5)
    const deltaP_w = N_b * (2 + 0.6 * N_rcw) * ((G_w ** 2) / (2 * shellD)) * ??_l
    const deltaP_io = 2 * deltaP_bid * (1 + (N_rcw / N_rcc)) * ??_b * ??_s

    const shellPressureDrop = (deltaP_cr + deltaP_w + deltaP_io) * 2 //since F shell is 2 shells
    o.shellPressureDrop = shellPressureDrop.toFixed(2)

    //------------------Tube side pressure drop shah pg657----------------------
    //need to use back the original full tube length

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
        // console.log("shellPressureDrop ", shellPressureDrop)
        // console.log("tubePressureDrop ", tubePressureDrop)
    }

    return (o)
}