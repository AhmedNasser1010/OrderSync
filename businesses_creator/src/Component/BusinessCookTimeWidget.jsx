import { useState } from "react"
import { Formik, Form, Field } from 'formik'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

import Widget from "./Widget.jsx"
import MuiTextField from "./MuiTextField.jsx"

import getNestedValue from '../function/getNestedValue.js'
import { businessCookTimeValidationSchema } from "../AddNewBusiness.jsx"

const BusinessCookTimeWidget = ({ businessCookTimeValues, initialValues, filledValues = false }) => {
	const [readyToSubmit, setReadyToSubmit] = useState(false)

	const muiTextFieldProps = (errors, touched, values, name, label) => {
		const value = getNestedValue(values, name)
		const error = getNestedValue(errors, name)
		const touch = getNestedValue(touched, name)

		return {
			InputLabelProps: filledValues && value !== '' && { shrink: true },
			error: errors && touched && error && touch && true,
			helperText: errors && touched && error && touch && error,
			component: MuiTextField,
			name: name,
			label: label,
			fullWidth: true
		}
	}

	const stackProps = () => {
		return {
			direction: 'row',
			spacing: 1,
			sx: {
				minWidth: "100%",
				marginBottom: "0.5rem"
			}
		}
	}

	return (

		<Formik
			enableReinitialize
			initialValues={initialValues}
			validationSchema={businessCookTimeValidationSchema}
			onSubmit={values => {
				setReadyToSubmit(true)
				businessCookTimeValues(values, 'services.cookTime')
			}}
		>
			{({ isSubmitting, errors, touched, values }) => (

				<Form onChange={() => setReadyToSubmit(false)} style={{ width: '100%' }}>
					<Widget>
						<Typography variant="h6" gutterBottom>Average Cook Time</Typography>
						<Stack>
							<Stack { ...stackProps() }>
								<Field { ...muiTextFieldProps(errors, touched, values, '[0]', 'Min') } />
		            <Field { ...muiTextFieldProps(errors, touched, values, '[1]', 'Max') }
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

export default BusinessCookTimeWidget