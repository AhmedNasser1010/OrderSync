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
			const finalValues = {
				...values,
				latlng: [Number(values.latlng[0]), Number(values.latlng[1])]
			}
			console.log(finalValues)
			setReadyToSubmit(true);
			businessInfoValues({...finalValues}, "business");
		}}
	>
		{({ isSubmitting, errors, touched, values }) => (

			<Form onChange={() => setReadyToSubmit(false)} style={{ width: '100%' }}>
				<Widget>
					<Typography variant="h6" gutterBottom>Business Info</Typography>
					<Stack spacing={1}>
						<Field { ...muiTextFieldProps(errors, touched, values, 'name', 'Name') } />
						<Field { ...muiTextFieldProps(errors, touched, values, 'nameInAr', 'Arabic Name') } />
						<Stack direction='row' spacing={1}>
							<Field { ...muiTextFieldProps(errors, touched, values, 'icon', 'Icon') } fullWidth />
							<Field { ...muiTextFieldProps(errors, touched, values, 'cover', 'Cover') } fullWidth />
						</Stack>
			    	<Field { ...muiTextFieldProps(errors, touched, values, 'industry', 'Indystry Type') } select>
			    		<MenuItem value="coffe-shop">Coffee Shop</MenuItem>
			    		<MenuItem value="restaurant">Restaurant</MenuItem>
			    	</Field>
			    	<Stack direction='row' spacing={1}>
			    		<Field { ...muiTextFieldProps(errors, touched, values, 'address', 'Address') } fullWidth />
			    		<Stack direction='row' spacing={1}>
			    			<Field
			    				InputLabelProps={filledValues && values && values.latlng[0] !== '' && { shrink: true }}
			    				error={errors && touched && errors.latlng && errors.latlng[0] && touched.latlng && touched.latlng[0] && true}
			    				helperText={errors && touched && errors.latlng && errors.latlng[0] && touched.latlng && touched.latlng[0] && errors.latlng[0]}
			    				component={MuiTextField}
			    				name='latlng[0]'
			    				label='Latitude'
			    				fullWidth
			    			/>
			    			<Field
			    				InputLabelProps={filledValues && values && values.latlng[1] !== '' && { shrink: true }}
			    				error={errors && touched && errors.latlng && errors.latlng[1] && touched.latlng && touched.latlng[1] && true}
			    				helperText={errors && touched && errors.latlng && errors.latlng[1] && touched.latlng && touched.latlng[1] && errors.latlng[1]}
			    				component={MuiTextField}
			    				name='latlng[1]'
			    				label='Longitude'
			    				fullWidth
			    			/>
			    		</Stack>
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