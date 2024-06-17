import { useSelector, useDispatch } from 'react-redux'
import { toggleCartWindow } from './rtk/slices/conditionalValuesSlice'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons'

import Logo from './Components/Logo'

const Nav = styled.nav`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 100px;
	box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
	margin-bottom: 20px;
`

const CartContainer = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
`

const CartIcon = styled.div`
	fill: #60b246;
	margin-right: 5px;
	font-size: larger;
`

const CartText = styled.p`
	font-weight: bold;
`

const CartIconContainer = styled.div`
	position: relative;
	transform: translateY(2px);
`

const Counter = styled.span`
	color: white;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-70%, -65%);
	font-size: 12px;
`

function Navbar() {
	const dispatch = useDispatch()
	const cartCounter = useSelector(state => state.cart.length);

	return (

		<Nav>
			<Logo />

			<CartContainer onMouseUp={() => dispatch(toggleCartWindow())}>

				<CartIconContainer>
					<CartIcon><svg viewBox="-1 0 37 32" height="20" width="20"><path d="M4.438 0l-2.598 5.11-1.84 26.124h34.909l-1.906-26.124-2.597-5.11z"></path></svg></CartIcon>
					<Counter>{ cartCounter }</Counter>
				</CartIconContainer>
				<CartText>Cart</CartText>

			</CartContainer>
		</Nav>

	)
}

export default Navbar