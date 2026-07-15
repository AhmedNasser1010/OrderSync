import { Link } from 'react-router-dom'

import RegisterForm from './Components/RegisterForm'
import PageTitle from './Components/PageTitle'
import Container from './Components/Container'

function Login() {
	return (

		<Container>
			<PageTitle style={{ textAlign: 'center' }}>Login</PageTitle>
			<RegisterForm registerAction='login' />
			<span>Have no account <Link to='/signup'>Create New One</Link></span>
		</Container>

	)
}

export default Login