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
        </div>
    )
}

export default Signup;