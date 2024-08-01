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
import Paper from '@mui/material/Paper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentsIcon from '@mui/icons-material/Payments';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { IoArchive } from "react-icons/io5";
import { GiCook } from "react-icons/gi";
import { MdDeliveryDining } from "react-icons/md";
import { IoMdDoneAll } from "react-icons/io";

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
		id: 'print',
		numeric: false,
		disablePadding: false,
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><ReceiptIcon sx={{ marginRight: '5px' }} /> Print</span>),
	},
	{
		id: 'assign',
		numeric: false,
		disablePadding: false,
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><ScheduleSendIcon sx={{ marginRight: '5px' }} /> Assign</span>),
	},
]

const headCellsNoAssign = headCells.filter(cell => cell.id !== 'assign')
const headCellsForReceived = headCellsNoAssign.filter(cell => cell.id !== 'print')

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
	const business = useSelector(state => state.business)
	const [innerWidth, setInnerWidth] = useState(window.innerWidth)

	useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setInnerWidth(width);
    }

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
    }
	}, [])

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
			sx: {
				width: innerWidth <= 650 ? `${innerWidth/3}px` : '100%'
			}
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

			<Stack direction="row" sx={{ minHeight: 'calc(100vh - 75px)', flexDirection: innerWidth <= 650 ? 'column-reverse' : 'row' }}>

				<Box sx={{ borderRight: 1, borderColor: 'divider', minWidth: '130px', backgroundColor: 'transparent' }} className='tabs-box'>
					<Tabs
						value={tabValue}
						onChange={handleChangeTabChange}
						orientation={innerWidth <= 650 ? 'horizontal' : 'vertical'}
						scrollButtons={false}
						variant={innerWidth <= 650 ? "scrollable" : "standard"}
						sx={{ height: '100%', position: 'relative' }}
						className="tabs"
						component={Paper}
					>
						<Tab label="Recieved" {...a11yProps(0)} icon={<IoArchive style={{ fontSize: '1.3rem' }} />} />
						<Tab label="In Progress" {...a11yProps(1)} icon={<GiCook style={{ fontSize: '1.8rem' }} />} />
						<Tab label="In Delivery" {...a11yProps(2)} icon={<MdDeliveryDining style={{ fontSize: '1.8rem' }} />} />
						<Tab className='done-orders-tab' label="Completed" {...a11yProps(3)} icon={<IoMdDoneAll style={{ fontSize: '1.5rem' }} />} style={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', position: 'absolute', bottom: '0', left: '0' }} />
					</Tabs>
				</Box>

				<Box style={{ width: '100%' }} className='tables-box'>

					{/*<Box sx={{ padding: '10px 10px 0 20px' }}>
						<Button variant='contained' size='small' onMouseUp={handleAddTestOrder}>Test Order</Button>
					</Box>*/}

					<CustomTabPanel tabValue={tabValue} index={0}>
						<RecievedOrders headCells={headCellsForReceived} tableData={orderFilter('RECEIVED')} tableStatus='RECEIVED' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={1}>
						<OnGoingOrders headCells={business?.settings?.orderManagement?.assign?.forCooks ? headCells : headCellsNoAssign} tableData={orderFilter('IN_PROGRESS')} tableStatus='IN_PROGRESS' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={2}>
						<InDeliveryOrders headCells={business?.settings?.orderManagement?.assign?.forDeliveryWorkers ? headCells : headCellsNoAssign} tableData={orderFilter('IN_DELIVERY')} tableStatus='IN_DELIVERY' />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={3}>
						<CompletedOrders headCells={headCellsNoAssign} tableData={orderFilter('COMPLETED')} tableStatus='COMPLETED' />
					</CustomTabPanel>

				</Box>
				
			</Stack>

		</Box>

	);
}

export default Orders;