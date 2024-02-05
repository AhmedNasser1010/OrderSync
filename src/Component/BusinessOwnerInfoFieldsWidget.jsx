import { useState, useEffect } from "react";
import { Formik, Form, Field } from 'formik';

// MUI
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

// Components
import Widget from "./Widget.jsx";
import MuiTextField from "./MuiTextField.jsx";

// Functions
import getNestedValue from '../function/getNestedValue.js';

// Validation Schema
import { businessOwnerInfoValidationSchema } from "../AddNewBusiness.jsx";

const BusinessOwnerInfoFieldsWidget = ({ businessOwnerInfoValues, initialValues, filledValues = false }) => {
	const [readyToSubmit, setReadyToSubmit] = useState(false);

	const muiTextFieldProps = (errors, touched, values, name, label) => {
		const value = getNestedValue(values, name);
		const error = getNestedValue(errors, name);
		const touch = getNestedValue(touched, name);

		return {
			InputLabelProps: filledValues && value !== '' && { shrink: true },
			error: errors && touched && error && touch && true,
			helperText: errors && touched && error && touch && error,
			component: MuiTextField,
			name: name,
			label: label,
			fullWidth: true
		};
	};

	const stackProps = () => {
		return {
			direction: 'row',
			spacing: 1,
			sx: {
				marginBottom: "0.5rem"
			}
		};
	}

	return (

		<Formik
			enableReinitialize
			initialValues={initialValues}
			validationSchema={businessOwnerInfoValidationSchema}
			onSubmit={values => {
				// !!!!! Here should we have a function to check if the user email is used before !!!!!
				// if (values.contact.email !== ####) {
				// 	setReadyToSubmit(true);
				// 	businessOwnerInfoValues({...values}, "owner");	
				// } else {
				// 	setReadyToSubmit(false);
				// 	setAuthError("email is used before")
				// }
				setReadyToSubmit(true);
				businessOwnerInfoValues({...values}, "owner");
			}}
		>
			{({ isSubmitting, errors, touched, values}) => (

				<Form onChange={() => setReadyToSubmit(false)} style={{ width: '100%' }}>
					<Widget>
						<Typography variant="h6" gutterBottom>Business Owner Info</Typography>
						<Stack>
							<Stack { ...stackProps() }>
								<Field { ...muiTextFieldProps(errors, touched, values, 'basic.fName', 'First Name') } />
								<Field { ...muiTextFieldProps(errors, touched, values, 'basic.lName', 'Last Name') } />
							</Stack>
							<Stack { ...stackProps() }>
								<Field
	                { ...muiTextFieldProps(errors, touched, values, 'basic.gender', 'Gender') }
	                select
	              >
	              	<MenuItem value="male">Male</MenuItem>
	              	<MenuItem value="female">Female</MenuItem>
	              	<MenuItem value="no-answer">No Answer</MenuItem>
	              </Field>
	              <Field
								  { ...muiTextFieldProps(errors, touched, values, 'basic.age', 'Age') }
								  type="date"
								/>
							</Stack>
							<Stack { ...stackProps() }>
								<Field { ...muiTextFieldProps(errors, touched, values, 'contact.email', 'Email') }  />
								<Field { ...muiTextFieldProps(errors, touched, values, 'contact.phone', 'Phone Number') } />
							</Stack>
							<Field
								{ ...muiTextFieldProps(errors, touched, values, 'contact.address', 'Address') }
								sx={{ marginBottom: "0.5rem" }}
							/>
							<Field
								{ ...muiTextFieldProps(errors, touched, values, 'password', 'Password') }
								type="password"
								sx={{ marginBottom: "0.5rem" }}
							/>
						</Stack>

						<Button
							variant="outlined"
							type="submit"
							sx={{ width: '100%' }}
							disabled={readyToSubmit && isSubmitting}
						>
							Save
						</Button>

					</Widget>

				</Form>

			)}

		</Formik>

	)
}

export default BusinessOwnerInfoFieldsWidget;