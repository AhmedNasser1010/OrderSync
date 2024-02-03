import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// Components
import LoginForm from './Component/LoginForm.jsx';

const Login = () => {
	return (

		<Paper
			elevation={0}
			sx={{ 
				padding: '1em',
				position: 'fixed',
				top: '30%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				minWidth: '500px'
			}}
		>
			<Stack sx={{ width: '100%' }}>
				<Typography variant='h1' gutterBottom>Login</Typography>

				<LoginForm />

			</Stack>
		</Paper>

	)
}

export default Login;