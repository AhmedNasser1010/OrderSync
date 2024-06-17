import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Container = styled.div`
	display: flex;
	align-items: center;
`

const LogoImage = styled.span`
	background-image: url(./src/assets/favico.avif);
	width: 50px;
	height: 50px;
	background-size: cover;
	border-radius: 50%;
	border: 1px solid black;
	margin-right: 10px;
`

const LogoTitle = styled.h1`
	font-weight: bold;
`

function Logo() {
	return (

		<Container>
			<LogoImage />
			<LogoTitle>Food</LogoTitle>
		</Container>

	)
}

export default Logo