


import * as dfd from 'danfojs';


export function interpolate(x, x1, x2, y1, y2) {
    return (y1 + ((x - x1) * (y2 - y1) / (x2 - x1)));
}


//After fluid and temperature are given, the properties are fetched
export function fetchProperties(AveT, fluid, callback) {
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
        case '50% Ethylene Glycol':
            fluidProperties = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/50%25%20Ethylene%20Glycol.csv"
            break;
        case 'Ethylene Glycol':
            fluidProperties = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/Ethylene%20Glycol.csv"
            break;
        case 'Glycerin':
            fluidProperties = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/Glycerin.csv"
            break;
        default:
            //think of a way to catch this error
            fluidProperties = "https://raw.githubusercontent.com/kohyuze/fluid-properties/main/SteamTable"
            console.log("ERROR: Default steam table used for fluid properties.")
    }

    dfd.read_csv(fluidProperties)
        .then(df => {
            //first we read the entire table, then we pick out only the temp and specific columns
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

            const Properties = [density.toPrecision(4), specificHeat.toPrecision(4), dynamicVis.toPrecision(4), kinematicVis.toPrecision(4), therConductivity.toPrecision(4)];
            console.log(Properties)
            callback(Properties);
        }).catch(err => {
            console.log(err);
        })
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