import { useDispatch } from 'react-redux'
import { auth } from "../firebase.js"
import DB_GET_DOC from "../utils/DB_GET_DOC.js"
import AUTH_SIGNOUT from '../utils/AUTH_SIGNOUT'
import { addUser } from '../rtk/slices/userSlice'
import { setUserRegisterStatus } from '../rtk/slices/conditionalValuesSlice'

function useAutoRegister() {
	const dispatch = useDispatch()

	const autoRegister = async () => {
		try {

			const userAuth = await new Promise((resolve, reject) => {
				const unsubscribe = auth.onAuthStateChanged(res => {
					if (res) {
						unsubscribe()
						resolve(res)
					}
				})
			})

			if (userAuth) {
				const user = await DB_GET_DOC("drivers", userAuth.uid)

				if (user.userInfo.role !== 'DRIVER') {
					AUTH_SIGNOUT()
					navigate("/login")
					return
				}
					
				dispatch(addUser(user))
				dispatch(setUserRegisterStatus('LOGGED_IN'))

			} else {
				dispatch(setUserRegisterStatus('LOGGED_IN_NO_WORKER'))
			}

		} catch(e) {
			console.log(e)
		}
	}

	return autoRegister
}

export default useAutoRegister