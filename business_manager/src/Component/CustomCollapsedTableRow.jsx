import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import currencyToSymbol from '../functions/currencyToSymbol';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

const collapsHeadCells = [
	{
		id: 'index',
		numeric: false,
		label: '',
	},
	{
		id: 'itemId',
		numeric: false,
		label: 'ID',
	},
	{
		id: 'orderItem',
		numeric: false,
		label: 'Order Item',
	},
	{
		id: 'amount',
		numeric: false,
		label: 'Amount',
	},
	{
		id: 'pricePer',
		numeric: false,
		label: 'Price Per',
	},
	{
		id: 'price',
		numeric: false,
		label: 'Price',
	},
];

const CustomCollapsedTableRow = ({ isOpen, row }) => {
	const orders = useSelector(state => state.orders.open);
	const [cart, setCart] = useState([]);

	// get full row data process
	useEffect(() => {
		// const rowID = row.shortedID.slice(1, 5);
		const rowCustomerName = row.name.props.children[1];
		// console.log(row)
		// console.log(orders)

		// filtering
		orders.map(order => {
			// const orderID = order.id.split('-')[0];
			const orderCustomerName = order?.customer?.name;

			// console.log('order', order.id)
			// console.log('row', row.id)

			// orderID === rowID && orderCustomerName === rowCustomerName && setCart(order.cart);
			order?.id === row.id && orderCustomerName === rowCustomerName && setCart(order.cart);

		});
	}, [])

	return (

		<Collapse
			in={isOpen}
			timeout="auto"
			unmountOnExit
			sx={{ padding: '0 10px 15px' }}
		>
			<TableContainer>
				<Typography variant="h6" gutterBottom component="div">
        	More Details
      	</Typography>

      	<Table aria-label="collapsible table">
      		<TableHead>
      		{
      			collapsHeadCells?.map(headCell => (
      				<TableCell
      					key={headCell.id}
								align={headCell.numeric ? 'right' : 'left'}
								padding='none'
      				>
      					{ headCell.label }
      				</TableCell>
      			))
      		}
      		</TableHead>
      		<TableBody>
      			{
      				cart.map((cartItem, i) => (
      					<TableRow key={cartItem.id}>
      						<TableCell padding='none'>{ i+1 }</TableCell>
      						<TableCell padding='none'>{ cartItem.id }</TableCell>
      						<TableCell padding='none'>{ cartItem.name }</TableCell>
      						<TableCell padding='none'>{ cartItem.quantity }</TableCell>
      						<TableCell padding='none'>{ cartItem.price + currencyToSymbol(cartItem.currency) }</TableCell>
      						<TableCell padding='none'>{ cartItem.price * cartItem.quantity  + currencyToSymbol(cartItem.currency) }</TableCell>
      					</TableRow>
      				))
      			}
      		</TableBody>
      	</Table>
			</TableContainer>
		</Collapse>

	);
}

export default CustomCollapsedTableRow;