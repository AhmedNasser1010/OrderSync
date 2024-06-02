import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setOpenedOrders, newTestOrder } from './rtk/slices/ordersSlice';
import { resetSavingOrdersTimer, decreaseSavingOrdersTimer, savingOrdersTimerIsLoading } from './rtk/slices/conditionalValuesSlice';
import DB_GET_DOC from './functions/DB_GET_DOC';
import _updateAnArray from './functions/_updateAnArray';
import returnTestOrder from './functions/returnTestOrder';
import PageTitle from './Component/PageTitle';
import CustomTabPanel from './Component/CustomTabPanel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import RecievedOrders from './Component/RecievedOrders';
import OnGoingOrders from './Component/OnGoingOrders';
import InDeliveryOrders from './Component/InDeliveryOrders';
import CompletedOrders from './Component/CompletedOrders';
import ClosedOrders from './Component/ClosedOrders';

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";


const Orders = () => {
	const dispatch = useDispatch();
	const [tabValue, setTabValue] = useState(0);
	const accessToken = useSelector(state => state.user.accessToken);
	const currentOrdersLength = useSelector(state => state.orders.open?.length);
	const orders = useSelector(state => state.orders.open);
	const [isSaving, setIsSaving] = useState(false);
	const intervalRef = useRef(null);
	const savingOrdersTimer = useSelector(state => state.conditionalValues.savingOrdersTimer)

	const a11yProps = (index) => {
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,
		};
	}
	const handleChangeTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	// Set orders data to redux state
	useEffect(() => {
		// DB_GET_DOC('orders', accessToken)
		// 	.then(res => !currentOrdersLength && dispatch(setOrders(res)));
		const docRef = doc(db, 'orders', accessToken);

		const unsub = onSnapshot(docRef, doc => {
			dispatch(setOpenedOrders(doc.data().open));
		})

		return () => {
			unsub();
		}
	}, [])

	const orderFilter = (filterKey) => {
		let result = [];
		orders?.map(order => order?.status === filterKey && result.push(order));
		return result;
	}

	const handleAddTestOrder = () => {
		const dummyOrder = returnTestOrder();
		_updateAnArray('orders', accessToken, 'open', dummyOrder);
		dispatch(newTestOrder(dummyOrder));
	}

	// useEffect(() => {

	// 	intervalRef.current = setInterval(() => {
	// 		dispatch(decreaseSavingOrdersTimer());
	// 	}, 1000)

	// 	return () => {
	// 		clearInterval(intervalRef.current)
	// 	}
	// }, [])

	// useEffect(() => {
	// 	if (savingOrdersTimer <= -1) {
	// 		dispatch(savingOrdersTimerIsLoading());
	// 		clearInterval(intervalRef.current);
	// 		setIsSaving(true);
	// 		// dispatch(resetSavingOrdersTimer());
	// 	}
	// }, [savingOrdersTimer])

	// useEffect(() => {
	// 	console.log(isSaving)
	// }, [isSaving])

	// useEffect(() => {
	// 	console.log(savingOrdersTimer)
	// }, [savingOrdersTimer])

	return (

		<Box>

			<PageTitle title='Orders' />

			<Stack direction="row" sx={{ minHeight: 'calc(100vh - 75px)' }}>

				<Box sx={{ borderRight: 1, borderColor: 'divider' }}>
					<Tabs
						value={tabValue}
						onChange={handleChangeTabChange}
						orientation="vertical"
						variant='scrollable'
					>
						<Tab label="Recieved" {...a11yProps(0)} />
						<Tab label="On Going" {...a11yProps(1)} />
						<Tab label="In Delivery" {...a11yProps(2)} />
						<Tab label="Completed" {...a11yProps(3)} />
						<Tab label="Closed" {...a11yProps(4)} sx={{ borderTop: '1px solid #0000001f' }} />
					</Tabs>
				</Box>

				<Box>

					<Box sx={{ padding: '10px 10px 0 20px' }}>
						<Button variant='contained' size='small' onMouseUp={handleAddTestOrder}>Test Order</Button>
					</Box>

					<CustomTabPanel tabValue={tabValue} index={0}>
						<RecievedOrders tableData={orderFilter('RECEIVED')} tableStatus='RECEIVED' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={1}>
						<OnGoingOrders tableData={orderFilter('ON_GOING')} tableStatus='ON_GOING' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={2}>
						<InDeliveryOrders tableData={orderFilter('IN_DELIVERY')} tableStatus='IN_DELIVERY' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={3}>
						<CompletedOrders tableData={orderFilter('COMPLETED')} tableStatus='COMPLETED' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={4}>
						<ClosedOrders />
					</CustomTabPanel>

				</Box>
				
			</Stack>

		</Box>

	);
}

export default Orders;