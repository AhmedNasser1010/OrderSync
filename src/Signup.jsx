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
    password: string().required("Password is required"),
});

const Signup = () => {
    const [authError, setAuthError] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const handleError = (err) => {
        return err && true
    }

    const handleAuthError = () => {
        switch (authError.error) {
            case "auth/too-many-requests":
                return "Too many requests, please try again later."
                break;
            case "invalid-argument":
                return "We're having issues in registration process, please try again later."
                break;
        }
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
                     auth_signupUser(values, (isPassed, error) => {
                        if (isPassed) {
                            navigate("/login");
                        } else {
                            setAuthError({...authError, error});
                        }
                     })
                }}
            >
                {({ isSubmitting, errors }) => (
                    <Form>
                        <Stack spacing={2} sx={{width: "50%"}}>
                            <Field
                                error={handleError(errors.email) || handleError(authError.error)}
                                helperText={errors.email || authError.error === "auth/email-already-in-use" && "Email already in use"}
                                component={MuiTextField}
                                name="email"
                                label="Email"
                            />
                            <Field
                                component={MuiTextField}
                                error={handleError(errors.password)}
                                helperText={errors.password}
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