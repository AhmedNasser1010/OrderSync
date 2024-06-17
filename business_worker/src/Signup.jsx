import { Link } from 'react-router-dom'

import RegisterForm from './Components/RegisterForm'
import PageTitle from './Components/PageTitle'
import Container from './Components/Container'

function Signup() {
	return (

		<Container>
			<PageTitle style={{ textAlign: 'center' }}>Signup</PageTitle>
			<RegisterForm registerAction='signup' />
			<span>Already have account <Link to='/login'>Login</Link></span>
		</Container>

	)
}

export default Signup