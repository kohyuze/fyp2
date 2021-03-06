import React, { Component } from 'react';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import PopUp from '../popup';

const MyTextInput = ({ label, ...props }) => {
    // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
    // which we can spread on <input>. We can use field meta to show an error
    // message if the field is invalid and it has been touched (i.e. visited)
    const [field, meta] = useField(props);
    return (
        <>
            <div className="form">
                {/* <label htmlFor={props.id || props.name}>{label}</label> */}
                <input className="input" {...field} {...props} />
                <p className="units">{props.unit}</p>
                {meta.touched && meta.error ? (<div className="error">{meta.error}</div>) : null}
            </div>

        </>
    );
};

const MySelect = ({ label, ...props }) => {
    const [field, meta] = useField(props);
    return ( //do something about the styling pls
        <div className="form">
            {/* <label htmlFor={props.id || props.name}>{label}</label> */}
            <select className="input" {...field} {...props} />
            {meta.touched && meta.error ? (<div className="error">{meta.error}</div>) : null}
        </div>
    );
};

class SizingTab1Form extends React.Component {
    constructor(props) {
        super(props);
        //this.handleChange = this.handleChange.bind(this);
        //state is just for the popup box
        this.state = {
            popUp: false,
        }
    }
    render() {
        return (
            <div className='formContainer' >
                {/* the error message sucks, pls fix in future */}
                <Formik
                    initialValues={{}}
                    validationSchema={
                        Yup.object({
                            shellIT: Yup.number(),
                            shellOTreq: Yup.number(),
                            shellMFR: Yup.number(),
                            shellFF: Yup.number(),
                            tubeIT: Yup.number(),
                            tubeMFR: Yup.number(),
                            tubeOTreq: Yup.number(),
                            tubeFF: Yup.number(),
                        })
                    }
                    onSubmit={(values, { setSubmitting }) => {
                        this.props.handleSubmit(values);
                        this.props.handleSubmit({tubeLength: 0}); 
                        this.props.handleSubmit({iteration: 0});
                        this.props.updateShellProperties(this.props.formData.shellIT,this.props.formData.shellFluid);
                        this.props.updateTubeProperties(this.props.formData.tubeIT,this.props.formData.tubeFluid);
                        // this.props.handleSubmit({recalculate: 1}); //no need cos updateProperties alr have this                                                
                        setSubmitting(false);
                        this.setState({popUp: true})   
                        
                        
                    }}
                >
                    <Form>
                        <h2 className='categoryHeader'>TEMA</h2>
                        <div>
                            <MySelect label="Head" name="head" >
                                <option value="">Select head</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                            </MySelect>
                            <MySelect label="Shell" name="shell">
                                <option value="">Select shell</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                                <option value="G">G</option>
                                <option value="H">H</option>
                                <option value="J">J</option>
                            </MySelect>
                            <MySelect label="Rear" name="rear" >
                                <option value="">Select rear</option>
                                <option value="L">L</option>
                                <option value="M">M</option>
                            </MySelect>
                        </div>
                        <h2 className='categoryHeader'>Shell Side Fluid</h2>
                        <MySelect label="Shell Fluid" name="shellFluid">
                            <option value="">Select a Shell Fluid</option>
                            <option value="Water">Water</option>
                            <option value="Engine Oil">Engine Oil</option>
                            <option value="50% Ethylene Glycol">50% Ethylene Glycol</option>
                            <option value="Ethylene Glycol">Ethylene Glycol</option>
                            <option value="Glycerin">Glycerin</option>
                        </MySelect>
                        <MyTextInput
                            label="Inlet Temperature" //text infront of box
                            name="shellIT" //name inside the JSON object
                            type="text"
                            placeholder="Inlet Temperature" //placeholder text inside box
                            unit="??C"
                        />
                        <MyTextInput
                            label="Outlet Temperature" //text infront of box
                            name="shellOTreq" //name inside the JSON object
                            type="text"
                            placeholder="Outlet Temperature" //placeholder text inside box
                            unit="??C"
                        />
                        <MyTextInput
                            label="Mass Flow Rate"
                            name="shellMFR"
                            type="text"
                            placeholder="Mass Flow Rate"
                            unit="kg/s"
                        />
                        <MyTextInput
                            label="Fouling Factor"
                            name="shellFF"
                            type="text"
                            placeholder="Fouling Factor"
                            unit="m??.W/K"
                        />
                        <h2 className='categoryHeader'>Tube Side Fluid</h2>
                        <MySelect label="Tube Fluid" name="tubeFluid">
                            <option value="">Select a Tube Fluid</option>
                            <option value="Water">Water</option>
                            <option value="Engine oil">Engine Oil</option>
                            <option value="50% Ethylene Glycol">50% Ethylene Glycol</option>
                            <option value="Ethylene Glycol">Ethylene Glycol</option>
                            <option value="Glycerin">Glycerin</option>
                        </MySelect>
                        <MyTextInput
                            label="Inlet Temperature" //text infront of box
                            name="tubeIT" //name inside the JSON object
                            type="text"
                            placeholder="Inlet Temperature" //placeholder text inside box
                            unit="??C"
                        />
                        <MyTextInput
                            label="Outlet Temperature" //text infront of box
                            name="tubeOTreq" //name inside the JSON object
                            type="text"
                            placeholder="Outlet Temperature" //placeholder text inside box
                            unit="??C"
                        />
                        <MyTextInput
                            label="Mass Flow Rate"
                            name="tubeMFR"
                            type="text"
                            placeholder="Mass Flow Rate"
                            unit="kg/s"
                        />
                        <MyTextInput
                            label="Fouling Factor"
                            name="tubeFF"
                            type="text"
                            placeholder="Fouling Factor"
                            unit="m??.W/K"
                        />
                        <button className='applyButton' type="submit" >Apply</button>
                        {/* button is not done, dk what to do with it yet */}
                    </Form>
                </Formik >
                <PopUp open={this.state.popUp} onClose={() => this.setState({popUp: false})}>
                    <p className="popup-text">Updated!</p>
                </PopUp>
            </div >
        );
    }
}

export default SizingTab1Form;