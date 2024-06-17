import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import WindowLayout from './WindowLayout'
import Divider from './Divider'
import MenuCardOnWindow from './MenuCardOnWindow'

const Window = styled.div`
	min-width: 80%;
	background-color: white;
	padding: 20px;
	border-radius: 7px;
	transition: 1s;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: ${({ $visibileCondition }) => $visibileCondition ? 'translate(-50%, -50%)' : 'translate(-50%, calc(-50% + 30px))'};
	opacity: ${({ $visibileCondition }) => $visibileCondition ? '1' : '0'};
`

const TopBar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`
const WindowTitle = styled.h4`
	font-size: 24px;
`

const ExitIcon = styled.span`
	position: absolute;
	top: 20px;
	right: 20px;
	cursor: pointer;
	font-size: 24px;
	margin-right: 10px;
`

function PlaceOrderWindow({ id, toggleWindow, visibileCondition }) {
	const item = useSelector(state => state.menu.items?.filter(item => item.id === id)[0])

	return (

		visibileCondition &&
			<WindowLayout
				onClickHandler={toggleWindow}
				visibileCondition={visibileCondition}
			>
				<Window $visibileCondition={visibileCondition}>

					<TopBar>
						<WindowTitle>Place Order</WindowTitle>
						<ExitIcon onMouseUp={toggleWindow}><FontAwesomeIcon icon={faXmark} /></ExitIcon>
					</TopBar>
					<Divider style={{ margin: '10px 0' }} />
					<MenuCardOnWindow item={item} toggleWindow={toggleWindow} />
				</Window>
			</WindowLayout>
			
	)
}

export default PlaceOrderWindow