import styled from 'styled-components'

const Title = styled.h2`
	font-size: 35px;
	font-weight: 900;
	letter-spacing: 2px;
	margin-bottom: 50px;
	text-align: center;
`

function CheckoutPageTitle({ title }) {
	return (

		<Title>{ title }</Title>

	)
}

export default CheckoutPageTitle