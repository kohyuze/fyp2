
import * as dfd from 'danfojs';
import React, { Component } from 'react';
import PopUp from '../popup';


class SizingBatchInput extends Component {

    state = {
        // Initially, no file is selected
        selectedFile: null,
        popUp: false,
    };

    // On file select (from the pop up)
    onFileChange = event => {
        // Update the state
        this.setState({ selectedFile: event.target.files[0] });
    };

    // On file upload (click the upload button)
    onFileUpload = () => {
        // Create an object of formData
        const formData = new FormData();
        // Update the formData object
        formData.append(
            "myFile",
            this.state.selectedFile,
            this.state.selectedFile.name
        );

        // Details of the uploaded file
        // console.log(formData.get("myFile"));
        // console.log(this.state.selectedFile);
        // console.log(this.state)

        dfd.read_excel(formData.get("myFile")).then((df) => {
            df.print()

            const values = {
                //TEMA configs
                head: df.iloc({ rows: [2] }).$data[0][1],
                shell: df.iloc({ rows: [3] }).$data[0][1],
                rear: df.iloc({ rows: [4] }).$data[0][1],
                // fluids 
                shellFluid: df.iloc({ rows: [6] }).$data[0][1],
                tubeFluid: df.iloc({ rows: [12] }).$data[0][1],
                // constants for shell
                shellIT: Number(df.iloc({ rows: [7] }).$data[0][1]),
                shellOTreq: Number(df.iloc({ rows: [8] }).$data[0][1]),
                shellMFR: Number(df.iloc({ rows: [9] }).$data[0][1]),
                shellFF: Number(df.iloc({ rows: [10] }).$data[0][1]),
                // Constant for tube
                tubeIT: Number(df.iloc({ rows: [13] }).$data[0][1]),
                tubeOTreq: Number(df.iloc({ rows: [14] }).$data[0][1]),
                tubeMFR: Number(df.iloc({ rows: [15] }).$data[0][1]),
                tubeFF: Number(df.iloc({ rows: [16] }).$data[0][1]),
                // Constant for Constraints and physical Dimensions
                tubeInnerD: Number(df.iloc({ rows: [19] }).$data[0][1]),
                tubeOuterD: Number(df.iloc({ rows: [20] }).$data[0][1]),
                tubePitch: Number(df.iloc({ rows: [22] }).$data[0][1]),
                numberTube: Number(df.iloc({ rows: [18] }).$data[0][1]),
                numberPasses: Number(df.iloc({ rows: [25] }).$data[0][1]),
                layoutAngle: df.iloc({ rows: [23] }).$data[0][1],
                shellInnerDiameter: Number(df.iloc({ rows: [21] }).$data[0][1]),
                baffleCutPercent: Number(df.iloc({ rows: [27] }).$data[0][1]),
                numberBaffles: Number(df.iloc({ rows: [26] }).$data[0][1]),
                clearance: Number(df.iloc({ rows: [28] }).$data[0][1]),
                tubeMaterial: df.iloc({ rows: [24] }).$data[0][1],
            }
            this.props.handleSubmit(values);
            this.props.handleSubmit({recalculate: 1});
            this.setState({popUp: true})  
        })
        
        

    };
    
    
    // File content to be displayed after
    // file upload is complete
    fileData = () => {

        if (this.state.selectedFile) {

            return (
                <div>
                    <h2>File Details:</h2>
                    <p>File Name: {this.state.selectedFile.name}</p>
                    {/* <p>File Type: {this.state.selectedFile.type}</p> */}
                    <p>
                        Last Modified:{" "}
                        {this.state.selectedFile.lastModifiedDate.toDateString()}
                    </p>
                </div>
            );
        } else {
            return (
                <div>
                    <h4>Choose before Pressing the Upload button</h4>
                </div>
            );
        }
    };

    render() {

        return (
            <div>
                <h3>
                    Batch Input 
                    <p>
                        <a href="https://github.com/kohyuze/fluid-properties/blob/main/Sizing_batchinput.xlsx?raw=true" download >
                            Download sizing batch input form
                        </a>
                    </p>
                </h3>
                
                <div>
                    <input type="file" onChange={this.onFileChange} />
                    <button onClick={this.onFileUpload}>
                        Upload!
                    </button>
                </div>
                {this.fileData()}
                <PopUp open={this.state.popUp} onClose={() => this.setState({popUp: false})}>
                    <p className="popup-text">Updated!</p>
                </PopUp>
                
            </div>
        );
    }
}

export default SizingBatchInput;