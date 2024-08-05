import { useState } from 'react'
import { object, string, array } from 'yup'
import { Formik, Form, Field } from 'formik'
import { useDispatch, useSelector } from 'react-redux'

import Button from '@mui/material/Button'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import SaveIcon from '@mui/icons-material/Save'
import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'

import MuiTextField from "./MuiTextField.jsx"

import { newStaff } from '../rtk/slices/staffSlice'
import _addDoc from '../functions/_addDoc'
import workerSchema from '../schemas/workerSchema'

const validationSchema = object({
	name: string().required('User name is required'),
	phone: string().required('User phone is required'),
	email: string().email('Invalid email address').required('Email address is required'),
	role: string().oneOf(['ORDER_CAPTAIN', 'DRIVER'], 'Invalid selection').required('User role is required'),
	uid: string().required('User id is required')
})

const initialValues = {
	name: '',
	phone: '',
	email: '',
	role: 'SELECT',
	uid: ''
}

const NewWorkerForm = ({ handleDialogOpenClose }) => {
	const dispatch = useDispatch()
	const accessToken = useSelector(state => state.user.accessToken)
	const [isDisabled, setIsDisabled] = useState(false)
	const business = useSelector(state => state.business)

	const filedPops = (errors, touched, name, label) => {
		return {
			error: errors[name] && touched[name] && true,
			helperText: errors[name] && touched[name] && errors[name],
			component: MuiTextField,
			name,
			label,
			fullWidth: true,
			sx: {
				marginBottom: '10px'
			}
		}
	}

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={validationSchema}
			onSubmit={values => {
				setIsDisabled(true)
				const data = workerSchema({ ...values, accessToken })
				_addDoc('drivers', data, values.uid)
				.then(res => {
					if (res) {
						dispatch(newStaff(data))
						handleDialogOpenClose()
					}
				})
			}}
		>
			{({ errors, touched }) => (

				<DialogContent>
					<Form>

						<Stack direction='row' spacing={1} style={{ marginBottom: '10px' }}>
							<Field {...filedPops(errors, touched, 'name', 'Name')} />
							<Field {...filedPops(errors, touched, 'phone', 'Phone')} />
						</Stack>

						<Stack direction='row' spacing={1} style={{ marginBottom: '10px' }}>
							<Field {...filedPops(errors, touched, 'email', 'Email')} />
							<Field {...filedPops(errors, touched, 'role', 'Role')} select>
								<MenuItem value='SELECT'>Select user role</MenuItem>
								{ business?.settings?.orderManagement?.assign?.forCooks && <MenuItem value='ORDER_CAPTAIN'>Orders Captain</MenuItem> }
								{ business?.settings?.orderManagement?.assign?.forDeliveryWorkers && <MenuItem value='DRIVER'>Delivery Captain</MenuItem> }
							</Field>
						</Stack>

						<Field {...filedPops(errors, touched, 'uid', 'User Id')} />

						<DialogActions>
							<Button
								variant='contained'
								type="submit"
								startIcon={<SaveIcon />}
								disabled={isDisabled}
							>
								Save Worker
							</Button>
						</DialogActions>
					</Form>
				</DialogContent>

			)}
		</Formik>
	)
}

export default NewWorkerForm