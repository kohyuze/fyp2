


import * as dfd from 'danfojs';


export function interpolate(x, x1, x2, y1, y2) {
    return (y1 + ((x - x1) * (y2 - y1) / (x2 - x1)));
}


//fetch Ke and Kc values from my data, for pressure drop calculations
export function calculate_Kc_and_Ke(tubeRe, sigma, whichK, callback) {
    let pressureDropData = ''
    switch (whichK) {
        case 'Kc':
            pressureDropData = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/Kc.csv"
            break;
        case 'Ke':
            pressureDropData = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/Ke.csv"
            break;
        default:
            pressureDropData = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/Kc.csv"
            break;
    }

    dfd.read_csv(pressureDropData)
        .then(df => {
            //df.print()
            let sub_df_50k = df.query({ "column": "Re", "is": "==", "to": 50000 })
            let sub_df_10k = df.query({ "column": "Re", "is": "==", "to": 10000 })
            let sub_df_5k = df.query({ "column": "Re", "is": "==", "to": 5000 })
            let sub_df_3k = df.query({ "column": "Re", "is": "==", "to": 3000 })

            let K;
            if (Number(tubeRe) >= 50000) {
                let j = 0;
                while (sigma > Number(sub_df_50k.iloc({ rows: [j] }).$data[0][1])) {
                    j++
                }
                K = this.interpolate(
                    sigma,
                    Number(sub_df_50k.iloc({ rows: [j - 1] }).$data[0][1]),
                    Number(sub_df_50k.iloc({ rows: [j] }).$data[0][1]),
                    Number(sub_df_50k.iloc({ rows: [j - 1] }).$data[0][2]),
                    Number(sub_df_50k.iloc({ rows: [j] }).$data[0][2])
                )
                
                
            }
            else if (Number(tubeRe) >= 10000) {
                //this will be interpolating between 4 values. the Re value and sigma value.
                let j = 0;
                while (sigma > Number(sub_df_50k.iloc({ rows: [j] }).$data[0][1])) {
                    j++
                }
                let K_a = this.interpolate(
                    sigma,
                    Number(sub_df_50k.iloc({ rows: [j - 1] }).$data[0][1]),
                    Number(sub_df_50k.iloc({ rows: [j] }).$data[0][1]),
                    Number(sub_df_50k.iloc({ rows: [j - 1] }).$data[0][2]),
                    Number(sub_df_50k.iloc({ rows: [j] }).$data[0][2])
                )
                while (sigma > Number(sub_df_10k.iloc({ rows: [j] }).$data[0][1])) {
                    j++
                }
                let K_b = this.interpolate(
                    sigma,
                    Number(sub_df_10k.iloc({ rows: [j - 1] }).$data[0][1]),
                    Number(sub_df_10k.iloc({ rows: [j] }).$data[0][1]),
                    Number(sub_df_10k.iloc({ rows: [j - 1] }).$data[0][2]),
                    Number(sub_df_10k.iloc({ rows: [j] }).$data[0][2])
                )
                K = this.interpolate(
                    sigma,
                    10000,
                    50000,
                    K_a,
                    K_b
                )
                
            }
            else if (Number(tubeRe) >= 5000) {
                //this will be interpolating between 4 values. the Re value and sigma value.
                let j = 0;
                while (sigma > Number(sub_df_10k.iloc({ rows: [j] }).$data[0][1])) {
                    j++
                }
                let K_a = this.interpolate(
                    sigma,
                    Number(sub_df_10k.iloc({ rows: [j - 1] }).$data[0][1]),
                    Number(sub_df_10k.iloc({ rows: [j] }).$data[0][1]),
                    Number(sub_df_10k.iloc({ rows: [j - 1] }).$data[0][2]),
                    Number(sub_df_10k.iloc({ rows: [j] }).$data[0][2])
                )
                while (sigma > Number(sub_df_5k.iloc({ rows: [j] }).$data[0][1])) {
                    j++
                }
                let K_b = this.interpolate(
                    sigma,
                    Number(sub_df_5k.iloc({ rows: [j - 1] }).$data[0][1]),
                    Number(sub_df_5k.iloc({ rows: [j] }).$data[0][1]),
                    Number(sub_df_5k.iloc({ rows: [j - 1] }).$data[0][2]),
                    Number(sub_df_5k.iloc({ rows: [j] }).$data[0][2])
                )
                K = this.interpolate(
                    sigma,
                    5000,
                    10000,
                    K_a,
                    K_b
                )
                
            }
            else if (Number(tubeRe) >= 3000) {
                //this will be interpolating between 4 values. the Re value and sigma value.
                let j = 0;
                while (sigma > Number(sub_df_5k.iloc({ rows: [j] }).$data[0][1])) {
                    j++
                }
                let K_a = this.interpolate(
                    sigma,
                    Number(sub_df_5k.iloc({ rows: [j - 1] }).$data[0][1]),
                    Number(sub_df_5k.iloc({ rows: [j] }).$data[0][1]),
                    Number(sub_df_5k.iloc({ rows: [j - 1] }).$data[0][2]),
                    Number(sub_df_5k.iloc({ rows: [j] }).$data[0][2])
                )
                while (sigma > Number(sub_df_3k.iloc({ rows: [j] }).$data[0][1])) {
                    j++
                }
                let K_b = this.interpolate(
                    sigma,
                    Number(sub_df_3k.iloc({ rows: [j - 1] }).$data[0][1]),
                    Number(sub_df_3k.iloc({ rows: [j] }).$data[0][1]),
                    Number(sub_df_3k.iloc({ rows: [j - 1] }).$data[0][2]),
                    Number(sub_df_3k.iloc({ rows: [j] }).$data[0][2])
                )
                K = this.interpolate(
                    sigma,
                    5000,
                    3000,
                    K_a,
                    K_b
                )
                
            }
            else { //3000 and below
                let j = 0;
                while (sigma > Number(sub_df_3k.iloc({ rows: [j] }).$data[0][1])) {
                    j++
                }
                K = this.interpolate(
                    sigma,
                    Number(sub_df_3k.iloc({ rows: [j - 1] }).$data[0][1]),
                    Number(sub_df_3k.iloc({ rows: [j] }).$data[0][1]),
                    Number(sub_df_3k.iloc({ rows: [j - 1] }).$data[0][2]),
                    Number(sub_df_3k.iloc({ rows: [j] }).$data[0][2])
                )
                
            }
            
            callback(K);
        }).catch(err => {
            console.log(err);
        })
        
}