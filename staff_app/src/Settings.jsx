import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { clearUser, setUserOnlineStatus } from './rtk/slices/userSlice'
import { clearBusiness } from './rtk/slices/businessSlice'
import { clearOrders } from './rtk/slices/ordersSlice'
import { setUserRegisterStatus } from './rtk/slices/conditionalValuesSlice'
import { clearMenu } from './rtk/slices/menuSlice'

import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'

import PageTitle from './Components/PageTitle'
import Container from './Components/Container'
import Widget from './Components/Widget/Widget'
import WidgetOption from './Components/Widget/WidgetOption'

import AUTH_SIGNOUT from './utils/AUTH_SIGNOUT'
import DB_UPDATE_NESTED_VALUE from './utils/DB_UPDATE_NESTED_VALUE'

const Widgets = styled.div`
	width: calc(100% - 30px);
	padding: 20px 15px;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin: auto;
}
`

function Settings() {
	const dispatch = useDispatch()
	const user = useSelector(state => state.user)

	const handleLogout = () => {
		dispatch(clearUser())
		dispatch(clearBusiness())
		dispatch(clearOrders())
		dispatch(clearMenu())
		dispatch(setUserRegisterStatus('LOGGED_OUT'))
		AUTH_SIGNOUT()
	}

	const handleChangeUserOnlineStatus = (e) => {
		const value = e.target.checked

		DB_UPDATE_NESTED_VALUE('users', user.userInfo.uid, 'online.byUser', value)
		.then(res => {
			if (res) {
				dispatch(setUserOnlineStatus(value))
			}
		})
	}

	return (

		<Container>
			<PageTitle>Settings</PageTitle>

			<Widgets>
				<Widget
					title='Online status'
					description='Change your online status between on/off'
				>
					<WidgetOption
						title='Status'
						description='Are you online or offline?'
					>
						<Switch onChange={handleChangeUserOnlineStatus} checked={user.online.byUser} />
					</WidgetOption>
				</Widget>
				<Widget
					title='User'
					description='User settings and informations'
				>
					<WidgetOption
						title='Logout'
						description='Logout from your account'
					>
						<Button
							onMouseUp={handleLogout}
							variant="outlined"
							color="error"
						>
							Logout
						</Button>
					</WidgetOption>
				</Widget>
				
			</Widgets>
		</Container>

	)
}

export default Settings