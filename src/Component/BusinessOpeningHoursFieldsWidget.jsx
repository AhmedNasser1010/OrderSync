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

// Validation Schema
import { businessOpeningHoursValidationSchema } from "../AddNewBusiness.jsx";

const BusinessOpeningHoursFieldsWidget = ({ businessOpeningHoursValues, values }) => {
	const [readyToSubmit, setReadyToSubmit] = useState(false);
	return (

		<Formik
			enableReinitialize
			initialValues={values}
			validationSchema={businessOpeningHoursValidationSchema}
			onSubmit={values => {
				setReadyToSubmit(true);
				businessOpeningHoursValues({...values}, 'services.openingHours');
			}}
		>
			{({ isSubmitting, errors, touched }) => (

				<Form onChange={() => setReadyToSubmit(false)} style={{ width: '100%' }}>
					<Widget>
						<Typography variant="h6" gutterBottom>Opening Hours</Typography>
						<Stack>
							<Stack direction='row' spacing={1} sx={{ minWidth: "100%", marginBottom: "0.5rem" }}>
								<Field
		              error={errors.sunday?.start && touched.sunday?.start && true}
		              helperText={errors.sunday?.start && touched.sunday?.start && errors.sunday?.start}
		              component={MuiTextField}
		              name="sunday.start"
		              label="Sunday From"
		              fullWidth
		             />
		            <Field
		             	error={errors.sunday?.end && touched.sunday?.end && true}
		              helperText={errors.sunday?.end && touched.sunday?.end && errors.sunday?.end}
		              component={MuiTextField}
		              name="sunday.end"
		             	label="To"
		             	fullWidth
		            />
	            </Stack>
	            <Stack direction='row' spacing={1} sx={{ minWidth: "100%", marginBottom: "0.5rem" }}>
	              <Field
		              error={errors.monday?.start && touched.monday?.start && true}
		              helperText={errors.monday?.start && touched.monday?.start && errors.monday?.start}
		              component={MuiTextField}
		              name="monday.start"
		              label="Monday From"
		              fullWidth
		            />
		            <Field
		              error={errors.monday?.end && touched.monday?.end && true}
		              helperText={errors.monday?.end && touched.monday?.end && errors.monday?.end}
		              component={MuiTextField}
		              name="monday.end"
		              label="To"
		              fullWidth
		            />
	            </Stack>
	            <Stack direction='row' spacing={1} sx={{ minWidth: "100%", marginBottom: "0.5rem" }}>
	            	<Field
		              error={errors.tuesday?.start && touched.tuesday?.start && true}
		              helperText={errors.tuesday?.start && touched.tuesday?.start && errors.tuesday?.start}
		              component={MuiTextField}
		              name="tuesday.start"
		              label="Tuesday From"
		              fullWidth
		            />
	             	<Field
		              error={errors.tuesday?.end && touched.tuesday?.end && true}
		              helperText={errors.tuesday?.end && touched.tuesday?.end && errors.tuesday?.end}
		              component={MuiTextField}
		              name="tuesday.end"
		              label="To"
		              fullWidth
		            />
	            </Stack>
	            <Stack direction='row' spacing={1} sx={{ minWidth: "100%", marginBottom: "0.5rem" }}>
	             	<Field
		              error={errors.wednesday?.start && touched.wednesday?.start && true}
		              helperText={errors.wednesday?.start && touched.wednesday?.start && errors.wednesday?.start}
		              component={MuiTextField}
		              name="wednesday.start"
		              label="Wednesday From"
		              fullWidth
		            />
		            <Field
		              error={errors.wednesday?.end && touched.wednesday?.end && true}
		              helperText={errors.wednesday?.end && touched.wednesday?.end && errors.wednesday?.end}
		              component={MuiTextField}
		              name="wednesday.end"
		              label="To"
		              fullWidth
		            />
	            </Stack>
	            <Stack direction='row' spacing={1} sx={{ minWidth: "100%", marginBottom: "0.5rem" }}>
	            	<Field
		              error={errors.thursday?.start && touched.thursday?.start && true}
		              helperText={errors.thursday?.start && touched.thursday?.start && errors.thursday?.start}
		              component={MuiTextField}
		              name="thursday.start"
		              label="Thursday From"
		              fullWidth
		            />
	              <Field
		              error={errors.thursday?.end && touched.thursday?.end && true}
		              helperText={errors.thursday?.end && touched.thursday?.end && errors.thursday?.end}
		              component={MuiTextField}
		              name="thursday.end"
		              label="To"
		              fullWidth
		            />
	            </Stack>
	            <Stack direction='row' spacing={1} sx={{ minWidth: "100%", marginBottom: "0.5rem" }}>
	              <Field
		              error={errors.friday?.start && touched.friday?.start && true}
		              helperText={errors.friday?.start && touched.friday?.start && errors.friday?.start}
		              component={MuiTextField}
		              name="friday.start"
		              label="Friday From"
		              fullWidth
		            />
		            <Field
		              error={errors.friday?.end && touched.friday?.end && true}
		              helperText={errors.friday?.end && touched.friday?.end && errors.friday?.end}
		              component={MuiTextField}
		              name="friday.end"
		              label="To"
		              fullWidth
		            />
	            </Stack>
	            <Stack direction='row' spacing={1} sx={{ minWidth: "100%", marginBottom: "0.5rem" }}>
	             	<Field
		              error={errors.saturday?.start && touched.saturday?.start && true}
		              helperText={errors.saturday?.start && touched.saturday?.start && errors.saturday?.start}
		              component={MuiTextField}
		              name="saturday.start"
		              label="Saturday From"
		              fullWidth
		            />
		            <Field
		              error={errors.saturday?.end && touched.saturday?.end && true}
		              helperText={errors.saturday?.end && touched.saturday?.end && errors.saturday?.end}
		              component={MuiTextField}
		              name="saturday.end"
		              label="To"
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

export default BusinessOpeningHoursFieldsWidget;