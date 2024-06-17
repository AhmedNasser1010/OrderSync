import { useState, useEffect } from 'react'
import { auth } from "./firebase.js"

import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

import Tip from './Components/Tip'

function NewUserComponent() {
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
	  </Tip>

	)
}

export default NewUserComponent