import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addUser } from "../rtk/slices/userSlice.js";

// Components
import FormLabel from './FormLabel.jsx';

// Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import authSignOut from "../function/authSignOut.js";

import _signupUser from "../function/_signupUser.js";
import _loginUser from "../function/_loginUser.js";

const Form = ({ settings: { theme, fields, afterSubmitNavigatePath, btnText, job } }) => {
	const [values, setValues] = useState();
	const [formErrorMessage, setFormErrorMessage] = useState("");
	const [inProgress, setInProgress] = useState(false);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Set the default state values
	useEffect(() => {
		let defaultStateResult = {}
		fields.map(field => defaultStateResult[field.name] = field.defaultData)
		setValues(defaultStateResult)
	}, [])
	
    // On submit action
	const handleSubmit = (event) => {
		event.preventDefault();
		
		// Create or sign up user process
		if (!(values.password.length < 6)) {
			if (job === "register") {
				setInProgress(true);
				_signupUser(values, (isPassed, error) => {
					if (isPassed) {
						console.log("Registration successful!");
						navigate(afterSubmitNavigatePath);
					} else {
						console.error(error);
						setFormErrorMessage(error);
						setInProgress(false);
					}
				});
				
			} else if (job === "login") {
				setInProgress(true);
				_loginUser(values, (isPassed, error, result) => {
					if (isPassed) {
						console.log("Login successful");
						dispatch(addUser(result));
						navigate(afterSubmitNavigatePath);
					} else {
						console.error(error);
						setFormErrorMessage(error);
						setInProgress(false);
					}
				});
			}
		} else {setFormErrorMessage("Password should be at least 6 characters")}
	}

	const handleOnChange = (e) => {
		const name = e.target.name;
		const value = e.target.value;

		setValues({...values, [name]: value, role: "admin"});
	}

	return (

		<form onSubmit={handleSubmit} className={`${theme}`}>
            {
                fields.map((field, index) => <FormLabel key={index} labelData={field} value={values ? values[field.name] : ""} onChangeEvent={handleOnChange} />)
            }
			{ inProgress ? <span style={{color: "green"}}>In progress...</span> : <input type="submit" value={btnText} className="btnTheme" /> }
			<span className='error-message' style={{color: "red", display: "block", fontSize: "20px"}}>{ formErrorMessage }</span>
		</form>

	);
}

export default Form;