import { auth } from './firebase.js';
import Box from '@mui/material/Box';

const User = () => {
	return (

		<Box>
			{ auth.currentUser.email }
		</Box>

	)
}

export default User;