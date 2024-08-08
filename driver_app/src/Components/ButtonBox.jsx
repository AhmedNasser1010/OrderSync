import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { initOrders, changeOrderState } from '../rtk/slices/ordersSlice'

import DB_GET_DOC from '../utils/DB_GET_DOC'
import DB_UPDATE_NESTED_VALUE from '../utils/DB_UPDATE_NESTED_VALUE'
import DB_DELETE_NESTED_VALUE from '../utils/DB_DELETE_NESTED_VALUE'

import Button from '@mui/material/Button'

const Buttons = styled.div`
	width: 80%;
	display: flex;
	gap: 1rem;

	& .btn {
		width: 100%;
	}
`

function ButtonBox({ order, id }) {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const user = useSelector(state => state.user)

	const updateOrder = () => {
		return {
			...order,
			status: 'COMPLETED',
			statusUpdatedSince: Number(Date.now()),
			assign: {
				...order.assign,
				status: 'completed'
			}
		}
	}

	const updateAllOrders = (orders) => {
		const updatedOrder = updateOrder()
		return [
			...orders.map(order => {
				if (id === order.id) {
					return updatedOrder
				}
				return order
			})
		]
	}

	const updateQueue = () => {
		return user.queue.filter(qu => qu.id !== id)
	}

	const handleToNext = async () => {
		const confirmation = window.confirm("Are you sure you want to close this order?")

		if (confirmation) {
			const orders = await DB_GET_DOC('orders', order.accessToken)
			const openOrders = orders.open

			const updatedOrders = updateAllOrders(openOrders)
			const updatedQueue = updateQueue()

			DB_UPDATE_NESTED_VALUE(
				'orders',
				order.accessToken,
				'open',
				updatedOrders
			)
			.then(res => {
				if (res) {
					DB_DELETE_NESTED_VALUE('customers', order.user.uid, 'trackedOrder')
					DB_UPDATE_NESTED_VALUE('drivers', user.uid, 'queue', updatedQueue)
					DB_UPDATE_NESTED_VALUE('drivers', user.uid, 'ordersDues', user.ordersDues + (order?.cartTotalPrice?.discount || 1000))

				}
			})

			navigate('/queue')
		}
	}

	return (

		<Buttons>
			<Button
				className='btn'
				variant="outlined"
				onMouseUp={() => navigate('/queue')}
			>
				Back To Queue
			</Button>
			<Button
				className='btn'
				variant="contained"
				onMouseUp={() => handleToNext()}
			>
				Close The Order
			</Button>
		</Buttons>

	)
}

export default ButtonBox