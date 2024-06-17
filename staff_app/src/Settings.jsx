import { useDispatch } from 'react-redux'
import { clearUser } from './rtk/slices/userSlice'
import { clearBusiness } from './rtk/slices/businessSlice'
import { clearOrders } from './rtk/slices/ordersSlice'
import { setUserRegisterStatus } from './rtk/slices/conditionalValuesSlice'
import { clearMenu } from './rtk/slices/menuSlice'

import Button from '@mui/material/Button'

import PageTitle from './Components/PageTitle'
import Container from './Components/Container'

import AUTH_SIGNOUT from './utils/AUTH_SIGNOUT'

function Settings() {
	const dispatch = useDispatch()

	const handleLogout = () => {
		dispatch(clearUser())
		dispatch(clearBusiness())
		dispatch(clearOrders())
		dispatch(clearMenu())
		dispatch(setUserRegisterStatus('LOGGED_OUT'))
		AUTH_SIGNOUT()
	}

	return (

		<Container>
			<PageTitle>Settings</PageTitle>
			<Button
				onMouseUp={handleLogout}
				variant="outlined"
				color="error"
			>
				Logout
			</Button>
		</Container>

	)
}

export default Settings