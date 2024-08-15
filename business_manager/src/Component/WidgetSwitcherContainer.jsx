import styled from 'styled-components'

import Switcher from './Switcher'

const Container = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`
const Content = styled.div``
const Title = styled.h4`
	margin-bottom: 5px;
`
const Description = styled.p`
	font-size: 14px;
	color: #00000099;
`

function WidgetSwitcherContainer({ checked, handleOnClick, title, description }) {
	return (

		<Container className='switcher'>
			<Content>
				<Title>{ title }</Title>
				<Description>{ description }</Description>
			</Content>
			<Switcher checked={checked} onMouseUp={(e) => handleOnClick(e)} />
		</Container>

	)
}

export default WidgetSwitcherContainer