import React, { Component} from 'react';
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

class SizingTab2Form extends React.Component {
    constructor(props) {
        super(props);
        //this.handleChange = this.handleChange.bind(this);
        //state is just for the popup box
         this.state = {
            popUp: false,
            numberTubePopUp: false,
        }
    }
    render() {
        return (
            <div className='formContainer' >
                {/* the error message sucks, pls fix in future */}
                <Formik
                    initialValues={{ }}//dk why i dun need to put all the variables here
                    validationSchema={
                        Yup.object({
                            tubeInnerD: Yup.number(),                          
                            tubeOuterD: Yup.number(),
                            shellInnerDiameter: Yup.number(),                         
                            tubePitch: Yup.number(),                         
                            numberTube: Yup.number(),
                            })
                    }
                    onSubmit={(values, { setSubmitting }) => {
                        if (values.numberTube < 10) {
                            this.setState({numberTubePopUp: true})
                        } else {
                            this.props.handleSubmit(values);
                            this.props.handleSubmit({tubeLength: 0.1}); 
                            this.props.handleSubmit({recalculate: 1});                            
                            setSubmitting(false);
                            this.setState({popUp: true})
                        }
                    }}
                >
                    <Form>
                        <h2 className='categoryHeader'>Configurations</h2>
                        <MyTextInput
                            label="Number of Tubes"
                            name="numberTube"
                            type="text"
                            placeholder="Number of Tubes"
                            unit=""
                        />       
                        <MyTextInput
                            label="Tube Inner Diameter"
                            name="tubeInnerD"
                            type="text"
                            placeholder="Tube Inner Diameter"
                            unit="m"
                        />
                        <MyTextInput
                            label="Tube Outer Diameter"
                            name="tubeOuterD"
                            type="text"
                            placeholder="Tube Outer Diameter"
                            unit="m"  
                        />
                        <MyTextInput
                            label="Shell Inner Diameter"
                            name="shellInnerDiameter"
                            type="text"
                            placeholder="Shell Inner Diameter"
                            unit="m"  
                        />
                        <MyTextInput
                            label="Tube Pitch"
                            name="tubePitch"
                            type="text"
                            placeholder="Tube Pitch"
                            unit="m"
                        />
                        <MySelect label="Tube Layout" name="layoutAngle">
                            <option value="">Select a Layout</option>
                            <option value="triangular">triangular</option>
                            <option value="square">square</option>
                            <option value="rotated-square">rotated-square</option>
                        </MySelect>
                        <MySelect label="Tube Material" name="tubeMaterial">
                            <option value="">Select a tube material</option>
                            <option value="Admiralty (70% Cu, 30% Ni)">Admiralty (70% Cu, 30% Ni)</option>
                            <option value="Stainless Steel">Stainless Steel</option>
                            <option value="Mild Steel">Mild Steel</option>
                            <option value="Copper">Copper</option>
                            <option value="Nickle">Nickle</option>
                            <option value="Aluminium">Aluminium</option>
                            <option value="Borosilicate Glass">Borosilicate Glass</option>
                            <option value="Zinc">Zinc</option>
                            <option value="Titanium Alloy">Titanium Alloy</option>
                        </MySelect>
                        <button className='applyButton' type="submit" >Apply</button>
                        {/* button is not done, dk what to do with it yet */}                       
                    </Form>
                </Formik >
                <PopUp open={this.state.popUp} onClose={() => this.setState({popUp: false})}>
                    <p className="popup-text">Updated!</p>
                </PopUp>
                <PopUp open={this.state.numberTubePopUp} onClose={() => this.setState({numberTubePopUp: false})}>
                    <p className="popup-text">Miminum 10 tubes!</p>
                </PopUp>
            </div >
        );
    }
}

export default SizingTab2Form;