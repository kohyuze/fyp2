import React, { Component} from 'react';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';


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

// const MySelect = ({ label, ...props }) => {
//     const [field, meta] = useField(props);
//     return ( //do something about the styling pls
//       <div className="form">
//         {/* <label htmlFor={props.id || props.name}>{label}</label> */}
//         <select className="input" {...field} {...props} />
//         {meta.touched && meta.error ? (<div className="error">{meta.error}</div>) : null}
//       </div>
//     );
//   };

class RatingTab2Form extends React.Component {
    constructor(props) {
        super(props);
        //this.handleChange = this.handleChange.bind(this);
    }
    render() {
        return (
            <div className='formContainer' >
                {/* the error message sucks, pls fix in future */}
                <Formik
                    initialValues={{ tubeInnerD: '', tubeOuterD: '' }}//dk why i dun need to put all the variables here
                    validationSchema={
                        Yup.object({
                            tubeInnerD: Yup.number().required('Required'),                            
                            tubeOuterD: Yup.number().required('Required'),                            
                            tubePitch: Yup.number().required('Required'),                            
                            numberTube: Yup.number().required('Required'),
                            })
                    }
                    onSubmit={(values, { setSubmitting }) => {
                        this.props.handleSubmit(values);
                        console.log("submitted values:" + values);
                        setSubmitting(false);
                    }}
                >
                    <Form>
                        <h2 className='categoryHeader'>Tube Side configs</h2>
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
                            label="Tube Pitch"
                            name="tubePitch"
                            type="text"
                            placeholder="Tube Pitch"
                            unit="m"
                        />
                        <MyTextInput
                            label="Number of Tubes"
                            name="numberTube"
                            type="text"
                            placeholder="Number of Tubes"
                            unit="-"
                        />                  
                        <button className='applyButton' type="submit" >Apply</button>
                        {/* button is not done, dk what to do with it yet */}                       
                    </Form>
                </Formik >

            </div >
        );
    }
}

export default RatingTab2Form;