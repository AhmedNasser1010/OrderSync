import styled from 'styled-components'

const Container = styled.div`
	display: flex;
	align-items: center;
	background-color: ${({ $status }) => $status === 'tip' && '#d1d1ff'};
	background-color: ${({ $status }) => $status === 'error' && '#ff572278'};
	padding: 15px;
	border-radius: 10px;
	margin: 10px 0;
`
const TipIcon = styled.span`
	margin-right: 10px;
`
const TipMsg = styled.p`
	font-weight: bold;
`

function Tip({ children, icon, status='tip' }) {
	return (

		<Container $status={status}>
			<TipIcon>{ icon }</TipIcon>
			<TipMsg>{ children }</TipMsg>
		</Container>

	)
}

export default Tip