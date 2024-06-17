import styled from 'styled-components'
import Box from '@mui/material/Box'

const WrapperContainer = styled(Box)`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30px 0 110px;
	width: 100%;
`

function Container({ children }) {
	return (
		<WrapperContainer>
			{ children }
		</WrapperContainer>
	)
}

export default Container