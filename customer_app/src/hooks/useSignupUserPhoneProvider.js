import { auth } from "../config/firebase"
import { signInWithPhoneNumber } from 'firebase/auth'

const useSignupUserPhoneProvider = () => {
	const signupUser = async (formData) => {
		console.log('signup user')
		let appVerifier = window.recaptchaVerifier
		signInWithPhoneNumber(auth, `${formData.countryCode}${formData.phoneNumber}`, appVerifier)
		.then((confirmationResult) => {
			// SMS sent. Prompt user to type the code from the message, then sign the
			// user in with confirmationResult.confirm(code).
			window.confirmationResult = confirmationResult
			return true
		}).catch((error) => {
			// Error; SMS not sent
			console.log(error)
			return false
		})
	}

	return signupUser
}

export default useSignupUserPhoneProvider