import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'
import { addCheckout } from '../rtk/slices/checkoutSlice'
import { Formik, Form, Field } from 'formik';
import { object, string, date, array, boolean } from 'yup';
import styled from 'styled-components'

import Divider from './Divider'
import CheckoutMainButton from './CheckoutMainButton'
import InputWrapper from './StyledInput/InputWrapper'
import CheckoutPageTitle from './CheckoutPageTitle'

const Container = styled.div``
const HelperText = styled.span`
	color: red;
`
const FormContainer = styled(Form)`
	& label {
		margin-bottom: 20px;
    display: block;
	}
`
const FieldContainer = styled(Field)``
const SubmitBtn = styled.button``

const initialValues = {
	name: '',
	phone: '',
	comment: ''
}

const phoneNumberRegex = /\d{11}/
const validationSchema = object({
	name: string().required('name is required'),
	phone: string().required('phone is required').matches(phoneNumberRegex, 'Phone number is not valid. Example: 01117073085'),
	comment: string()
})

function CheckoutUserInfoForm({ handleCurrentState }) {
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const InputWrapperProps = (name, label, placeholder, errors, touched) => {
		return {
			name: name,
			label: label,
			placeholder: placeholder,
			as: Field,
			error: errors && touched && errors[name] && touched[name] && true,
			helperMsg: errors && touched && errors[name] && touched[name] && errors[name],
			style: `margin-bottom: 20px !important;`
		}
	}

	return (

		<Container>
			<CheckoutPageTitle title='Contact Information' />
			<Formik
				enableReinitialize
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={valuse => {
					dispatch(addCheckout({ user: {...valuse} }))
					handleCurrentState('ON_USER_ADDRESS')
				}}
			>
				{({ isSubmitting, errors, touched, valuse }) => (
					<FormContainer>
						<InputWrapper {...InputWrapperProps('name', 'Name', 'Ahmed Nasser', errors, touched)} />
						<InputWrapper {...InputWrapperProps('phone', 'Phone Number', '01117073085', errors, touched)} />
						<InputWrapper {...InputWrapperProps('comment', 'Comment', 'No tomato, no potato, no 5osaso', errors, touched)} />
						<Divider />
						<CheckoutMainButton
							nextLabel='Next To Your Location'
							backLabel='Back To Home'
							backEventCallback={() => navigate('/')}
						/>
					</FormContainer>
				)}
			</Formik>
		</Container>

	)
}

export default CheckoutUserInfoForm