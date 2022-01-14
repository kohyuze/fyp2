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
            {/* <label htmlFor={props.id || props.name}>{label}</label> */}
            <div className="form">
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

class SizingTab3Form extends React.Component {
    constructor(props) {
        super(props);
        //this.handleChange = this.handleChange.bind(this);
        //state is just for the popup box
        this.state = {
            popUp: false,
        }
    }
    render() {
        //this function will change the number of tubepasses allowed to be input
        const project = () => {
            switch (this.props.formData.shell) {
                case "E": return <MySelect label="Number of Tube Passes" name="numberPasses">
                    <option value="">Number of Tube Passes</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </MySelect>
                case "F": return <MySelect label="Number of Tube Passes" name="numberPasses">
                    <option value="">Number of Tube Passes</option>
                    <option value="2">2</option>
                </MySelect>
                case "G": return <MySelect label="Number of Tube Passes" name="numberPasses">
                    <option value="">Number of Tube Passes</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </MySelect>
                default: return
            }
        }
        return (
            <div className='formContainer' >
                {/* the error message sucks, pls fix in future */}
                <Formik
                    initialValues={{}}//dk why i dun need to put all the variables here
                    validationSchema={
                        Yup.object({
                            baffleCutPercent: Yup.number(),
                            centralBaffleSpacing: Yup.number(),
                            clearance: Yup.number(),
                        })
                    }
                    onSubmit={(values, { setSubmitting }) => {
                        this.props.handleSubmit(values);
                        console.log("submitted values:" + values);
                        setSubmitting(false);
                        this.setState({ popUp: true })
                    }}
                >
                    <Form>
                        <h2 className='categoryHeader'>Shell Side Fluid</h2>
                        <MyTextInput
                            label="Baffle Cut"
                            name="baffleCutPercent"
                            type="text"
                            placeholder="Baffle Cut"
                            unit="%"
                        />
                        <MyTextInput
                            label="Central Baffles Spacing"
                            name="centralBaffleSpacing"
                            type="text"
                            placeholder="Central Baffles Spacing"
                            unit="m"
                        />
                        <MyTextInput
                            label="Clearance"
                            name="clearance"
                            type="text"
                            placeholder="Clearance"
                            unit="m"
                        />
                        <div>{project()}</div>
                        <button className='applyButton' type="submit" >Apply</button>
                        {/* button is not done, dk what to do with it yet */}
                    </Form>
                </Formik >
                <PopUp open={this.state.popUp} onClose={() => this.setState({ popUp: false })}>
                    <p className="popup-text">Updated!</p>
                </PopUp>
            </div >
        );
    }
}

export default SizingTab3Form;