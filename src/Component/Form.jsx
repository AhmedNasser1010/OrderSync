import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Scripts
import { getDate, getTime } from "../script.js";

// Components
import FormLabel from './FormLabel.jsx';

// API
import postItem from '../api/postItem.js';
import putItem from "../api/putItem.js";
import getItems from "../api/getItems.js"

const Form = ({ settings: { theme, fields, endpoint, afterSubmitNavigatePath, apiAction, itemId } }) => {
	const [values, setValues] = useState();
	const navigate = useNavigate();

    // Setup values useState
    useEffect(() => {
        let setupResult = {date: getDate(), time: getTime()};

		if (apiAction === "POST") {
			fields.map(field => {
				setupResult[field.name] = field.defaultData;
			})
	
			setValues(setupResult);
		} else if (apiAction === "PUT") {
			getItems(endpoint, itemId).then(res => setValues(res));
		}
    }, [])

    // On Submit Action
	const handleSubmit = (e) => {
		e.preventDefault();

		if (values.title === "" || values.category === "" || values.description === "") {
			return false;
		} else {

			if (apiAction === "POST") {
				postItem(endpoint, values);
			} else if (apiAction === "PUT") {
				putItem(endpoint, itemId, values);
			}

            // After Submit Action
            navigate(afterSubmitNavigatePath)
		}
		
	}

	const handleOnChange = (e) => {
		const name = e.target.name;
		const value = e.target.value;

		setValues({...values, [name]: value});
	}

	return (

		<form onSubmit={handleSubmit} className={`${theme}`}>
            {
                fields.map((field, index) => <FormLabel key={index} labelData={field} value={values ? values[field.name] : ""} onChangeEvent={handleOnChange} />)
            }
			<input type="submit" value="Submit" className="submit-btn" />
		</form>

	);
}

export default Form;