import { useEffect } from 'react';
import { auth } from "./firebase.js";
import Button from "@mui/material/Button"

// Functions
import AUTH_signout from "./functions/AUTH_signout.js";

const Home = () => {
	return (

		<div>
			{ auth.currentUser.email }
			<Button onClick={() => AUTH_signout()}>Signout</Button>
		</div>

	)
}

export default Home;