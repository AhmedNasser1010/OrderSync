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

// Validation Schema
import { businessOwnerInfoValidationSchema } from "../AddNewBusiness.jsx";

// Initial Values
let initialValues = {
	basic: {
		fName: '',
		lName: '',
		age: '',
		gender: '',
	},
	contact: {
		email: '',
		phone: '',
		address: '',
	},
	password: ""
}

const BusinessOwnerInfoFieldsWidget = ({ businessOwnerInfoValues }) => {
	const [readyToSubmit, setReadyToSubmit] = useState(false);
	return (

		<Formik
			initialValues={initialValues}
			validationSchema={businessOwnerInfoValidationSchema}
			onSubmit={values => {
				setReadyToSubmit(true);
				businessOwnerInfoValues({...values}, "owner");
			}}
		>
			{({ isSubmitting, errors, touched }) => (

				<Form onChange={() => setReadyToSubmit(false)} style={{ width: '100%' }}>
					<Widget>
						<Typography variant="h6" gutterBottom>Business Owner Info</Typography>
						<Stack>
							<Stack direction='row' spacing={1} sx={{ minWidth: "100%", marginBottom: "0.5rem" }}>
								<Field
								  error={errors.basic?.fName && touched.basic?.fName && true}
								  helperText={errors.basic?.fName && touched.basic?.fName && errors.basic?.fName}
								  as={MuiTextField}
								  name="basic.fName"
								  label="First Name"
								  fullWidth
								/>
								<Field
								  error={errors.basic?.lName && touched.basic?.lName && true}
								  helperText={errors.basic?.lName && touched.basic?.lName && errors.basic?.lName}
								  as={MuiTextField}
								  name="basic.lName"
								  label="Last Name"
								  fullWidth
								/>
							</Stack>
							<Stack direction='row' spacing={1} sx={{ marginBottom: "0.5rem" }}>
								<Field
	                error={errors.basic?.gender && touched.basic?.gender && true}
	                helperText={errors.basic?.gender && touched.basic?.gender && errors.basic?.gender}
	                component={MuiTextField}
	                name="basic.gender"
	                label="Gender"
	                select
	                fullWidth
	              >
	              	<MenuItem value="male">Male</MenuItem>
	              	<MenuItem value="female">Female</MenuItem>
	              	<MenuItem value="no-answer">No Answer</MenuItem>
	              </Field>
	              <Field
								  error={errors.basic?.age && touched.basic?.age && true}
								  helperText={errors.basic?.age && touched.basic?.age && errors.basic?.age}
								  component={MuiTextField}
								  name="basic.age"
								  label="Age"
								  type="date"
								  fullWidth
								/>
							</Stack>
							<Stack direction='row' spacing={1} sx={{ marginBottom: "0.5rem" }}>
								<Field
								  error={errors.contact?.email && touched.contact?.email && true}
								  helperText={errors.contact?.email && touched.contact?.email && errors.contact?.email}
								  component={MuiTextField}
								  name="contact.email"
								  label="Email"
								  fullWidth
								/>
								<Field
								  error={errors.contact?.phone && touched.contact?.phone && true}
								  helperText={errors.contact?.phone && touched.contact?.phone && errors.contact?.phone}
								  component={MuiTextField}
								  name="contact.phone"
								  label="Phone Number"
								  fullWidth
								 />
							</Stack>
							<Field
								error={errors.contact?.address && touched.contact?.address && true}
								helperText={errors.contact?.address && touched.contact?.address && errors.contact?.address}
								component={MuiTextField}
								name="contact.address"
								label="Address"
								sx={{ marginBottom: "0.5rem" }}
							/>
							<Field
								error={errors.password && touched.password && true}
								helperText={errors.password && touched.password && errors.password}
								component={MuiTextField}
								name="password"
								type="password"
								label="Password"
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