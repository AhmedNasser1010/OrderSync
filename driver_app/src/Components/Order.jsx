import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import Divider from '@mui/material/Divider'
import priceAfterDiscount from '../utils/priceAfterDiscount'

import Container from './Container'
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
	const param = useParams(param => param)
	const menus = useSelector(state => state.menus)
	const user = useSelector(state => state.user)
	const queue = useSelector(state => state.queue)
	const [order, setOrder] = useState(null)
	const [orderItems, setOrderItems] = useState(null)
	const [orderData, setOrderData] = useState({ order: null, orderItems: [] })
	const [orderTotal, setOrderTotal] = useState(0)

	useEffect(() => {
		if (menus.length > 0 && queue.length > 0 && param.id) {
			const newOrderData = queue.reduce((acc, order) => {
				if (order.id === param.id) {
					const filteredMenu = order.cart.map(cartItem => {
						const menuItem = menus.find(menuItem => menuItem.id === cartItem.id)
						if (menuItem) {
							return { ...menuItem, quantity: cartItem.quantity }
						}
						return null;
					}).filter(item => item !== null)
					acc = { order: order, orderItems: filteredMenu }
				}
				return acc
			}, { order: null, orderItems: [] })

			setOrderData(newOrderData)
		}
	}, [menus, param.id])

	useEffect(() => {
		let total = 0
		orderData.orderItems?.map(item => {
			item.discount ? total += priceAfterDiscount(item.price, item.discount.code) * item.quantity : total += item.price * item.quantity
		})
		setOrderTotal(total)
	}, [orderData.orderItems])

	return (

		<Container>
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
					<SectionTitle>Contact</SectionTitle>
					<Divider />
					<InfoBox>
						{ 
							orderData.order &&
								<>
									<span>Name: { orderData.order.user.name }</span>
									<span>Phone: { orderData.order.user.phone }</span>
									{ orderData.order.user.secondPhone && <span>Second Phone: { orderData.order.user.secondPhone }</span> }
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

				<ButtonBox order={orderData.order} id={orderData.order && orderData.order.id} orderTotal={orderTotal} />
			</Sections>
		</Container>

	)
}

export default Order