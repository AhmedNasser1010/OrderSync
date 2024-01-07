import { Link } from "react-router-dom";

// Components
import PageTitle from "./Component/PageTitle";
import Form from "./Component/Form";

const Signup = () => {
    const formSettings = {
		theme: "theme1",
		afterSubmitNavigatePath: "/login",
        btnText: "Register",
        job: "register",
		fields:[
			{ tag: "input", type: "email", name: "email", title: "Email", defaultData: "" },
			{ tag: "input", type: "password", name: "password", title: "Password", defaultData: "" }
		],
	};

    return (
        <div className="signup">
            <PageTitle title="Register a New Account" />
            <Form settings={formSettings} />
            <span style={{display: "block"}}>You already have account? <Link to="/login" style={{color: "blue"}}>Login.</Link></span>
        </div>
    )
}

export default Signup;