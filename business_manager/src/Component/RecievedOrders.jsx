import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setOrders } from '../rtk/slices/ordersSlice';
import _getSubcollection from '../functions/_getSubcollection';
import currencyToSymbol from '../functions/currencyToSymbol';
import OrdersTable from './OrdersTable';
import Box from '@mui/material/Box';

const headCells = [
	{
		id: 'index',
		numeric: false,
		disablePadding: false,
		label: '#',
	},
	{
		id: 'id',
		numeric: false,
		disablePadding: false,
		label: 'ID',
	},
	{
		id: 'name',
		numeric: false,
		disablePadding: true,
		label: 'Name',
	},
	{
		id: 'order',
		numeric: true,
		disablePadding: false,
		label: 'Order',
	},
	{
		id: 'ago',
		numeric: true,
		disablePadding: false,
		label: 'Ago',
	},
	{
		id: 'totla',
		numeric: true,
		disablePadding: false,
		label: 'Total',
	},
];

const RecievedOrders = () => {
	const dispatch = useDispatch();
	const dataRows = useSelector(state => state.orders);
	const orders = useSelector(state => state.orders);
	const businessID = useSelector(state => state.user.accessToken);
	const [processRows, setProcessRows] = useState([]);

	// set orders state
	useEffect(() => {
		_getSubcollection('orders', businessID)
			.then(res => orders.length === 0 && dispatch(setOrders(res)));
	}, [])

	const createData = (id, name, cart, timestemp) => {

		// id process
		const shortedID = `#${id.split('-')[0]}`;

		// cart process
		let cartNameArr = [];
		cart.map(item => cartNameArr.push(item.name));
		const order = cartNameArr.join(', ');

		// total process
		let total = 0;
		let lastCurrency = null;
		let sameCurrency = true;
		cart.map(item => total = item.price + total);
		cart.map(item => {
			if (lastCurrency !== null) {
				if (lastCurrency !== item.currency) {
					sameCurrency = false;
				}
			}
			lastCurrency = item.currency;
		});
		if (sameCurrency) {
			total = `${total}${currencyToSymbol(lastCurrency)}`;
		} else {
			total = `${total}??`;
		}

		// timestemp process
		const currentTimestamp = Date.now();
		let orderTimestemp = new Date(currentTimestamp - timestemp);
		const ago = `${orderTimestemp.getHours()}h, ${orderTimestemp.getMinutes()}m`;

		return { shortedID, name, order, ago, total };
	}

	// process incoming data to data rows
	useEffect(() => {
		setProcessRows(dataRows.ordersArray?.map(order => createData(order.id, order.customer.name, order.cart, order.timestemp)));
	}, [dataRows])

	return (

		<Box>
			<OrdersTable dataRows={processRows} headCells={headCells} />
		</Box>

	);
}

export default RecievedOrders;