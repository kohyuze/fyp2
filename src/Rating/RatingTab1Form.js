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

class RatingTab1Form extends React.Component {
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
                    initialValues={{}}//shellIT: '', shellMFR: '' }}//dk why i dun need to put all the variables here
                    validationSchema={
                        Yup.object({
                            shellIT: Yup.number(),
                            shellMFR: Yup.number(),
                            tubeIT: Yup.number(),
                            tubeMFR: Yup.number(),
                        })
                    }
                    onSubmit={(values, { setSubmitting }) => {
                        this.props.handleSubmit(values);
                        setSubmitting(false);
                        this.setState({popUp: true})
                    }}
                >
                    <Form>
                        <h2 className='categoryHeader'>TEMA</h2>
                        <div>
                            {/* need to fix this, cannot be A_1, A_2 */}
                            <MySelect label="Head" name="Head" >
                                <option value="">Select head</option>
                                <option value="A_1">A_1</option>
                                <option value="A_2">A_2</option>
                                <option value="B_1">B</option>
                            </MySelect>
                            <MySelect label="Shell" name="Shell">
                                <option value="">Select shell</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                                <option value="U">U</option>
                            </MySelect>
                            <MySelect label="Rear" name="Rear" >
                                <option value="">Select rear</option>
                                <option value="L_1">L_1</option>
                                <option value="L_0">L_0</option>
                                <option value="M_1">M_1</option>
                            </MySelect>
                        </div>
                        <h2 className='categoryHeader'>Shell Side Fluid</h2>
                        <MyTextInput
                            label="Inlet Temperature" //text infront of box
                            name="shellIT" //name inside the JSON object
                            type="text"
                            placeholder="Inlet Temperature" //placeholder text inside box
                            unit="°C"
                        />
                        <MyTextInput
                            label="Mass Flow Rate"
                            name="shellMFR"
                            type="text"
                            placeholder="Mass Flow Rate"
                            unit="kg/s"
                        />
                        <h2 className='categoryHeader'>Tube Side Fluid</h2>
                        <MyTextInput
                            label="Inlet Temperature" //text infront of box
                            name="tubeIT" //name inside the JSON object
                            type="text"
                            placeholder="Inlet Temperature" //placeholder text inside box
                            unit="°C"
                        />
                        <MyTextInput
                            label="Mass Flow Rate"
                            name="tubeMFR"
                            type="text"
                            placeholder="Mass Flow Rate"
                            unit="kg/s"
                        />
                        <button className='applyButton' type="submit" >Apply</button>
                        <button onClick={() => console.log(this.state)}>log state 2</button>
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

export default RatingTab1Form;