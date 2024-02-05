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

// Validation schema
import { businessInfoValidationSchema } from "../AddNewBusiness.jsx";

const BusinessInfoFieldsWidget = ({ businessInfoValues, initialValues, filledValues = false }) => {
	const [readyToSubmit, setReadyToSubmit] = useState(false);

	const muiTextFieldProps = (errors, touched, values, name, label) => {
		return {
			InputLabelProps: filledValues && values && values[name] !== '' && { shrink: true },
			error: errors && touched && errors[name] && touched[name] && true,
			helperText: errors && touched && errors[name] && touched[name] && errors[name],
			component: MuiTextField,
			name: name,
			label: label
		};
	};

	return (

	<Formik
		enableReinitialize
		initialValues={initialValues}
		validationSchema={businessInfoValidationSchema}
		onSubmit={values => {
			setReadyToSubmit(true);
			businessInfoValues({...values}, "business");
		}}
	>
		{({ isSubmitting, errors, touched, values }) => (

			<Form onChange={() => setReadyToSubmit(false)} style={{ width: '100%' }}>
				<Widget>
					<Typography variant="h6" gutterBottom>Business Info</Typography>
					<Stack spacing={1}>
						<Field { ...muiTextFieldProps(errors, touched, values, 'name', 'Name') } />
			    	<Field { ...muiTextFieldProps(errors, touched, values, 'industry', 'Indystry Type') } select>
			    		<MenuItem value="coffe-shop">Coffee Shop</MenuItem>
			    		<MenuItem value="restaurant">Restaurant</MenuItem>
			    		<MenuItem value="online-shopping">Online Shopping</MenuItem>
			    		<MenuItem value="gym-programs">Gym Programs</MenuItem>
			    		<MenuItem value="it">IT</MenuItem>
			    	</Field>
			    	<Stack direction='row' spacing={1}>
			    		<Field { ...muiTextFieldProps(errors, touched, values, 'address', 'Address') } fullWidth />
			    		<Field { ...muiTextFieldProps(errors, touched, values, 'location', 'Location') } fullWidth />
			    	</Stack>
			    	<Button
							variant="outlined"
							type="submit"
							sx={{ width: '100%' }}
							disabled={readyToSubmit && isSubmitting}
						>
							Save
						</Button>
					</Stack>

				</Widget>
			</Form>

		)}
	</Formik>

	)
}

export default BusinessInfoFieldsWidget;