import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Divider from '@mui/material/Divider'

import priceAfterDiscount from '../utils/priceAfterDiscount'

const Order = styled.div`
	padding: 20px;
	cursor: pointer;
	box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
	border-radius: 8px;
	opacity: ${({ $status }) => $status === 'ON_ROUTE' ? '1' : '0.5'};
`
const Title = styled.h3`
	font-size: large;
  color: #0000007a;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: 15px;
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

		<Order onMouseUp={() => navigate(`/queue/${order.id}`)} $status={order.status.current}>
			<Title>ORDER / {order.id.split('-')[0]}</Title>
			<Content>
				<span>Name: { order.customer.name }</span>
				<span>Phone: { order.customer.phone }</span>
				<a target='_blank' href={`https://www.google.com/maps?q=${order.location.latlng[0]},${order.location.latlng[1]}`}>Location: Maps</a>
				{ order.location.address !== '' && <span>Address: { order.location.address }</span> }
				<span>Total: { order?.cartTotalPrice?.discount || '???' }LE</span>
				<span>Items: { cartItems.join(',').substring(0, 60) + (cartItems.join(',').length > 60 ? '...' : '') }</span>
			</Content>
		</Order>

	)
}

export default OrderCard