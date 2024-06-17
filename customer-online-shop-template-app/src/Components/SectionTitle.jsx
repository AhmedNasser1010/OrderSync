import styled from 'styled-components'

const Container = styled.h3`
	font-weight: 900;
	font-size: 24px;
	letter-spacing: 2px;
	margin-bottom: 10px;
`

function SectionTitle({ children, style }) {
	return (

		<Container style={style}>{ children }</Container>

	)
}

export default SectionTitle