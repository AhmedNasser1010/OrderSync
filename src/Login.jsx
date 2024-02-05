import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { object, string, date, array, boolean } from 'yup';
import { useDispatch } from 'react-redux';
import { addUser } from "./rtk/slices/userSlice.js";

// MUI
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// Components
import { Formik, Form, Field, ErrorMessage } from 'formik';
import PageTitle from "./Component/PageTitle.jsx";
import MuiTextField from "./Component/MuiTextField.jsx";

// Functions
import auth_loginUser from "./function/auth_loginUser.js";


// Login validation schema
let loginValidationSchema = object({
    email: string().email().required("Email must be a valid email"),
    password: string().required("Password is required").min(6, "Your password is too short"),
});

const Login = () => {
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

    return (
        <Box>
            <PageTitle title="Login" />
            <Formik
                initialValues={{
                    email: "",
                    password: ""
                }}
                validationSchema={loginValidationSchema}
                onSubmit={values => {
                    setReadyToSubmit(true);
                    auth_loginUser(values, (isPassed, error, result) => {
                        if (isPassed) {
                            dispatch(addUser(result));
                            navigate("/");
                        } else {
                            setReadyToSubmit(false);
                            setAuthError({...authError, error});
                        }
                    });
                }}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form onChange={() => setReadyToSubmit(false)}>
                        <Stack spacing={2} sx={{width: "50%"}}>
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
                                Login
                            </Button>

                            <span>You have no account? <Link to="/signup" style={{ color: "#2a59d2" }}>Signup</Link> now!</span>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Box>
    );
}

export default Login;