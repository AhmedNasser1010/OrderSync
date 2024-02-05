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
import auth_signupUser from "./function/auth_signupUser.js";


// Login validation schema
let signupValidationSchema = object({
    email: string().email().required("Email must be a valid email"),
    password: string().required("Password is required").min(6, "Password is too short"),
});

const Signup = () => {
    const [authError, setAuthError] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [readyToSubmit, setReadyToSubmit] = useState(false);

    const handleAuthError = () => {
        switch (authError.error) {
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

    const handleEmailErrorBoolean = (errors, touched) => {
        if (errors.email) {
            return touched.email && true
        }
        return authError.error === "auth/email-already-in-use" && true

    }
    
    return (
        <Box>
            <PageTitle title="Signup" />
            <Formik
                initialValues={{
                    email: "",
                    password: ""
                }}
                validationSchema={signupValidationSchema}
                onSubmit={values => {
                    setReadyToSubmit(true);
                     auth_signupUser(values, (isPassed, error) => {
                        if (isPassed) {
                            navigate("/login");
                        } else {
                            setReadyToSubmit(false);
                            setAuthError({...authError, error});
                        }
                     })
                }}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form onChange={() => setReadyToSubmit(false)}>
                        <Stack spacing={2} sx={{width: "50%"}}>
                            <Field
                                error={handleEmailErrorBoolean(errors, touched)}
                                helperText={`${authError.error === "auth/email-already-in-use" ? "Email already in use" : ""} ${errors.email && touched.email ? errors.email : ""}`}
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
                                id="submit-btn"
                                variant="contained"
                                type="submit"
                                disabled={readyToSubmit && isSubmitting}
                            >
                                Signup
                            </Button>

                            <span>You already have account? <Link to="/login" style={{ color: "#2a59d2" }}>Login</Link></span>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Box>
    );
}

export default Signup;