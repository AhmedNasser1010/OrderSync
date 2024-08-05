import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import priceAfterDiscount from '../functions/priceAfterDiscount';
import OrdersTable from './OrdersTable';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Box from '@mui/material/Box';

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

const OnGoingOrders = ({ headCells, tableData, tableStatus }) => {
	const dispatch = useDispatch();
	const [processRows, setProcessRows] = useState([]);
	const menuItems = useSelector(state => state.menu?.items)

	const createData = (id, user, cart, timestamp, deliveryFees) => {

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
		const order = cartNameArr.join(', ');

		// total process
		let totalPrice = 0;
		let totalPriceDiscounted = 0;
		cartItems.map(item => {
			totalPrice += item.price * item.quantity
			item.discount ? totalPriceDiscounted += priceAfterDiscount(item.price, item.discount.code) * item.quantity : totalPriceDiscounted += item.price * item.quantity
		});
		// total = `${total}LE`
		let total
		if (totalPrice === totalPriceDiscounted) {
			total = `${totalPrice+deliveryFees}LE`
		} else {
			total = <div>
				<span style={{ color: 'red' }}>{ totalPrice+deliveryFees }</span> <span style={{ color: 'green' }}>{ totalPriceDiscounted+deliveryFees }LE</span>
			</div>
		}

		// timestemp process
		const currentTimestamp = Date.now();
		const timeDifference = currentTimestamp - timestamp;

		const minutes = Math.floor(timeDifference / (1000 * 60));
		const hours = Math.floor(minutes / 60);

		const remainingMinutes = minutes % 60;

		let ago = '';
		if (hours > 0) {
			ago += `${hours}h, `;
		}
		if (remainingMinutes > 0 || ago === '') {
			ago += `${remainingMinutes}m`;
		}

		return { id, name, order, ago, total };
	}

	// process incoming data to data rows
	useEffect(() => {
		let updateDataInter = null
		updateDataInter && clearInterval(updateDataInter)

		setProcessRows(tableData?.map(order => createData(order.id, order.user, order.cart, order.timestamp, order.deliveryFees)));
		updateDataInter = setInterval(() => setProcessRows(tableData?.map(order => createData(order.id, order.user, order.cart, order.timestamp, order.deliveryFees))), 60000)

		return () => {
		 updateDataInter && clearInterval(updateDataInter)
		}
	}, [tableData, menuItems])

	return (

		<Box>
			<OrdersTable tableData={processRows} headCells={headCells} tableStatus={tableStatus} />
		</Box>

	);
}

export default OnGoingOrders;