import { useState, useEffect } from 'react'
import { auth } from "./firebase.js"
import styled from 'styled-components'

import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import Button from '@mui/material/Button'

import useLogout from './hooks/useLogout.js'

import Tip from './Components/Tip'

const TipLayer = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`

function NewUserComponent() {
	const logout = useLogout()
	const [userData, setUserData] = useState({
		email: '',
		userID: ''
	})

	useEffect(() => {
		auth && setUserData({
			email: auth.currentUser.email,
			userID: auth.currentUser.uid
		})
	}, [auth])

	return (
		<TipLayer>
		  <Tip
		  	status='error'
		  	icon={<ReportProblemRoundedIcon />}
		  >
		  	Your are not regestered as a worker on any business.
		  	<div style={{ marginTop: '10px', fontWeight: '400' }}>
		  		<span style={{ display: 'block' }}>Here is some information about your account:</span>
		  		<span style={{ display: 'block' }}>- Email: { userData.email }</span>
		  		<span style={{ display: 'block' }}>- User ID: { userData.userID }</span>
		  	</div>
		  	<Button onMouseUp={logout} fullWidth variant="outlined" color="error" style={{ marginTop: '10px' }}>Logout</Button>
		  </Tip>
		</TipLayer>

	)
}

export default NewUserComponent