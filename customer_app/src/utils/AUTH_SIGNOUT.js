import { auth } from "../config/firebase.js"
import { signOut } from "firebase/auth"

const AUTH_SIGNOUT = async () => {
	try {
		if (auth.currentUser) {

			// signout process
			signOut(auth)
				.catch((error) => {
					const errorCode = error.code
					const errorMessage = error.message

					console.log(error)
				})
		} else {
			console.warn("You are already logged out")
		}

		return true
	} catch(err) {
		console.log(err)
		return false
	}
}

export default AUTH_SIGNOUT