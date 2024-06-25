import styled from 'styled-components'

const DividerContainer = styled.div`
	border: 1px solid rgb(240,240,245);
	margin: 32px 0;
	color: #02060c99;
`

function Divider({ style }) {
	return (<DividerContainer style={style}></DividerContainer>)
}

export default Divider