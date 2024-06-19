import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { object, string, date, array, boolean } from 'yup';
import { useDispatch } from 'react-redux';

import { setUserRegisterStatus, setIsGetAppData } from '../rtk/slices/conditionalValuesSlice'
import { addUser } from '../rtk/slices/userSlice'
import { initStaff } from '../rtk/slices/staffSlice'
import { addMenu } from '../rtk/slices/menuSlice'
import { initBusiness } from '../rtk/slices/businessSlice'
import { setOpenedOrders } from '../rtk/slices/ordersSlice'

// MUI
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Components
import MuiTextField from "./MuiTextField.jsx";

// Functions
import AUTH_loginUser from "../functions/AUTH_loginUser.js";
import AUTH_SIGNUP from "../functions/AUTH_SIGNUP.js";
import AUTH_signout from "../functions/AUTH_signout.js";
import fetchStaff from '../functions/fetchStaff'
import DB_GET_DOC from '../functions/DB_GET_DOC'
import AUTH_ON_CHANGE from '../functions/AUTH_ON_CHANGE'

// Login validation schema
let loginValidationSchema = object({
	email: string().email().required("Email must be a valid email"),
	password: string().required("Password is required").min(6, "Your password is too short"),
});

const RegistrationForm = ({ action }) => {
	const [authError, setAuthError] = useState({});
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [readyToSubmit, setReadyToSubmit] = useState(false);


	const handleAuthError = () => {
		switch (authError.error) {
			case "auth/invalid-credential":
				return "Password or email are not valid, please try again"
				break;
			case "auth/too-many-requests":
				return "Too many requests, please try again later."
				break;
			case "invalid-argument":
				return "We're having issues in registration process, please try again later."
				break;
			case "auth/network-request-failed":
				return "Network error, check your internet connection and try again."
				break;
		}
	}

	const handleGetAppData = (userData) => {
		if (userData) {
			dispatch(setIsGetAppData(true))
			const accessToken = userData.accessToken

			if (userData.userInfo.role !== 'BUSINESS_MANAGER') {
				dispatch(setUserRegisterStatus('LOGGED_OUT'))
				dispatch(setIsGetAppData(false))
				AUTH_signout()
				navigate("/login")
				return
			}

			dispatch(setUserRegisterStatus('LOGGED_IN'))
			dispatch(addUser(userData))
			fetchStaff(accessToken).then(res => dispatch(initStaff(res)))
			DB_GET_DOC('menus', accessToken).then(res => dispatch(addMenu(res)))
			DB_GET_DOC('businesses', accessToken).then(res => dispatch(initBusiness(res)))

			dispatch(setIsGetAppData(false))

		} else {
			dispatch(setUserRegisterStatus('LOGGED_IN_NO_BUSINESS'))
		}
	}

	return (
		<Box>
			<Formik
				initialValues={{
					email: "",
					password: ""
				}}
				validationSchema={loginValidationSchema}
				onSubmit={values => {
					setReadyToSubmit(true);

					if (action === 'login') {
						AUTH_loginUser(values, (isPassed, error, result) => {
							if (isPassed) {
								if (result) {
									handleGetAppData(result)
									navigate('/')
								} else {
									dispatch(setUserRegisterStatus('LOGGED_IN_NO_BUSINESS'))
									navigate('/')
								}
							} else {
								setReadyToSubmit(false);
								setAuthError({...authError, error});
							}
						});
					} else if (action === 'signup') {
						AUTH_SIGNUP(values, (isPassed, error, result) => {
							if (isPassed) {
								if (result) {
									handleGetAppData(result)
									navigate('/')
								} else {
									dispatch(setUserRegisterStatus('LOGGED_IN_NO_BUSINESS'))
									navigate('/')
								}
							} else {
								setReadyToSubmit(false);
								setAuthError({...authError, error});
							}
						});
					}
				}}
			>
				{({ isSubmitting, errors, touched }) => (
					<Form onChange={() => setReadyToSubmit(false)}>
						<Stack spacing={2}>
							<Field
								error={errors.email && touched.email && true}
								helperText={errors.email && touched.email && errors.email}
								component={MuiTextField}
								name="email"
								label="Email"
							/>
							<Field
								component={MuiTextField}
								error={errors.password && touched.password && true}
								helperText={errors.password && touched.password && errors.password}
								name="password"
								label="Password"
								type="password"
								id="outlined-password-input"
								autoComplete="current-password"
							/>

							<span style={{color: "#d32f2f"}}>{ handleAuthError() }</span>

							<Button
								variant="contained"
								type="submit"
								disabled={readyToSubmit && isSubmitting}
							>
								{ action === 'login' && 'Login' }
								{ action === 'signup' && 'Signup' }
							</Button>

						</Stack>
					</Form>
				)}
			</Formik>
		</Box>
	);
}

export default RegistrationForm;