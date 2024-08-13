import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import styled from 'styled-components'
import DB_UPDATE_NESTED_VALUE from '../functions/DB_UPDATE_NESTED_VALUE';
import DB_DELETE_NESTED_VALUE from '../functions/DB_DELETE_NESTED_VALUE';
import _updateAnArray from '../functions/_updateAnArray';
import { changeOrderState, deleteOrder, setOpenedOrders, storeOrder } from '../rtk/slices/ordersSlice';
import toTitle from '../functions/toTitle';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import AddchartIcon from '@mui/icons-material/Addchart';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import Button from '@mui/material/Button';

import priceAfterDiscount from '../functions/priceAfterDiscount'
import Invoice from './Invoice'

const InvoiceLayer = styled.div`
	display: none;
`

const TableToolbar = ({ selected, handleSetSelected, tableStatus }) => {
	const dispatch = useDispatch();
	const numSelected = selected.length;
	const savingOrdersTimer = useSelector(state => state.conditionalValues.savingOrdersTimer)
	const accessToken = useSelector(state => state.user.accessToken);
	const openOrders = useSelector(state => state.orders.open);
	const closedOrders = useSelector(state => state.orders.closed);
	const apiWaitingRef = useRef(false)
	const componentRef = useRef(null)
	const business = useSelector(state => state.business)
	const menu = useSelector(state => state.menu.items)

	const selectedOrders = useMemo(() => {
		let ordersMap = []
		selected?.map(id => openOrders.map(order => order.id === id && ordersMap.push(order)))

	  return ordersMap?.map(order => {
	    const selectedMenuItems = order.cart.map(cartItem => {
	      const menuItem = menu.find(menuItem => menuItem.id === cartItem.id)
	      return menuItem ? { ...menuItem, quantity: cartItem.quantity } : null
	    }).filter(item => item !== null)

	    const totalPrice = selectedMenuItems.reduce((totals, item) => {
			  const itemTotal = parseFloat(item.price) * item.quantity
			  return {
			    total: totals.total + itemTotal,
			    totalDiscounted: item?.discount?.code ? totals.totalDiscounted + priceAfterDiscount(parseFloat(item.price), item.discount.code) * item.quantity : totals.totalDiscounted + itemTotal
			  }
			}, { total: order.deliveryFees, totalDiscounted: order.deliveryFees })

	    return {
	      selectedMenuItems,
	      orderData: order,
	      price: totalPrice
	    }
	  })
	}, [menu, selected])

	const nextTableStatusMap = {
		RECEIVED: 'IN_PROGRESS',
		IN_PROGRESS: 'IN_DELIVERY',
		IN_DELIVERY: 'COMPLETED'
	}
	const prevTableStatusMap = {
		COMPLETED: 'IN_DELIVERY',
		IN_DELIVERY: 'IN_PROGRESS',
		IN_PROGRESS: 'RECEIVED'
	}

	const nextTableStatus = nextTableStatusMap[tableStatus] || 'RECEIVED'
	const prevTableStatus = prevTableStatusMap[tableStatus] || 'RECEIVED'

	const handleUpdateData = (callback) => {
		if (!apiWaitingRef.current) {
			handleSetSelected([]);
			apiWaitingRef.current = true;

			callback();
		}
	}

	const handleDelete = () => {
		apiWaitingRef.current = true

		const filteredOpenOrders = openOrders.filter(order => !selected.includes(order.id))
		saveOpenOrderToTheCloud(filteredOpenOrders, () => dispatch(setOpenedOrders(filteredOpenOrders)))
	}

	const saveOpenOrderToTheCloud = (data, successCallback, failedCallback) => {
		DB_UPDATE_NESTED_VALUE('orders', accessToken, 'open', data).then(res => {
			handleSetSelected([])
			if (res) {
				successCallback && successCallback()
				apiWaitingRef.current = false
			}
			failedCallback && failedCallback()
			apiWaitingRef.current = false
		})
	}

	const handleOrderStage = (stage = 'FORWARD') => {
		apiWaitingRef.current = true
		
		const updatedOpenOrders = openOrders.map(order => {
			if (selected.includes(order.id)) {
				return {
					...order,
					status: stage === 'FORWARD' ? nextTableStatus : prevTableStatus,
					statusUpdatedSince: Number(Date.now())
				}
			}
			return order
		})

		saveOpenOrderToTheCloud(updatedOpenOrders, () => dispatch(setOpenedOrders(updatedOpenOrders)))
		
	}

	const handleStore = () => {
		apiWaitingRef.current = true

		const completedOrders = openOrders.filter(order => order.status === 'COMPLETED')

		if (!completedOrders.length) {
			console.log('No completed orders to close')
			apiWaitingRef.current = false
			return
		}

		_updateAnArray('orders', accessToken, 'closed', {
			timestamp: Number(Date.now()),
			orders: completedOrders
		})
		.then(passed => {
			if (passed) {
				const filteredFromCompleted = openOrders.filter(order => !completedOrders.includes(order))
				saveOpenOrderToTheCloud(filteredFromCompleted, () => dispatch(setOpenedOrders(filteredFromCompleted)))
			}
			apiWaitingRef.current = false
		})

	}

	const handlePrint = useReactToPrint({
		content: () => componentRef.current,
	})

	return (
		<Toolbar>
			<InvoiceLayer>
				<div ref={componentRef}>
					{
						selectedOrders.length > 0 &&
							<Invoice
								business={business}
								orders={selectedOrders}
							/>
					}
				</div>
			</InvoiceLayer>


			{numSelected > 0 ? (
				<Typography
					sx={{ flex: '1 1 100%' }}
					color="inherit"
					variant="subtitle1"
					component="div"
				>
					{numSelected} Selected
				</Typography>
			) : (
				<Typography
					sx={{ flex: '1 1 100%' }}
					variant="h6"
					id="tableTitle"
					component="div"
				>
					{toTitle(tableStatus, '_')} Orders
				</Typography>
			)}

			{numSelected > 0 ? (
				<>
					<Tooltip title="Print Invoice" sx={{ display: 'block', transform: 'translateY(4px)' }}>
						<IconButton>
							<ReceiptLongRoundedIcon onMouseUp={handlePrint} />
						</IconButton>
					</Tooltip>
					<Tooltip title="To Back" sx={{ display: tableStatus === 'RECEIVED' || (tableStatus === 'IN_DELIVERY' && !business.settings.orderManagement.assign.forDeliveryWorkers) && 'none' }}>
						<IconButton>
							<ArrowLeftIcon onMouseUp={() => handleOrderStage('BACKWARD')} />
						</IconButton>
					</Tooltip>
					<Tooltip title="To Next" sx={{ display: tableStatus === 'COMPLETED' || (tableStatus === 'IN_DELIVERY' && !business.settings.orderManagement.assign.forDeliveryWorkers) && 'none' }}>
						<IconButton>
							<NextPlanIcon onMouseUp={() => handleOrderStage('FORWARD')} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete" sx={{ display: tableStatus === 'COMPLETED' || (tableStatus === 'IN_DELIVERY' && !business.settings.orderManagement.assign.forDeliveryWorkers) && 'none' }}>
						<IconButton>
							<DeleteIcon onMouseUp={handleDelete} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Store" sx={{ display: tableStatus === 'COMPLETED' ? 'unset' : 'none' }}>
						<IconButton>
							<AddchartIcon onMouseUp={handleStore} />
						</IconButton>
					</Tooltip>
				</>
			) : (
				<Tooltip title="Filter list">
					<IconButton sx={{ borderRadius: '4px', padding: '0', display: 'none' }}>
						<Button disabled={true} size='small'>{savingOrdersTimer}{savingOrdersTimer >= -1 && 'm'}</Button>
					</IconButton>
				</Tooltip>
			)}
		</Toolbar>
	);
}

export default TableToolbar;