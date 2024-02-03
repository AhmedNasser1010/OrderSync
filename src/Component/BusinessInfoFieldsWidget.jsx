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

const BusinessInfoFieldsWidget = ({ businessInfoValues, values }) => {
	const [readyToSubmit, setReadyToSubmit] = useState(false);

	return (

	<Formik
		enableReinitialize
		initialValues={values}
		validationSchema={businessInfoValidationSchema}
		onSubmit={values => {
			setReadyToSubmit(true);
			console.log(values)
			businessInfoValues({...values}, "business");
		}}
	>
		{({ isSubmitting, errors, touched }) => (

			<Form onChange={() => setReadyToSubmit(false)} style={{ width: '100%' }}>
				<Widget>
					<Typography variant="h6" gutterBottom>Business Info</Typography>
					<Stack spacing={1}>
						<Field
			  	  	error={errors.name && touched.name && true}
			  	  	helperText={errors.name && touched.name && errors.name}
			  	  	component={MuiTextField}
			  	  	name="name"
			  	  	label="Name"
			  		/>
			    	<Field
			      	error={errors.industry && touched.industry && true}
			      	helperTexthelperText={errors.industry && touched.industry && errors.industry}
			      	component={MuiTextField}
			      	name="industry"
			      	label="Indystry Type"
			      	select
			    	>
			    		<MenuItem value="coffe-shop">Coffee Shop</MenuItem>
			    		<MenuItem value="restaurant">Restaurant</MenuItem>
			    		<MenuItem value="online-shopping">Online Shopping</MenuItem>
			    		<MenuItem value="gym-programs">Gym Programs</MenuItem>
			    	</Field>
			    	<Stack direction='row' spacing={1}>
			    		<Field
			      		error={errors.address && touched.address && true}
			      		helperText={errors.address && touched.address && errors.address}
			      		component={MuiTextField}
			      		name="address"
			      		label="Address"
			      		fullWidth
			    		/>
			    		<Field
			      		error={errors.location && touched.location && true}
			      		helperText={errors.location && touched.location && errors.location}
			      		component={MuiTextField}
			      		name="location"
			      		label="Location"
			      		fullWidth
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
					</Stack>

				</Widget>
			</Form>

		)}
	</Formik>

	)
}

export default BusinessInfoFieldsWidget;