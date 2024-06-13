import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import priceAfterDiscount from '../functions/priceAfterDiscount';
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
		id: 'id',
		numeric: false,
		label: 'ID',
	},
	{
		id: 'name',
		numeric: false,
		label: 'name',
	},
	{
		id: 'phone',
		numeric: false,
		label: 'Phone',
	},
	{
		id: 'order',
		numeric: false,
		label: 'Order',
	},
	{
		id: 'total',
		numeric: false,
		label: 'Total',
	}
];

function ClosedOrdersCollapsedTable({ timestamp, isOpen }) {
	const closedOrders = useSelector(state => state.orders.closed)
	const menuItems = useSelector(state => state.menu.items)
	const [rows, setRows] = useState([])

	// useEffect(() => {
	// 	let finallRows = []
	// 	closedOrders.map(closedOrder => {
	// 		if (closedOrder.timestamp === timestamp) {
	// 			closedOrder.orders.map(order => {
	// 				let cartNameArr = []
	// 				order.cart.map(cart => cartNameArr.push(cart.name))

	// 				finallRows.push({ id: order.id, name: order.customer.name, orders: cartNameArr.join(', '), total: order.payment.total, currency: order.payment.currency })
	// 			})
	// 		}
	// 	})

	// 	setRows(finallRows)
	// }, [])


	useEffect(() => {
		let finallRows = []

		let closedOrder
		closedOrders.map(closed => {if (closed.timestamp === timestamp) closedOrder = closed; return})

		closedOrder.orders.map(order => {
			let orderItems = []
			order.cart.map(cart => menuItems.map(item => cart.id === item.id && orderItems.push({...item, quantity: cart.quantity})))

			let orderItemsName = []
			orderItems.map(item => orderItemsName.push(item.title))

			let total = 0
			orderItems.map(item => item.discount ? total += priceAfterDiscount(item.price, item.discount.code) * item.quantity : total += item.price * item.quantity)

			console.log(order)
			finallRows.push({ id: order.id, name: order.user.name, phone: order.user.phone, orders: orderItemsName.join(', '), total })
		})

		setRows(finallRows)

		// let finallRows = []

		// closedOrders.map(closedOrder => {
		// 	if (closedOrder.timestamp === timestamp) {
		// 		closedOrder.orders.map(order => {
		// 			let cartNameArr = []
		// 			order.cart.map(cart => cartNameArr.push(cart.name))

		// 			finallRows.push({ id: order.id, name: order.customer.name, orders: cartNameArr.join(', '), total: order.payment.total, currency: order.payment.currency })
		// 		})
		// 	}
		// })

		// setRows(finallRows)
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
      				rows.map((row, i) => (
      					<TableRow key={row.id}>
      						<TableCell padding='none'>{ i+1 }</TableCell>
      						<TableCell padding='none'>{ row.id }</TableCell>
      						<TableCell padding='none'>{ row.name }</TableCell>
      						<TableCell padding='none'>{ row.phone }</TableCell>
      						<TableCell padding='none'>{ row.orders }</TableCell>
      						<TableCell padding='none'>{ row.total }LE</TableCell>
      					</TableRow>
      				))
      			}
      		</TableBody>
      	</Table>
			</TableContainer>
		</Collapse>

	);
}

export default ClosedOrdersCollapsedTable;