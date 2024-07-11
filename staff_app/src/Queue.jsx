import { useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import Box from '@mui/material/Box'

import { initQueue } from './rtk/slices/queueSlice'

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
	const dispatch = useDispatch()
	const orders = useSelector(state => state.orders)
	const queue = useSelector(state => state.queue)
	const user = useSelector(state => state.user)

	// const queueOrders = useMemo(() => {
	// 	return orders.filter(order => {
	// 		if (user.userInfo.role === 'ORDER_CAPTAIN') {
	// 			return order.status === 'IN_PROGRESS' && order.assign.to === user.userInfo.uid && order.assign.status === 'on-going'
	// 		} else if (user.userInfo.role === 'DELIVERY_CAPTAIN') {
	// 			return order.status === 'IN_DELIVERY' && order.assign.to === user.userInfo.uid && order.assign.status === 'on-delivery'
	// 		}
	// 	})
	// }, [orders])

	useEffect(() => {
		const finalOrders = queue.map(qu => {
			const order = orders.find(order => order.id === qu.id && order.status === 'IN_DELIVERY')
			if (order) {
				return order
			}
		}).filter(order => order)

		dispatch(initQueue(finalOrders))
	}, [orders])

	return (

		<Container>
			<PageTitle>Queue</PageTitle>

			<Orders>
				{/*{ queueOrders.map(order => (<OrderCard key={order.id} order={order} />)) }*/}
				{
					queue?.map(order => <OrderCard key={order.id} order={order} />)
				}
			</Orders>
		</Container>

	)
}

export default Queue