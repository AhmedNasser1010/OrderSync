import { Link } from 'react-router-dom'

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// Components
import RegistrationForm from './Component/RegistrationForm.jsx';

const Signup = () => {
	return (

		<Paper
			elevation={0}
			sx={{
				textAlign: 'center',
				padding: '20px',
    		width: 'calc(100% - 40px)',
    		height: 'calc(100vh - 40px)'
			}}
		>
			<Stack sx={{ width: '100%' }}>
				<Typography variant='h1' gutterBottom>Signup</Typography>

				<RegistrationForm action='signup' />
				<p style={{	marginTop: '15px' }}>Already have account <Link to='/login' style={{ color: 'blue' }}>Login</Link></p>

			</Stack>
		</Paper>

	)
}

export default Signup;