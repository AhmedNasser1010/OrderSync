import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleCartWindow } from './rtk/slices/conditionalValuesSlice'
import { addCheckout } from './rtk/slices/checkoutSlice'
import styled from 'styled-components'
import priceAfterDiscount from './utils/priceAfterDiscount'
import { useNavigate } from "react-router-dom";

import WindowLayout from './Components/WindowLayout'
import CartCard from './Components/CartCard'
import Divider from './Components/Divider'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const Container = styled.section`
	position: fixed;
	top: 0;
	left: 0;
	width: 40%;
	height: 100%;
	background-color: white;
	z-index: 10;
	box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`
const CardsContainer = styled.div`
	padding: 10px 20px;
	overflow-y: scroll;
	height: 100%;
`
const TopBar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px;
`
const ExitIcon = styled.span`
	font-size: 20px;
	cursor: pointer;
`
const Title = styled.h3`
	letter-spacing: 2px;
	font-size: 25px;
	font-weight: 800;
`
const OrderBtn = styled.span`
	margin: 20px;
	padding: 10px;
	display: block;
	background-color: #60b246;
	border-radius: 8px;
	text-align: center;
	color: white;
	font-weight: bold;
	cursor: pointer;
`
const Subtotal = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20px;
	letter-spacing: 1px;
	font-size: 20px;
	font-weight: 600;

	& div {
		display: flex;
    gap: 1rem;
	}

	& div span.subtotal {
		color: #00a53e;
	}

	& div span.subtotal-all {
		position: relative;
		color: #F44336;
		opacity: 0.7;
	}

	& div span.subtotal-all::before {
		content: '';
		width: 3px;
    height: 110%;
    position: absolute;
    top: 0;
    left: 50%;
    background-color: #F44336;
    border-radius: 10px;
    transform: rotate(25deg) translateX(-50%);
    opacity: 0.5;
	}
`
function Cart() {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const cartWindow = useSelector(state => state.conditionalValues.cartWindow)
	const cart = useSelector(state => state.cart)
	const menuItems = useSelector(state => state.menu.items)
	const [cartItems, setCartItems] = useState([])
	const [subtotal, setSubtotal] = useState(0)
	const [subtotalAll, setSubtotalAll] = useState(0)

	const handleOnCheckout = () => {
		dispatch(toggleCartWindow())
		dispatch(addCheckout({ cart }))
		navigate('/checkout')
	}

	useEffect(() => {
		const result = menuItems
	  ?.filter(item => cart.some(cartItem => item.id === cartItem.id))
	  .map(item => {
	    const { id, title, price, rating, category, discount, backgrounds } = item
	    const cartItem = cart.find(cartItem => cartItem.id === item.id)
	    return { id, title, price, quantity: cartItem.quantity, rating, category, discount, backgrounds }
	  })

	  setCartItems(result)
	}, [cart])

	useEffect(() => {
		let total = 0
		let totalAll = 0

		cartItems?.map(item => {
			totalAll += item.price * item.quantity
			item.discount ? total += priceAfterDiscount(item.price, item.discount.code) * item.quantity : total += item.price * item.quantity
		})

		setSubtotal(total)
		setSubtotalAll(totalAll)
	}, [cartItems])

	return (

		<WindowLayout
			onClickHandler={() => dispatch(toggleCartWindow())}
			visibileCondition={cartWindow}
		>
			<Container>
				<div style={{ maxHeight: '60%' }}>
					<TopBar>
						<Title>Cart</Title>
						<ExitIcon onMouseUp={() => dispatch(toggleCartWindow())}><FontAwesomeIcon icon={faXmark} /></ExitIcon>
					</TopBar>
					<Divider style={{ margin: '0', marginBottom: '20px' }} />
					<CardsContainer>
						{ cartItems?.map(item => <CartCard key={item.id} itemData={item} />) }
					</CardsContainer>
				</div>
				<div>
					<Divider style={{ margin: '20px 0' }} />
					<Subtotal>
						<span>Subtotal</span>
						{ subtotal === subtotalAll && <span>{ subtotal }£</span> }
						{ subtotal !== subtotalAll &&
							<div>
								<span className='subtotal-all'>{ subtotalAll }£</span>
								<span className='subtotal'>{ subtotal }£</span>
							</div>
						}
					</Subtotal>
					<OrderBtn onMouseUp={handleOnCheckout}>CHECKOUT</OrderBtn>
				</div>
			</Container>
		</WindowLayout>

	)
}

export default Cart