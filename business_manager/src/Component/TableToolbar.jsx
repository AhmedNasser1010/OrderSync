import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import styled from 'styled-components'
import DB_UPDATE_NESTED_VALUE from '../functions/DB_UPDATE_NESTED_VALUE';
import _updateAnArray from '../functions/_updateAnArray';
import { changeOrderState, deleteOrder, setOpenedOrders, storeOrder } from '../rtk/slices/ordersSlice';
import toTitle from '../functions/toTitle';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import AddchartIcon from '@mui/icons-material/Addchart';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import Button from '@mui/material/Button';

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
	const apiWaitingRef = useRef(false);
	const openOrdersCounter = useRef(0);
	const closedOrdersCounter = useRef(0);
	const [finalDayClosedOrderRecord, setFinalDayClosedOrderRecord] = useState({});
	const componentRef = useRef(null)
	const business = useSelector(state => state.business)
	const menu = useSelector(state => state.menu.items)

	const orders = useMemo(() => {
		let ordersMap = []
		selected?.map(id => openOrders.map(order => order.id === id && ordersMap.push(order)))

	  return ordersMap?.map(order => {
	    const selectedMenuItems = order.cart.map(cartItem => {
	      const menuItem = menu.find(menuItem => menuItem.id === cartItem.id)
	      return menuItem ? { ...menuItem, quantity: cartItem.quantity } : null
	    }).filter(item => item !== null)

	    const totalPrice = selectedMenuItems.reduce((total, item) => {
	      return {
	      	total: total + (parseFloat(item.price) * item.quantity),
	      	totalDiscounted: item?.discount?.code ? 0 : total + (parseFloat(item.price) * item.quantity)
	      }
	    }, 0)

	    return {
	      selectedMenuItems,
	      orderData: order,
	      price: totalPrice
	    }
	  })
	}, [menu, selected])

	const nextTableStatusMap = {
		RECEIVED: 'ON_GOING',
		ON_GOING: 'IN_DELIVERY',
		IN_DELIVERY: 'COMPLETED'
	};
	const prevTableStatusMap = {
		COMPLETED: 'IN_DELIVERY',
		IN_DELIVERY: 'ON_GOING',
		ON_GOING: 'RECEIVED'
	};
	const nextTableStatus = nextTableStatusMap[tableStatus] || 'RECEIVED';
	const prevTableStatus = prevTableStatusMap[tableStatus] || 'RECEIVED';

	const handleUpdateDataToTheCloude = () => {
		const openOrdersBackup = openOrders;
		DB_UPDATE_NESTED_VALUE('orders', accessToken, 'open', openOrders).then(res => {
			if (res) {
				apiWaitingRef.current = false;
			} else {
				apiWaitingRef.current = false;
				dispatch(setOpenedOrders(openOrdersBackup));
			}
		})
	}

	const handleUpdateData = (callback) => {
		if (!apiWaitingRef.current) {
			handleSetSelected([]);
			apiWaitingRef.current = true;

			callback();
		}
	}

	const handleDelete = () => {
		handleUpdateData(() => dispatch(deleteOrder(selected)))
	}

	const handleToNext = () => {
		handleUpdateData(() => dispatch(changeOrderState({ IDs: selected, status: nextTableStatus })))
	}

	const handleToBack = () => {
		handleUpdateData(() => dispatch(changeOrderState({ IDs: selected, status: prevTableStatus })))
	}

	const handleStore = () => {
		handleUpdateData(() => {
			dispatch(storeOrder(selected));
			dispatch(deleteOrder(selected));
		})
	}

	const handlePrint = useReactToPrint({
		content: () => componentRef.current,
	})

	useEffect(() => {
		openOrdersCounter.current++
		closedOrdersCounter.current++
	}, [])

	useEffect(() => {
		openOrdersCounter.current === 3 && handleUpdateDataToTheCloude();
		if (openOrdersCounter.current === 2) openOrdersCounter.current = 3;
	}, [openOrders])

	useEffect(() => {
		if (closedOrdersCounter.current === 3) {
			_updateAnArray('orders', accessToken, 'closed', closedOrders.at(-1));
		}
		if (closedOrdersCounter.current === 2) closedOrdersCounter.current = closedOrdersCounter.current + 1;
	}, [closedOrders])

	return (
		<Toolbar>
			<InvoiceLayer>
				<div ref={componentRef}>
					{
						orders.length > 0 &&
							<Invoice
								business={business}
								orders={orders}
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
					<Tooltip title="To Back" sx={{ display: tableStatus === 'RECEIVED' && 'none' }}>
						<IconButton>
							<NextPlanIcon onMouseUp={handleToBack} />
						</IconButton>
					</Tooltip>
					<Tooltip title="To Next" sx={{ display: tableStatus === 'COMPLETED' && 'none' }}>
						<IconButton>
							<NextPlanIcon onMouseUp={handleToNext} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete" sx={{ display: tableStatus === 'COMPLETED' && 'none' }}>
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