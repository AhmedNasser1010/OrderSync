import { Link } from 'react-router-dom'

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// Components
import RegistrationForm from './Component/RegistrationForm.jsx';

const Login = () => {
	return (

		<Paper elevation={0} sx={{
			textAlign: 'center',
			padding: '20px',
    	width: 'calc(100% - 40px)',
    	height: 'calc(100vh - 40px)'
		}}>
			<Stack sx={{ width: '100%' }}>
				<Typography variant='h1' gutterBottom>Login</Typography>

				<RegistrationForm action='login' />
				<p style={{	marginTop: '15px' }}>You have no account <Link to='/signup' style={{ color: 'blue' }}>Signup a new one</Link></p>

			</Stack>
		</Paper>

	)
}

export default Login;