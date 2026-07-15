import styled from 'styled-components'

import WidgetTitle from './WidgetTitle'

const StyledWrapper = styled.div`
	background-color: white;
	border-radius: 8px;
	padding: 20px;
	width: calc(100% - 40px);
	box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
`

function Widget({ children, title, description }) {
	return (

		<StyledWrapper>
			<WidgetTitle
				title={title}
				description={description}
			/>
			{ children }
		</StyledWrapper>

	)
}

export default Widget