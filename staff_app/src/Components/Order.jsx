import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import Divider from '@mui/material/Divider'

import Container from './Container'
import PageTitle from './PageTitle'
import OrderItem from './OrderItem'
import ButtonBox from './ButtonBox'

const Sections = styled.div`
	align-items: center;
	display: flex;
	flex-direction: column;
	gap: 2rem;
	width: 100%;
`
const Section = styled.div`
	width: 80%;
	box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
	border-radius: 8px;
`
const SectionTitle = styled.h3`
	font-size: 1.5rem;
	font-weight: 500;
	padding: 10px;
`
const ItemBox = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2rem;
	padding: 20px 10px;
`
const InfoBox = styled.div`
	padding: 20px 10px;
	
	& span {
		display: block;
		margin-bottom: 10px;
	}
`

function Order() {
	const params = useParams(param => param)
	const menu = useSelector(state => state.menu)
	const orders = useSelector(state => state.orders)
	const user = useSelector(state => state.user)
	const [order, setOrder] = useState(null)
	const [orderItems, setOrderItems] = useState(null)
	const [orderData, setOrderData] = useState({ order: null, orderItems: [] })

	useEffect(() => {
		if (menu.length > 0 && orders.length > 0 && params.id) {
			const newOrderData = orders.reduce((acc, order) => {
				if (order.id === params.id) {
					const filteredMenu = order.cart.map(cartItem => {
						const menuItem = menu.find(menuItem => menuItem.id === cartItem.id)
						if (menuItem) {
							return { ...menuItem, quantity: cartItem.quantity }
						}
						return null;
					}).filter(item => item !== null); // Filter out any null items
					acc = { order: order, orderItems: filteredMenu }
				}
				return acc
			}, { order: null, orderItems: [] })

			setOrderData(newOrderData)
		}
	}, [menu, orders, params.id])

	return (

		<Container>
			<PageTitle>Order</PageTitle>

			<Sections>
				<Section>
					<SectionTitle>Items</SectionTitle>
					<Divider />
					<ItemBox>
						{
							orderData.orderItems && orderData.orderItems.map(orderItem => <OrderItem key={orderItem.id} orderItem={orderItem} />)
						}
					</ItemBox>
				</Section>

				<Section>
					<SectionTitle>Contact & Comment</SectionTitle>
					<Divider />
					<InfoBox>
						{ 
							orderData.order &&
								<>
									<span>Name: { orderData.order.user.name }</span>
									<span>Phone: { orderData.order.user.phone }</span>
									{ orderData.order.user.comment !== '' && <span>Comment: { orderData.order.user.comment }</span> }
								</>
						}
					</InfoBox>
				</Section>

				<Section>
					<SectionTitle>Location & Address</SectionTitle>
					<Divider />
					<InfoBox>
						{ 
							orderData.order &&
								<>
									{ orderData.order.location.address !== '' && <span>Address: { orderData.order.location.address }</span> }
									<a target='_blank' href={`https://www.google.com/maps?q=${orderData.order.location.latlng[0]},${orderData.order.location.latlng[1]}`}>Location: Maps</a>
								</>
						}
					</InfoBox>
				</Section>

				<ButtonBox order={orderData.order} id={orderData.order && orderData.order.id} status={user.userInfo.role === 'ORDER_CAPTAIN' ? 'DELIVERY' : 'COMPLETED'} />
			</Sections>
		</Container>

	)
}

export default Order