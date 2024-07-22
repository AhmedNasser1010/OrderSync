import { useMemo, useEffect, useState } from 'react'
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

	return (

		<Container>
			<PageTitle>Queue {queue?.length}</PageTitle>

			<Orders>
				{
					queue?.map(order => <OrderCard key={order.id} order={order} />)
				}
			</Orders>
		</Container>

	)
}

export default Queue