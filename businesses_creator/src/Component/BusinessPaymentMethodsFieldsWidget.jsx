import { useState, useEffect } from "react";

import { Formik, Form, Field } from 'formik';

// MUI
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

// Components
import Widget from "./Widget.jsx";
import FormikCheckBox from "./FormikCheckBox.jsx";

// Validation schema
import { businessPaymentMethodsValidationSchema } from "../AddNewBusiness.jsx";

const BusinessPaymentMethodsFieldsWidget = ({ businessPaymentMethodsValues, initialValues }) => {
	const [readyToSubmit, setReadyToSubmit] = useState(false);
	const [paymentValues, setPaymentValues] = useState({ cash: false, vodafoneCash: false, etisalatCash: false });

	useEffect(() => {
		setPaymentValues(initialValues)
	}, [initialValues])

	const handleCheckboxChange = (value, key) => {

  	const checked = value.target.checked;
  	setPaymentValues({...paymentValues, [key]: checked});

  }

	return (

		<Formik
			enableReinitialize
			initialValues={initialValues}
			validationSchema={businessPaymentMethodsValidationSchema}
			onSubmit={() => {
				setReadyToSubmit(true);
				businessPaymentMethodsValues(paymentValues, "services.paymentMethods");
			}}
		>
			{({ isSubmitting, errors, touched }) => (

				<Form onChange={() => setReadyToSubmit(false)} style={{ width: '100%' }}>
					<Widget>
						<Typography variant="h6" gutterBottom>Payment Methods</Typography>
						<Stack spacing={1}>
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

	);
}

export default BusinessPaymentMethodsFieldsWidget;