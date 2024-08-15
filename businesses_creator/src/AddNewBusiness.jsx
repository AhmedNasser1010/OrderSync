import { useState } from "react";
import { object, string, date, array, boolean, number } from 'yup';
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { addBusiness } from "./rtk/slices/businessesSlice.js";
import { pushAccesTokenToTheUser } from "./rtk/slices/userSlice.js";
import { useDispatch, useSelector } from "react-redux";

// Firebase
import { auth } from "./firebase.js";

// MUI
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Collapse from '@mui/material/Collapse';

// Components
import PageTitle from "./Component/PageTitle.jsx";

import BusinessOwnerInfoFieldsWidget from "./Component/BusinessOwnerInfoFieldsWidget.jsx";
import BusinessInfoFieldsWidget from "./Component/BusinessInfoFieldsWidget.jsx";
import BusinessOpeningHoursFieldsWidget from "./Component/BusinessOpeningHoursFieldsWidget.jsx";
import BusinessCookTimeWidget from "./Component/BusinessCookTimeWidget.jsx";
import BusinessPaymentMethodsFieldsWidget from "./Component/BusinessPaymentMethodsFieldsWidget.jsx";

// RegEx
const phoneNumberRegex = /^\+(\d{12})$/;
const locationCodeRegex = /^(\d{1,2})°(\d{1,2})'(\d{1,2}\.\d{1})"([NS])\s+(\d{1,3})°(\d{1,2})'(\d{1,2}\.\d{1})"([EW])$/;
// 26°50'49.1"N 29°44'20.4"E
const timeRegex = /^\d{2}:\d{2}$/;

// Validation Schemas
export const businessInfoValidationSchema = object({
	name: string().required("Business name is required").min(3, "Business name is too short").max(20, "Business name is too long"),
	nameInAr: string().required("Business arabic name is required").min(3, "Business arabic name is too short").max(20, "Business arabic name is too long"),
	icon: string().required("Business icon is required"),
	cover: string().required("Business cover is required"),
  industry: string().required("Business industry type is required"),
  address: string().required("Business Address is required"),
  latlng: array()
    .of(number().required("The field can't be empty"))
    .length(2, 'Latitude and longitude must contain exactly two numbers')
    .required('Latitude and longitude is required')
});

export const businessOpeningHoursValidationSchema = object({
	sunday: object({start: string(), end: string()}),
  monday: object({start: string(), end: string()}),
  tuesday: object({start: string(), end: string()}),
  wednesday: object({start: string(), end: string()}),
  thursday: object({start: string(), end: string()}),
  friday: object({start: string(), end: string()}),
  saturday: object({start: string(), end: string()}),
});

export const businessCookTimeValidationSchema = array().of(number().required('min/max is required')).length(2, 'cook time must contain exactly two numbers').required('cook time is required')

export const businessOwnerInfoValidationSchema = object({
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
  uid: string().required("User ID is required"),
});

export const businessPaymentMethodsValidationSchema = object({
	cash: boolean(),
	vodafoneCash: boolean(),
	etisalatCash: boolean(),
});

const businessSchema = object({
  accessToken: string().required(),
  owner: businessOwnerInfoValidationSchema,
  business: businessInfoValidationSchema,
  services: object({
  	openingHourse: businessOpeningHoursValidationSchema,
  	paymentMethods: businessPaymentMethodsValidationSchema,
  	cookTime: businessCookTimeValidationSchema
  }),
  createdOn: string(),
});

const AddNewBusiness = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const user = useSelector(state => state.user)
	const [isSubmited, setIsSubmited] = useState(false);
	const [submitColor, setSubmitColor] = useState(undefined);
  const [businessValues, setBusinessValues] = useState({
  	accessToken: uuidv4(),
  	settings: {
  		siteControl: {
  			closeMsg: '',
  			isStrictOpen: true,
  		},
  		orderManagement: {
  			assign: {
  				forCooks: false,
  				forDeliveryWorkers: false
  			}
  		}
  	},
  	business: {
			name: '',
			nameInAr: '',
			industry: '',
			address: '',
			latlng: ['', ''],
			cover: '',
			icon: '',
			promotionalSubtitle: '',
		},
		owner: {
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
			uid: '',
		},
		services: {
			openingHours: {
				sunday: {start: '', end: ''},
				monday: {start: '', end: ''},
				tuesday: {start: '', end: ''},
				wednesday: {start: '', end: ''},
				thursday: {start: '', end: ''},
				friday: {start: '', end: ''},
				saturday: {start: '', end: ''},
			},
			cookTime: [10000, 20000],
			paymentMethods: {
				cash: true,
			},
		},
		
		createdOn: String(Date.now()),});
  const [submitErrorVisibility, setSubmitErrorVisibility] = useState(false);

  const handleBusinessValuesChanges = (values, name) => {
  	setIsSubmited(false);

  	if (name.split(".")[0] === "services") {

  		const splitedName = name.split(".")[1];
  		setBusinessValues({
  			...businessValues,
  			services: {
  				...businessValues.services,
  				[splitedName]: values
  			}
  		});
  		return null;

  	};

  	setBusinessValues({...businessValues, [name]: values});

  };

	const handleSubmit = () => {
		businessSchema.validate(businessValues)
  		.then(valid => {
  			setIsSubmited(true);
  			setSubmitColor(undefined);
  			
  			dispatch(addBusiness({ ...businessValues, partnerUid: user.userInfo.uid }));
				dispatch(pushAccesTokenToTheUser(businessValues.accessToken));
				navigate("/businesses");
  		})
  		.catch(error => {
  			setSubmitErrorVisibility(true);
  			setIsSubmited(false);
  			setSubmitColor("error");
  		});
	}

	return (

		<Box>
			<PageTitle title="Add New Businesse +" />

			<Collapse in={submitErrorVisibility}>
				<Alert
					action={
						<Button
							color="error"
							onClick={() => {
								setSubmitErrorVisibility(false);
							}}
						>
							Close
						</Button>
					}
					severity="error"
					sx={{ 
						position: 'fixed',
						top: '5%',
						left: '50%',
						transform: 'translateX(-50%)',
						width: '50%',
						opacity: '95%',
						zIndex: '1',
					}}>
	      	<AlertTitle>Error</AlertTitle>
	      	- Check if there is any wrong or missing fields.<br/>
	      	- Make sure you clicked on each save button on each widget in this screen.<br/>
	      	- And please try again.
	     	</Alert>
      </Collapse>
			<Stack>

				<Stack direction="row" spacing={3}>
					<BusinessOwnerInfoFieldsWidget businessOwnerInfoValues={handleBusinessValuesChanges} initialValues={businessValues.owner} />
					<BusinessInfoFieldsWidget businessInfoValues={handleBusinessValuesChanges} initialValues={businessValues.business} />
				</Stack>

				<Stack direction="row" spacing={3}>
					<BusinessOpeningHoursFieldsWidget businessOpeningHoursValues={handleBusinessValuesChanges} initialValues={businessValues.services.openingHours} />
					<BusinessCookTimeWidget businessCookTimeValues={handleBusinessValuesChanges} initialValues={businessValues.services.cookTime} />
					{/*<BusinessPaymentMethodsFieldsWidget businessPaymentMethodsValues={handleBusinessValuesChanges} initialValues={businessValues.services.paymentMethods} />*/}
				</Stack>

				<Button
					sx={{ margin: '1.5em 0 1.5em' }}
					id="submit-btn"
					variant="contained"
				  type="submit"
				  onClick={handleSubmit}
				  disabled={isSubmited}
				  color={submitColor}
					>
						Add Business +
				</Button>

			</Stack>

		</Box>

	)
}

export default AddNewBusiness;