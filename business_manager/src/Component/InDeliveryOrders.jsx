import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import currencyToSymbol from '../functions/currencyToSymbol';
import OrdersTable from './OrdersTable';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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

const InDeliveryOrders = ({ tableData, tableStatus }) => {
	const dispatch = useDispatch();
	const [processRows, setProcessRows] = useState([]);

	const createData = (id, customer, cart, timestemp) => {

		// name process
		let name = `${customer.name}`;
		if (customer.verified) {
			name = (
				<Stack direction='row' alignItems='center'>
					<CheckCircleIcon sx={{ fontSize: 'small', marginRight: '3px' }} />
					{ customer.name }
				</Stack>
			);
		} else {
			name = (
				<Stack direction='row' alignItems='center'>
					<CheckCircleOutlineIcon sx={{ fontSize: 'small', marginRight: '3px' }} />
					{ customer.name }
				</Stack>
			);
		}

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
		// Assuming 'timestamp' is the time in milliseconds
		const currentTimestamp = Date.now();
		const timeDifference = currentTimestamp - timestemp;

		// Calculate hours and minutes from milliseconds
		const minutes = Math.floor(timeDifference / (1000 * 60));
		const hours = Math.floor(minutes / 60);

		// Calculate remaining minutes
		const remainingMinutes = minutes % 60;

		// Construct the time ago string
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
		setProcessRows(tableData.map(order => createData(order.id, order.customer, order.cart, order.timestemp)));
	}, [tableData])

	return (

		<Box>
			<OrdersTable tableData={processRows} headCells={headCells} tableStatus={tableStatus} />
		</Box>

	);
}

export default InDeliveryOrders;