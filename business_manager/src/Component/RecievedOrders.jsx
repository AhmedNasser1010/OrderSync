import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setOrders } from '../rtk/slices/ordersSlice';
import OrdersTable from './OrdersTable';
import Box from '@mui/material/Box';

const RecievedOrders = () => {
	const dispatch = useDispatch();
	const orders = useSelector(state => state.orders);

	const createData = (id, name, order, total) => {
		return { id, name, order, total };
	}

	const rows = [
		createData(0, 'ahmed', ['pizza', 'clhs', 'akn'], 90),
		createData(1, 'nasser', ['beef', 'cidugkv'], 120),
	];

	useEffect(() => {
		orders.length === 0 && dispatch(setOrders(rows));
		// dispatch(setOrders(rows));
	}, [])

	return (

		<Box>
			<OrdersTable />
		</Box>

	);
}

export default RecievedOrders;