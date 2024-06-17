import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import Box from '@mui/material/Box'

import PageTitle from './Components/PageTitle'
import Container from './Components/Container'
import OrderCard from './Components/OrderCard'

const Orders = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 80%;
`

function Queue() {
	const orders = useSelector(state => state.orders)
	const user = useSelector(state => state.user)
	const [filteredOrder, setFilteredOrder] = useState([])

	useEffect(() => {
		setFilteredOrder(orders.filter(order => {
			if (user.userInfo.role === 'ORDER_CAPTAIN') {
				return order.status === 'ON_GOING'
			} else if (user.userInfo.role === 'DELIVERY_CAPTAIN') {
				return order.status === 'IN_DELIVERY'
			}
			return false
		}))
	}, [orders])

	return (

		<Container>
			<PageTitle>Queue</PageTitle>

			<Orders>
				{ filteredOrder.map(order => (<OrderCard key={order.id} order={order} />)) }
			</Orders>
		</Container>

	)
}

export default Queue