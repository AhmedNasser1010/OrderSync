import { useMemo, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import Box from '@mui/material/Box'

import { initQueue } from './rtk/slices/queueSlice'

import Container from './Components/Container'
import OrderCard from './Components/OrderCard'
import Dues from './Components/Dues'
import Divider from '@mui/material/Divider'

const Orders = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 0 15px;
	width: calc(100% - 30px);
`

function Queue() {
	const dispatch = useDispatch()
	const orders = useSelector(state => state.orders)
	const queue = useSelector(state => state.queue)
	const user = useSelector(state => state.user)

	return (

		<Container>
			<Orders>
				<Dues />
				<Divider />
				{
					queue?.map(order => <OrderCard key={order.id} order={order} />)
				}
			</Orders>
		</Container>

	)
}

export default Queue