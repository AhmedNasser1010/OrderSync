import { Formik, Form, Field } from 'formik';
import { object, string, number } from 'yup';

// MUI
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

// Components
import Widget from "./Widget.jsx";
import MuiTextField from "./MuiTextField.jsx";

// RegEx
const phoneNumberRegex = /^\+(\d{12})$/;

// Validation Schema
let validationSchema = object({
	basic: object({
		fName: string().required().min(3, "First name are too Short").max(20, "First name are too Long"),
	  lName: string().required().min(3, "Last name are too Short").max(20, "Last name are too Long"),
	  age: number().required().test("Business owner must be older!", value => {
	  	const dateNow = new Date;
	  	const yearNow = dateNow.getFullYear();
	  	const age = yearNow - value;
	  	return age >= 18;
	  }).test("Business owner must be younger!", value => {
	  	const dateNow = new Date;
	  	const yearNow = dateNow.getFullYear();
	  	const age = yearNow - value;
	  	return age <= 99;
	  })
	}),
  contact: object({
  	email: string().email().required(),
  	phone: string().matches(phoneNumberRegex, 'Phone number is not valid'),
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

const BusinessOwnerInfoFieldsWidget = () => {

	const handleError = (err) => {
    return err && true
  }

  const fieldPops = (variable, label) => {
  	return {
  		// error: {handleError(errors.owner?.[variable])},
			// helperText: {errors.owner?.[variable]},
			component: {MuiTextField},
			name: `owner.${variable}`,
			label: label,
  	};
  };

	return (

		<Formik
			initialValues={initialValues}
			validationSchema={validationSchema}
			onSubmit={values => {
				console.log(values);
			}}
		>
			{({ errors }) => (

				<Form>
					<Widget>
						<Typography variant="h6" gutterBottom>Business Owner Info</Typography>
						<Stack>
							<Stack>
								<Field
								  error={handleError(errors.basic?.fName)}
								  helperText={errors.basic?.fName}
								  component={MuiTextField}
								  name="basic.fName"
								  label="First Name"
								/>
								<Field
								  error={handleError(errors.basic?.lName)}
								  helperText={errors.basic?.lName}
								  component={MuiTextField}
								  name="basic.lName"
								  label="Last Name"
								/>
								<Field
	              	sx={{minWidth: '200px'}}
	                error={handleError(errors.basic?.gender)}
	                helperText={errors.basic?.gender}
	                component={MuiTextField}
	                name="basic.gender"
	                label="Gender"
	                select
	              >
	              	<MenuItem value="male">Male</MenuItem>
	              	<MenuItem value="female">Female</MenuItem>
	              	<MenuItem value="no-answer">No Answer</MenuItem>
	              </Field>
	              <Field
								  error={handleError(errors.basic?.age)}
								  helperText={errors.basic?.age}
								  component={MuiTextField}
								  name="basic.age"
								  label="Age"
								  type="date"
								/>
							</Stack>
							<Stack>
								<Field
								  error={handleError(errors.contact?.email)}
								  helperText={errors.contact?.email}
								  component={MuiTextField}
								  name="contact.email"
								  label="Email"
								/>
								<Field
								  error={handleError(errors.contact?.phone)}
								  helperText={errors.contact?.phone}
								  component={MuiTextField}
								  name="contact.phone"
								  label="Phone Number"
								 />
							</Stack>
							<Field
								error={handleError(errors.password)}
								helperText={errors.password}
								component={MuiTextField}
								name="password"
								label="Password"
								type="password"
                id="outlined-password-input"
                autoComplete="current-password"
							/>
						</Stack>
					</Widget>
				</Form>

			)}

		</Formik>

	)
}

export default BusinessOwnerInfoFieldsWidget;