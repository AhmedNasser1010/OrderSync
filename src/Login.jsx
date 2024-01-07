import React from "react";
import { Link } from "react-router-dom";

// Components
import PageTitle from "./Component/PageTitle.jsx";
import Form from './Component/Form.jsx';

const Login = () => {
    const formSettings = {
		theme: "theme1",
		afterSubmitNavigatePath: "/",
        btnText: "Login",
        job: "login",
		fields:[
			{ tag: "input", type: "email", name: "email", title: "Email", defaultData: "" },
			{ tag: "input", type: "password", name: "password", title: "Password", defaultData: "" }
		],
	};

    return (
        <div className="login">
            <PageTitle title="Welcome Back! - Login" />
            <Form settings={formSettings} />
            <span style={{display: "block"}}>Or <Link to="/signup" style={{color: "blue"}}>register</Link> a new account</span>
        </div>
    );
}

export default Login;