import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { auth } from "../firebase.js"

import useLogout from '../hooks/useLogout.js'

import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import Button from '@mui/material/Button'

import Tip from './Tip'

const TipLayer = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`

function NoBusinessFound() {
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
		  	You don't have any business listed in your account yet.
		  	<br />
		  	Please contact a web developer to help you create one,
		  	<br />
		  	or reach out to me for assistance via <a target='_blank' href="https://wa.me/+201117073085" style={{ color: 'blue', cursor: 'pointer' }}>WhatsApp.</a>
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

export default NoBusinessFound