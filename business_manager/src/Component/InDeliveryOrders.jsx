import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import priceAfterDiscount from '../functions/priceAfterDiscount';
import OrdersTable from './OrdersTable';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Box from '@mui/material/Box';
import TimestampToHM from './TimestampToHM'

const headCells = [
	{
		id: 'index',
		numeric: false,
		disablePadding: true,
		label: '#',
	},
	{
		id: 'id',
		numeric: false,
		disablePadding: false,
		label: 'ID',
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
		label: 'Order',
	},
	{
		id: 'ago',
		numeric: false,
		disablePadding: false,
		label: 'Ago',
	},
	{
		id: 'totla',
		numeric: false,
		disablePadding: false,
		label: 'Total',
	},
];

const InDeliveryOrders = ({ headCells, tableData, tableStatus }) => {
	const dispatch = useDispatch();
	const [processRows, setProcessRows] = useState([]);
	const menuItems = useSelector(state => state.menu?.items)

	const createData = (id, user, cart, timestamp, deliveryFees, totalPrice) => {

		// name process
		let name = user.name
		// the user should be check if verified or not
		// as default its false right now
		if (false) {
			name = (
				<Stack direction='row' alignItems='center'>
					<CheckCircleIcon sx={{ fontSize: 'small', marginRight: '3px' }} />
					{ user.name }
				</Stack>
			);
		} else {
			name = (
				<Stack direction='row' alignItems='center'>
					<CheckCircleOutlineIcon sx={{ fontSize: 'small', marginRight: '3px' }} />
					{ user.name }
				</Stack>
			);
		}

		// get cart items
		let cartItems = []
		menuItems.map(menuItem => {
			cart.map(cartItem => {
				menuItem.id === cartItem.id && cartItems.push({...menuItem, quantity: cartItem.quantity})
			})
		})

		// cart process
		let cartNameArr = [];
		cartItems.map(item => cartNameArr.push(item.title));
		const order = cartNameArr.join(', ').substring(0, 50) + (cartNameArr.join(', ').length > 50 ? '...' : '');

		// total process
		let total
		if (totalPrice.total === totalPrice.discount) {
			total = `${totalPrice.total}LE`
		} else {
			total = (
				<div>
					<span style={{ color: 'red' }}>{ totalPrice.total }</span>
					<span style={{ color: 'green' }}>{ totalPrice.discount }LE</span>
				</div>
			)
		}

		// timestamp process
		let ago = <TimestampToHM timestamp={timestamp} />

		return { id, name, order, ago, total };
	}

	// process incoming data to data rows
	useEffect(() => {
		setProcessRows(tableData?.map(order => createData(order.id, order.user, order.cart, order.timestamp, order.deliveryFees, order.cartTotalPrice)));
	}, [tableData, menuItems])

	return (

		<Box>
			<OrdersTable tableData={processRows} headCells={headCells} tableStatus={tableStatus} />
		</Box>

	);
}

export default InDeliveryOrders;