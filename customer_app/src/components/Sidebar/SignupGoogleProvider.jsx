import { IoLogoGoogle } from "react-icons/io"

import useSignupGoogleProvider from '../../hooks/useSignupGoogleProvider'

function SignupGoogleProvider() {
	const signupGoogleProvider = useSignupGoogleProvider()


	return (

		<div>
			<button
				className='relative settings-btn relative w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer mt-5 mb-5 bg-color-2'
				onMouseUp={signupGoogleProvider}
			>
				{/*<IoLogoGoogle className='absolute top-1/2 -translate-y-1/2' />*/}
				Login With Google
			</button>
		</div>

	)
}

export default SignupGoogleProvider