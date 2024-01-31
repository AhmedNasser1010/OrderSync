import { useState } from "react";

import { Formik, Form, Field } from 'formik';
import { object, string, number } from 'yup';

// MUI
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

// Components
import Widget from "./Widget.jsx";
import MuiTextField from "./MuiTextField.jsx";

// RegEx
const phoneNumberRegex = /^\+(\d{12})$/;

// Validation Schema
let validationSchema = object({
	basic: object({
		fName: string().required("First name is required").min(3, "First name is too short").max(15, "First name is too Long"),
	  lName: string().required("Last name is required").min(3, "Last name is too Short").max(15, "Last name is too Long"),
	  age: string().test("", "Business owner must be older!", value => {
	  	const dateNow = new Date;
	  	const yearNow = dateNow.getFullYear();
	  	const age = yearNow - Number(value?.split('-')[0]);
	  	return age >= 18;
	  }).test("", "Business owner must be younger!", value => {
	  	const dateNow = new Date;
	  	const yearNow = dateNow.getFullYear();
	  	const age = yearNow - Number(value?.split('-')[0]);
	  	return age <= 99;
	  }),
	}),
  contact: object({
  	email: string().email("Email is not valid email example@gmail.com").required("Email is required"),
  	phone: string().required("Phone number is required").matches(phoneNumberRegex, 'Phone number is not valid. Example: +201117073085'),
  	address: string().required("Addres is required"),
  }),
  password: string().required("Password is required").min(6, "Password is too short").max(30, "Password is too long"),
});

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
			validationSchema={validationSchema}
			onSubmit={values => {
				setReadyToSubmit(true);
				businessOwnerInfoValues({...values}, "owner");
			}}
		>
			{({ isSubmitting, errors, touched, values }) => (

				<Form onChange={() => setReadyToSubmit(false)}>
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

					</Widget>

					<Button
						variant="outlined"
						type="submit"
						sx={{ width: '100%' }}
						disabled={readyToSubmit && isSubmitting}
					>
						+
					</Button>

				</Form>

			)}

		</Formik>

	)
}

export default BusinessOwnerInfoFieldsWidget;