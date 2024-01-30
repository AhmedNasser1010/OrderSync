import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { object, string, date, array, boolean } from 'yup';
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { addBusiness } from "./rtk/slices/businessesSlice.js";
import { pushAccesTokenToTheUser } from "./rtk/slices/userSlice.js";
import { useDispatch } from "react-redux";

// Firebase
import { auth } from "./firebase.js";

// MUI
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MuiTextField from "./Component/MuiTextField.jsx";
import MenuItem from '@mui/material/MenuItem';

// Components
import PageTitle from "./Component/PageTitle.jsx";
import Widget from "./Component/Widget.jsx";
import FormikCheckBox from "./Component/FormikCheckBox.jsx";

// Functions
import _addDoc from "./function/_addDoc.js";
import getCurrentDate from "./function/getCurrentDate.js";
import getCurrentTime24H from "./function/getCurrentTime24H.js";


// RegEx
const phoneNumberRegex = /^\+(\d{12})$/;
const locationCodeRegex = /^(\d{1,2})°(\d{1,2})'(\d{1,2}\.\d{1})"([NS])\s+(\d{1,3})°(\d{1,2})'(\d{1,2}\.\d{1})"([EW])$/;
// 26°50'49.1"N 29°44'20.4"E
const timeRegex = /^\d{2}:\d{2}$/;

// Validation Schema
let businessSchema = object({
  accessToken: string().required(),
  owner: object({
  	fName: string().required().min(3, "First name are too Short").max(20, "First name are too Long"),
  	lName: string().required().min(3, "Last name are too Short").max(20, "Last name are too Long"),
  	email: string().email().required(),
  	phone: string().matches(phoneNumberRegex, 'Phone number is not valid'),
  }),
  business: object({
  	name: string().required().min(3, "Business name are too Short").max(20, "Business name are too Long"),
  	industry: string().required(),
  	address: string().required(),
  	location: string().matches(locationCodeRegex, "Location code are not valid"),
  }),
  services: object({
  	openingHourse: object({
  		sunday: array().of(string()),
  		monday: array().of(string()),
  		tuesday: array().of(string()),
  		wednesday: array().of(string()),
  		thursday: array().of(string()),
  		friday: array().of(string()),
  		saturday: array().of(string()),
  	}),
  	paymentMethods: object({
  		cash: boolean(),
			vodafoneCash: boolean(),
			etisalatCash: boolean(),
  	})
  }),
  createdOn: object({
  	date: string().required(),
  	time: string().required(),
  }),
});


const AddNewBusinesse = () => {
	const navigate = useNavigate();
	const [accessToken, setAccessToken] = useState(`${uuidv4()}_${auth.currentUser.uid}`);
	const dispatch = useDispatch();
	const [paymentValues, setPaymentValues] = useState({cash: false, vodafoneCash: false, etisalatCash: false});

	const handleError = (err) => {
    return err && true
  }

  const logText = (text) => {
    console.log(text)
  }

  const handleCheckboxChange = (value, key) => {
  	const checked = value.target.checked;
  	setPaymentValues({...paymentValues, [key]: checked});
  }

	let businessInitialValues = {
		accessToken: accessToken,
		owner: {
			name: '',
			email: '',
			phone: '',
		},
		business: {
			name: '',
			industry: '',
			address: '',
			location: '',
		},
		services: {
			openingHourse: {
  			sunday: ['', ''],
				monday: ['', ''],
  			tuesday: ['', ''],
  			wednesday: ['', ''],
  			thursday: ['', ''],
  			friday: ['', ''],
  			saturday: ['', ''],
			},
			paymentMethods: {
				cash: false,
				vodafoneCash: false,
				etisalatCash: false,
			},
		},
		createdOn: {
			date: getCurrentDate(),
			time: getCurrentTime24H(),
		},
	}


	return (

		<section className="add-new-businesse theme1">
			<PageTitle title="Add New Businesse +" />
			<Formik
				initialValues={businessInitialValues}
				validationSchema={businessSchema}
				onSubmit={values => {
					values.services.paymentMethods = {...paymentValues};
					// dispatch(addBusiness(values));
					// dispatch(pushAccesTokenToTheUser(values.accessToken));
					// navigate("/businesses?tab=management");
					console.log(values);
				}}
			>
				{({ isSubmitting, errors }) => (
					<Form>
						{ logText(errors) }
						<Widget>
				      <Typography variant="h6" gutterBottom>Business Owner Info</Typography>
				      <Stack>
				        <Field
				          error={handleError(errors.owner?.name)}
				          helperText={errors.owner?.name}
				          component={MuiTextField}
				          name="owner.name"
				          label="Name"
				         />
				        <Field
				          error={handleError(errors.owner?.email)}
				          helperText={errors.owner?.email}
				          component={MuiTextField}
				          name="owner.email"
				          label="Email"
				         />
				        <Field
				          error={handleError(errors.owner?.phone)}
				          helperText={errors.owner?.phone}
				          component={MuiTextField}
				          name="owner.phone"
				          label="Phone"
				         />
				      </Stack>
				    </Widget>
		  			<Widget>
							<Typography variant="h6" gutterBottom>Business Info</Typography>
							<Field
                error={handleError(errors.business?.name)}
                helperText={errors.business?.name}
                component={MuiTextField}
                name="business.name"
                label="Name"
              />
              <Field
              	sx={{minWidth: '200px'}}
                error={handleError(errors.business?.industry)}
                helperText={errors.business?.industry}
                component={MuiTextField}
                name="business.industry"
                label="Indystry Type"
                select
              >
              	<MenuItem value="coffe-shop">Coffee Shop</MenuItem>
              	<MenuItem value="restaurant">Restaurant</MenuItem>
              	<MenuItem value="online-shopping">Online Shopping</MenuItem>
              	<MenuItem value="gym-programs">Gym Programs</MenuItem>
              </Field>
              <Field
                error={handleError(errors.business?.address)}
                helperText={errors.business?.address}
                component={MuiTextField}
                name="business.address"
                label="Address"
              />
              <Field
                error={handleError(errors.business?.location)}
                helperText={errors.business?.location}
                component={MuiTextField}
                name="business.location"
                label="Location"
              />
		  			</Widget>
		  			<Widget>
							<Typography variant="h6" gutterBottom>Opening Hours</Typography>
							<Box>
								<Field
	                error={handleError(errors.services?.openingHourse.sunday[0])}
	                helperText={errors.services?.openingHourse.sunday[0]}
	                component={MuiTextField}
	                name="services.openingHourse.sunday[0]"
	                label="Sunday From"
	              />
	              <Field
	                error={handleError(errors.services?.openingHourse.sunday[1])}
	                helperText={errors.services?.openingHourse.sunday[1]}
	                component={MuiTextField}
	                name="services.openingHourse.sunday[1]"
	                label="To"
	              />
              </Box>
              <Box>
              	<Field
	                error={handleError(errors.services?.openingHourse.monday[0])}
	                helperText={errors.services?.openingHourse.monday[0]}
	                component={MuiTextField}
	                name="services.openingHourse.sunday[0]"
	                label="Monday From"
	              />
	              <Field
	                error={handleError(errors.services?.openingHourse.monday[1])}
	                helperText={errors.services?.openingHourse.monday[1]}
	                component={MuiTextField}
	                name="services.openingHourse.sunday[1]"
	                label="To"
	              />
              </Box>
              <Box>
              	<Field
	                error={handleError(errors.services?.openingHourse.tuesday[0])}
	                helperText={errors.services?.openingHourse.tuesday[0]}
	                component={MuiTextField}
	                name="services.openingHourse.tuesday[0]"
	                label="Tuesday From"
	              />
              	<Field
	                error={handleError(errors.services?.openingHourse.tuesday[1])}
	                helperText={errors.services?.openingHourse.tuesday[1]}
	                component={MuiTextField}
	                name="services.openingHourse.tuesday[1]"
	                label="To"
	              />
              </Box>
              <Box>
              	<Field
	                error={handleError(errors.services?.openingHourse.wednesday[0])}
	                helperText={errors.services?.openingHourse.wednesday[0]}
	                component={MuiTextField}
	                name="services.openingHourse.wednesday[0]"
	                label="Wednesday From"
	              />
	              <Field
	                error={handleError(errors.services?.openingHourse.wednesday[0])}
	                helperText={errors.services?.openingHourse.wednesday[0]}
	                component={MuiTextField}
	                name="services.openingHourse.wednesday[0]"
	                label="To"
	              />
              </Box>
              <Box>
              	<Field
	                error={handleError(errors.services?.openingHourse.thursday[0])}
	                helperText={errors.services?.openingHourse.thursday[0]}
	                component={MuiTextField}
	                name="services.openingHourse.thursday[0]"
	                label="Thursday From"
	              />
              	<Field
	                error={handleError(errors.services?.openingHourse.thursday[1])}
	                helperText={errors.services?.openingHourse.thursday[1]}
	                component={MuiTextField}
	                name="services.openingHourse.thursday[1]"
	                label="To"
	              />
              </Box>
              <Box>
              	<Field
	                error={handleError(errors.services?.openingHourse.friday[0])}
	                helperText={errors.services?.openingHourse.friday[0]}
	                component={MuiTextField}
	                name="services.openingHourse.friday[0]"
	                label="Friday From"
	              />
	              <Field
	                error={handleError(errors.services?.openingHourse.friday[1])}
	                helperText={errors.services?.openingHourse.friday[1]}
	                component={MuiTextField}
	                name="services.openingHourse.friday[1]"
	                label="To"
	              />
              </Box>
              <Box>
              	<Field
	                error={handleError(errors.services?.openingHourse.saturday[0])}
	                helperText={errors.services?.openingHourse.saturday[0]}
	                component={MuiTextField}
	                name="services.openingHourse.saturday[0]"
	                label="Saturday From"
	              />
	              <Field
	                error={handleError(errors.services?.openingHourse.saturday[1])}
	                helperText={errors.services?.openingHourse.saturday[1]}
	                component={MuiTextField}
	                name="services.openingHourse.saturday[1]"
	                label="To"
	              />
              </Box>
            </Widget>
            <Widget>
							<Typography variant="h6" gutterBottom>Payment Methods</Typography>
							<Field
    						handleChange={(value) => handleCheckboxChange(value, "cash")}
    						as={FormikCheckBox}
    						control={<FormikCheckBox />}
    						label="Cash"
							/>
							<Field
    						handleChange={(value) => handleCheckboxChange(value, "vodafoneCash")}
    						as={FormikCheckBox}
    						props={{disabled: true}}
    						control={<FormikCheckBox />}
    						label="Vodafone Cash"
							/>
							<Field
    						as={FormikCheckBox}
    						control={<FormikCheckBox />}
    						props={{disabled: true}}
    						handleChange={(value) => handleCheckboxChange(value, "etisalatCash")}
    						label="Etisalat Cash"
							/>
		  			</Widget>
		  			<Button
              id="submit-btn"
              variant="contained"
              type="submit"
            >
            	Add Business +
            </Button>
					</Form>
				)}
			</Formik>
		</section>

	)
}

export default AddNewBusinesse;