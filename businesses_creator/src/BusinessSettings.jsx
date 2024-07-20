import { useState, useEffect } from "react";
import { object, string, date, array, boolean } from 'yup';
import { useNavigate, useParams } from "react-router-dom";
import { addBusiness } from "./rtk/slices/businessesSlice.js";
import { pushAccesTokenToTheUser } from "./rtk/slices/userSlice.js";
import { useDispatch, useSelector } from "react-redux";
import businessValidationSchema from './validation_schemas/businessValidationSchema.js';
import { deleteAccessTokenFromTheUser } from "./rtk/slices/userSlice.js";
import { deleteBusiness, updateBusiness } from "./rtk/slices/businessesSlice.js";

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

const BusinessSettings = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { accessToken } = useParams();	
	const [isSubmited, setIsSubmited] = useState(false);
	const [submitColor, setSubmitColor] = useState(undefined);
  const [submitErrorVisibility, setSubmitErrorVisibility] = useState(false);
	const businesses = useSelector((state) => state.businesses);

  const [businessValues, setBusinessValues] = useState({ lastUpdate: String(Date.now()) });

  useEffect(() => {
  	const filteredBusiness = businesses.filter((business) => business.accessToken === accessToken);
		setBusinessValues({...businessValues, ...filteredBusiness[0]})
	}, [businesses])

	const handleDelete = () => {
		navigate("/businesses?tab=management");
		dispatch(deleteAccessTokenFromTheUser(accessToken));
		dispatch(deleteBusiness(accessToken));
	}

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
		businessValidationSchema.validate(businessValues)
  		.then(valid => {
  			setIsSubmited(true);
  			setSubmitColor(undefined);
  			
  			dispatch(updateBusiness(businessValues));
				navigate("/businesses?tab=management");
  		})
  		.catch(error => {
  			setSubmitErrorVisibility(true);
  			setIsSubmited(false);
  			setSubmitColor("error");
  		});
	}

	return (

		<Box>
			<PageTitle title="Update Business" />

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
					<BusinessOwnerInfoFieldsWidget
						businessOwnerInfoValues={handleBusinessValuesChanges}
						initialValues={businessValues.owner}
						filledValues={true}
					/>
					<BusinessInfoFieldsWidget
						businessInfoValues={handleBusinessValuesChanges}
						initialValues={businessValues.business}
						filledValues={true}
					/>
				</Stack>

				<Stack direction="row" spacing={3}>
					<BusinessOpeningHoursFieldsWidget
						businessOpeningHoursValues={handleBusinessValuesChanges}
						initialValues={businessValues.services?.openingHours}
						filledValues={true}
					/>
					<BusinessCookTimeWidget
						businessCookTimeValues={handleBusinessValuesChanges}
						initialValues={businessValues.services?.cookTime}
						filledValues={true}
					/>
					{/*<BusinessPaymentMethodsFieldsWidget
						businessPaymentMethodsValues={handleBusinessValuesChanges}
						initialValues={businessValues.services?.paymentMethods}
						filledValues={true}
					/>*/}
				</Stack>

				<Stack
					sx={{ margin: '1.5em 0 1.5em' }}
					direction='row'
					spacing={1}
				>
					<Button
						sx={{ width: '70%' }}
						id="submit-btn"
						variant="contained"
					  onClick={handleSubmit}
					  disabled={isSubmited}
					  color={submitColor}
						>
							Update Business
					</Button>

					<Button
						sx={{ width: '30%' }}
						color='error'
						id="submit-btn"
						variant="contained"
					  onClick={handleDelete}
						>
							Delete Business
					</Button>
				</Stack>

			</Stack>

		</Box>

	)
}

export default BusinessSettings;