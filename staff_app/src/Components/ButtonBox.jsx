import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { initOrders, changeOrderState } from '../rtk/slices/ordersSlice'

import DB_UPDATE_NESTED_VALUE from '../utils/DB_UPDATE_NESTED_VALUE'

import Button from '@mui/material/Button'

const Buttons = styled.div`
	width: 80%;
	display: flex;
	gap: 1rem;

	& .btn {
		width: 100%;
	}
`

function ButtonBox({ id, status }) {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const user = useSelector(state => state.user)
	const orders = useSelector(state => state.orders)

	const changeOrderStatus = (id, status, ordersSnapshot) => {
		return [
			...ordersSnapshot.map(order => {
				if (id === order.id) {
					return {
						...order,
						status: status,
						assign: {
							...order.assign,
							status: user.userInfo.role === 'DELIVERY_CAPTAIN' ? 'completed' : 'on-going'
						}
					}
				}
				return order
			})
		]
	}

	const handleToNext = () => {
		DB_UPDATE_NESTED_VALUE(
			'orders',
			user.accessToken,
			'open',
			changeOrderStatus(id, status, orders)
		)

		navigate('/queue')
	}

	return (

		<Buttons>
			<Button
				className='btn'
				variant="outlined"
				onMouseUp={() => navigate('/queue')}
			>
				Back
			</Button>
			<Button
				className='btn'
				variant="contained"
				onMouseUp={() => handleToNext()}
			>
				Next
			</Button>
		</Buttons>

	)
}

export default ButtonBox