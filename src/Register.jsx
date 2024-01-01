import React, { useEffect } from "react";



// Components
import PageTitle from "./Component/PageTitle";
import Form from "./Component/Form";

const Register = () => {
    const formSettings = {
		theme: "theme1",
		afterSubmitNavigatePath: "/",
        btnText: "Register",
        job: "register",
		fields:[
			{ tag: "input", type: "email", name: "email", title: "Email", defaultData: "" },
			{ tag: "input", type: "password", name: "password", title: "Password", defaultData: "" }
		],
	};

    return (
        <div className="register">
            <PageTitle title="Register a New Account" />
            <Form settings={formSettings} />
        </div>
    )
}

export default Register;