import { useState } from "react";

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
import { businessOpeningHoursValidationSchema } from "../AddNewBusiness.jsx";

const BusinessOpeningHoursFieldsWidget = ({ businessOpeningHoursValues, initialValues, filledValues = false }) => {
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
				minWidth: "100%",
				marginBottom: "0.5rem"
			}
		};
	}

	return (

		<Formik
			enableReinitialize
			initialValues={initialValues}
			validationSchema={businessOpeningHoursValidationSchema}
			onSubmit={values => {
				setReadyToSubmit(true);
				businessOpeningHoursValues({...values}, 'services.openingHours');
			}}
		>
			{({ isSubmitting, errors, touched, values }) => (

				<Form onChange={() => setReadyToSubmit(false)} style={{ width: '100%' }}>
					<Widget>
						<Typography variant="h6" gutterBottom>Opening Hours</Typography>
						<Stack>
							<Stack { ...stackProps() }>
								<Field { ...muiTextFieldProps(errors, touched, values, 'sunday.start', 'Sunday From') } />
		            <Field { ...muiTextFieldProps(errors, touched, values, 'sunday.end', 'To') }
		            />
	            </Stack>
	            <Stack { ...stackProps() }>
	              <Field { ...muiTextFieldProps(errors, touched, values, 'monday.start', 'Monday From') } />
		            <Field { ...muiTextFieldProps(errors, touched, values, 'monday.end', 'To') } />
	            </Stack>
	            <Stack { ...stackProps() }>
	            	<Field { ...muiTextFieldProps(errors, touched, values, 'tuesday.start', 'Tuesday From') } />
	             	<Field { ...muiTextFieldProps(errors, touched, values, 'tuesday.end', 'To') } />
	            </Stack>
	            <Stack { ...stackProps() }>
	             	<Field { ...muiTextFieldProps(errors, touched, values, 'wednesday.start', 'Wednesday From') } />
		            <Field { ...muiTextFieldProps(errors, touched, values, 'wednesday.end', 'To') } />
	            </Stack>
	            <Stack { ...stackProps() }>
	            	<Field { ...muiTextFieldProps(errors, touched, values, 'thursday.start', 'Thursday From') } />
	              <Field { ...muiTextFieldProps(errors, touched, values, 'thursday.end', 'To') } />
	            </Stack>
	            <Stack { ...stackProps() }>
	              <Field { ...muiTextFieldProps(errors, touched, values, 'friday.start', 'Friday From') } />
		            <Field { ...muiTextFieldProps(errors, touched, values, 'friday.end', 'To') } />
	            </Stack>
	            <Stack { ...stackProps() }>
	             	<Field { ...muiTextFieldProps(errors, touched, values, 'saturday.start', 'Saturday From') } />
		            <Field { ...muiTextFieldProps(errors, touched, values, 'saturday.end', 'To') } />
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

export default BusinessOpeningHoursFieldsWidget;