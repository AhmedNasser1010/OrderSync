import { useState, useEffect, useMemo, useRef } from 'react'
import { auth } from "../../config/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { string } from 'yup'
import toast from "react-hot-toast"

import useSignupUserPhoneProvider from '../../hooks/useSignupUserPhoneProvider'
import useVerifyOtp from '../../hooks/useVerifyOtp'
import useAddUserData from '../../hooks/useAddUserData'
import DB_GET_DOC from '../../utils/DB_GET_DOC'
import DB_GET_COLLECTION from '../../utils/DB_GET_COLLECTION'
import DB_ADD_DOC from '../../utils/DB_ADD_DOC'
import customerSchema from '../../object-schemas/customerSchema'

const phoneRegEx = /^\d{11}$/

const validName = string().required('Name is required')
const validPhone = string().required('Phone number is required').matches(/^(010|011|012|015)\d{8}$/)

function SigninPhoneProvider({ status, setStatus }) {
	const signUp = useSignupUserPhoneProvider()
	const verifyOtp = useVerifyOtp()
	const addUserData = useAddUserData()
	const [formData, setFormData] = useState({
		name: '',
		countryCode: '+20',
		phoneNumber: '',
		otp: '',
		referral: ''
	})
	const [formError, setFormError] = useState({
		name: false,
		phoneNumber: false
	})
	const [hasFilled, setHasFilled] = useState(false)
	const [hasReferral, setHasReferral] = useState(false)
	const registeredNumbers = useRef([])
	const [isLoggedInBefore, setIsLoggedInBefore] = useState(null)

	useEffect(() => {
		setIsLoggedInBefore(null)
	}, [formData.phoneNumber])

	const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    })
  }

  const handleSend = async (event) => {
  	if (phoneRegEx.test(formData.phoneNumber)) {
  		setFormError(formError => {return { ...formError, phoneNumber: false }})
  		if (status === 'LOGIN' || (formData.name.length > 2 && formData.name.length < 25)) {
  			if (registeredNumbers.current.length) {
	  			registeredNumbers.current.map(num => {
	  				if (num === `+2${formData?.phoneNumber}`) {
	  					setIsLoggedInBefore(true)
	  					return
	  				} else {
	  					setIsLoggedInBefore(false)
	  				}
	  			})
  			} else {
  				setIsLoggedInBefore(false)
  			}

	  		setFormError(formError => {return { ...formError, name: false }})

	  		if (status === 'SIGNUP') {
	  			if (isLoggedInBefore === false) {
	  				setHasFilled(true)
	  				generateRecaptcha()
	    			signUp(formData)
	  				}
	  		} else if (status === "LOGIN") {
	  			if (isLoggedInBefore === true) {
	  				setHasFilled(true)
	  				generateRecaptcha()
	    			signUp(formData)
	  			}
	  		}

	  	} else {
	  		setFormError(formError => {return { ...formError, name: true }})
	  		return
	  	}
  	} else {
  		setFormError(formError => {return { ...formError, phoneNumber: true }})
  		return
  	}
  }

  const handleTryAgain = () => {
  	setFormData({
			phoneNumber: '',
			otp: '',
			referral: ''
		})
		setHasFilled(false)
  }

  const handleFieldChange = (e) => {
  	const name = e.target.name
  	const value = e.target.value

  	setFormData(formData => {
  		return {
  			...formData,
  			[name]: value
  		}
  	})
  }

  useEffect(() => {
  	DB_GET_COLLECTION('customers')
  	.then(res => {
  		if (res) {
  			registeredNumbers.current = res.map(user => {
  				return user?.userInfo?.phone
  			})
  		}
  	})
  }, [])

  // verify otp
  useEffect(() => {
  	verifyOtp(formData.otp).then(user => {

  		if (user?.uid) {
  			if (status === 'SIGNUP') {
  				if (isLoggedInBefore === false) {
    				DB_ADD_DOC('customers', user.uid, customerSchema({ user: user?.uid, name: formData?.name, phone: formData?.phoneNumber, referredBy: formData?.referral, provider: 'Phone' }))
  					.then(res => res && window.location.reload())
  				}
  			} else if (status === "LOGIN") {
  				if (isLoggedInBefore === true) {
    				window.location.reload()
  				}
  			}
  		}

  	})
  }, [formData.otp])

	return (

		<div className='flex flex-col'>
			{
				!hasFilled &&
					<>
						<input
							className={`p-5 border border-gray-300 ${status === 'SIGNUP' && 'border-b-0'} ${ formError.phoneNumber && 'error' }`}
							type="text"
							name="phoneNumber"
							id="phone"
							placeholder='Phone Number'
							vlaue={formData.phoneNumber}
							onChange={handleFieldChange}
						/>
						{ status === "LOGIN" && isLoggedInBefore === false && <p className='text-red-500 mt-2 font-ProximaNovaMed text-sm pr-5 cursor-pointer' onMouseUp={() => setStatus('SIGNUP')}>This phone number is not registered. <span className='text-bold text-indigo-500'>Please sign up for a new account.</span></p> }
						{
							status === "SIGNUP" &&
								<>
								<input
									className={`p-5 border border-gray-300 ${ formError.name && 'error' }`}
									type="text"
									name="name"
									id="name"
									placeholder='Name'
									vlaue={formData.name}
									onChange={handleFieldChange}
								/>
								{ isLoggedInBefore === true && <p className='text-red-500 mt-2 font-ProximaNovaMed text-sm pr-5 cursor-pointer' onMouseUp={() => setStatus('LOGIN')}>This phone number has been logged in previously. <span className='text-bold text-indigo-500'>Please proceed to login.</span></p> }
								{ /*hasReferral*/
									false &&
									<input
										className='p-5 border border-gray-300 border-t-0'
										type="text"
										name="referral"
										id="referral"
										placeholder='Referral Code'
										vlaue={formData.referral}
										onChange={handleFieldChange}
									/>
								}
								{	/*!hasReferral*/
									false && <p onMouseUp={() => setHasReferral(true)} className='cursor-pointer text-blue-500 mt-2 font-ProximaNovaMed text-sm pr-5'>Have a referral code?</p>
								}
								</>
						}
					</>
			}
			{
				hasFilled &&
					<input
						className='p-5 border border-gray-300'
						type="text"
						name="otp"
						id="otp"
						placeholder='Verify Code'
						vlaue={formData.otp}
						onChange={handleFieldChange}
					/>
			}
			{
				!hasFilled &&
					<button
						onClick={handleSend}
						className='w-full bg-color-2 py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer mt-5'
					>
						{ status === 'SIGNUP' ? 'Create New Account' : 'Login'}
					</button>
			}
			{ hasFilled && <p className='text-[#686b78] mt-2 font-ProximaNovaMed text-sm pr-5'>Not your phone number? <span className='text-bold text-black cursor-pointer' onMouseUp={handleTryAgain}>try again</span></p>}
			{ !hasFilled && <p className='text-[#686b78] mt-2 font-ProximaNovaMed text-sm pr-5'>By clicking on Login, I accept the Terms & Conditions & Privacy Policy</p> }
			<div id="recaptcha"></div>
		</div>

	)
}

export default SigninPhoneProvider