import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Divider from '@mui/material/Divider'

import priceAfterDiscount from '../utils/priceAfterDiscount'

const Order = styled.div`
	cursor: pointer;
	box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
	border-radius: 8px;
	opacity: ${({ $status }) => $status === 'IN_DELIVERY' ? '1' : '0.5'};
`
const Title = styled.h3`
	font-size: 1.5rem;
	font-weight: 500;
	padding: 10px;
`
const Content = styled.div`
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;

	& span {
	}
`

function OrderCard({ order }) {
	const navigate = useNavigate()
	const menus = useSelector(state => state.menus)
	const [filteredMenu, setFilteredMenu] = useState([])
	const [orderTotal, setOrderTotal] = useState(0)
	const [cartItems, setCartItems] = useState([])

	useEffect(() => {
		if (menus.length > 0) {
			let filteredMenu = []
			order.cart.map(cart => menus.map(meunItem => meunItem.id === cart.id && filteredMenu.push({...meunItem, quantity: cart.quantity})))
			setFilteredMenu(filteredMenu)
		}
	}, [menus])

	useEffect(() => {
		let total = 0
		filteredMenu?.map(item => {
			setCartItems(cartItems => [...cartItems, item.title])
			item.discount ? total += priceAfterDiscount(item.price, item.discount.code) * item.quantity : total += item.price * item.quantity
		})
		setOrderTotal(total)
	}, [filteredMenu])

	return (

		<Order onMouseUp={() => navigate(`/queue/${order.id}`)} $status={order.status}>
			<Title>Order</Title>
			<Divider />
			<Content>
				<span>ID: { order.id }</span>
				<span>Name: { order.user.name }</span>
				<span>Phone: { order.user.phone }</span>
				<a target='_blank' href={`https://www.google.com/maps?q=${order.location.latlng[0]},${order.location.latlng[1]}`}>Location: Maps</a>
				{ order.location.address !== '' && <span>Address: { order.location.address }</span> }
				<span>Total: { orderTotal }LE</span>
				<span>Items: { cartItems.join(',') }</span>
			</Content>
		</Order>

	)
}

export default OrderCard