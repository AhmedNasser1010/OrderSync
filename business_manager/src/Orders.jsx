import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setOpenedOrders, newTestOrder } from './rtk/slices/ordersSlice';
import { resetSavingOrdersTimer, decreaseSavingOrdersTimer, savingOrdersTimerIsLoading } from './rtk/slices/conditionalValuesSlice';
import DB_GET_DOC from './functions/DB_GET_DOC';
import _updateAnArray from './functions/_updateAnArray';
import PageTitle from './Component/PageTitle';
import CustomTabPanel from './Component/CustomTabPanel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentsIcon from '@mui/icons-material/Payments';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';

import { doc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase.js"

import RecievedOrders from './Component/RecievedOrders';
import OnGoingOrders from './Component/OnGoingOrders';
import InDeliveryOrders from './Component/InDeliveryOrders';
import CompletedOrders from './Component/CompletedOrders';
import ClosedOrders from './Component/ClosedOrders';

import useDummyOrder from './hooks/useDummyOrder'

const headCells = [
	{
		id: 'index',
		numeric: false,
		disablePadding: true,
		label: '',
	},
	{
		id: 'id',
		numeric: false,
		disablePadding: false,
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><FingerprintIcon sx={{ marginRight: '5px' }} /> ID</span>),
	},
	{
		id: 'customer',
		numeric: false,
		disablePadding: true,
		label: 'Customer',
		startIcon: (
			<Stack direction='row'>
				<CheckCircleIcon sx={{ fontSize: 'small', transform: 'translate(25%, -10%)' }} />
				<CheckCircleOutlineIcon sx={{ fontSize: 'small', transform: 'translate(-25%, 10%)' }} />
			</Stack>
		),
	},
	{
		id: 'order',
		numeric: false,
		disablePadding: false,
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><RestaurantMenuIcon sx={{ marginRight: '5px' }} />Items</span>),
	},
	{
		id: 'ago',
		numeric: false,
		disablePadding: false,
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><AccessTimeIcon sx={{ marginRight: '5px' }} /> Ago</span>),
	},
	{
		id: 'totla',
		numeric: false,
		disablePadding: false,
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><PaymentsIcon sx={{ marginRight: '5px' }} /> Total</span>),
	},
	{
		id: 'assign',
		numeric: false,
		disablePadding: false,
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><ScheduleSendIcon sx={{ marginRight: '5px' }} /> Assign</span>),
	},
]

const Orders = () => {
	const dummyOrder = useDummyOrder()
	const dispatch = useDispatch();
	const [tabValue, setTabValue] = useState(0);
	const accessToken = useSelector(state => state.user.accessToken);
	const currentOrdersLength = useSelector(state => state.orders.open?.length);
	const orders = useSelector(state => state.orders.open);
	const [isSaving, setIsSaving] = useState(false);
	const intervalRef = useRef(null);
	const savingOrdersTimer = useSelector(state => state.conditionalValues.savingOrdersTimer)

	useEffect(() => {
		const docRef = doc(db, 'orders', accessToken);

		const unsub = onSnapshot(docRef, doc => {
			window.read += 1
			console.log('Read: ', window.read)
			if (doc.exists()) {
				doc.data().open?.length > 0 && dispatch(setOpenedOrders(doc.data().open))
			}
		})
	}, [])

	const a11yProps = (index) => {
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,

		};
	}
	const handleChangeTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	const orderFilter = (filterKey) => {
		let result = [];
		orders?.map(order => order?.status === filterKey && result.push(order));
		return result;
	}

	const handleAddTestOrder = () => {
		if (dummyOrder) {
			_updateAnArray('orders', accessToken, 'open', dummyOrder)
			dispatch(newTestOrder(dummyOrder))
		}
	}

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

				<Box style={{ width: '100%' }}>

					<Box sx={{ padding: '10px 10px 0 20px' }}>
						<Button variant='contained' size='small' onMouseUp={handleAddTestOrder}>Test Order</Button>
					</Box>

					<CustomTabPanel tabValue={tabValue} index={0}>
						<RecievedOrders headCells={headCells} tableData={orderFilter('RECEIVED')} tableStatus='RECEIVED' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={1}>
						<OnGoingOrders headCells={headCells} tableData={orderFilter('ON_GOING')} tableStatus='ON_GOING' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={2}>
						<InDeliveryOrders headCells={headCells} tableData={orderFilter('IN_DELIVERY')} tableStatus='IN_DELIVERY' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={3}>
						<CompletedOrders headCells={headCells} tableData={orderFilter('COMPLETED')} tableStatus='COMPLETED' />
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