import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import Button from '@mui/material/Button';

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