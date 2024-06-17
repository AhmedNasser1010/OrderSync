import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { object, string, date, array, boolean } from 'yup'
import { useDispatch } from 'react-redux'
import { addUser } from "../rtk/slices/userSlice.js"
import { setUserRegisterStatus } from '../rtk/slices/conditionalValuesSlice'

import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'

import MuiTextField from "./MuiTextField.jsx"

import AUTH_LOGIN from "../utils/AUTH_LOGIN.js"
import AUTH_SIGNUP from '../utils/AUTH_SIGNUP.js'

// Login validation schema
let loginValidationSchema = object({
  email: string().email().required("Email must be a valid email"),
  password: string().required("Password is required").min(6, "Your password is too short"),
});

function RegisterForm({ registerAction }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState({})
  const [readyToSubmit, setReadyToSubmit] = useState(false)


  const handleAuthError = () => {
    switch (authError.error) {
    	case "auth/invalid-credential":
      	return "Password or email are not valid, please try again"
        break
      case "auth/too-many-requests":
        return "Too many requests, please try again later."
        break
      case "invalid-argument":
        return "We're having issues in registration process, please try again later."
        break
      case "auth/network-request-failed":
        return "Network error, check your internet connection and try again."
        break
      case "auth/email-already-in-use":
        return "Email already in use."
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
          setReadyToSubmit(true)

          registerAction === 'login' && AUTH_LOGIN(values, (isPassed, error, result) => {
          	if (isPassed) {
              if (result) {
                dispatch(addUser(result))
                dispatch(setUserRegisterStatus('LOGGED_IN'))
                navigate('/')
              } else {
                dispatch(setUserRegisterStatus('LOGGED_IN_NO_WORKER'))
                navigate("/")
              }
          	} else {
            	setReadyToSubmit(false)
              dispatch(setUserRegisterStatus('LOGGED_OUT'))
            	setAuthError({...authError, error})
          	}
        	})

          registerAction === 'signup' && AUTH_SIGNUP(values, (isPassed, error, result) => {
            if (isPassed) {
              if (result) {
                dispatch(addUser(result))
                dispatch(setUserRegisterStatus('LOGGED_IN'))
                navigate('/')
              } else {
                dispatch(setUserRegisterStatus('LOGGED_IN_NO_WORKER'))
                navigate("/")
              }
            } else {
              setReadyToSubmit(false)
              dispatch(setUserRegisterStatus('LOGGED_OUT'))
              setAuthError({...authError, error})
            }
          })
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
                { registerAction === 'login' ? 'LOGIN' : 'SIGNUP' }
              </Button>

            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default RegisterForm