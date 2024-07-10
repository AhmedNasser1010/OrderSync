import { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setClosedOrders } from '../rtk/slices/ordersSlice'
import { v4 as uuidv4 } from 'uuid'
import stableSort from '../functions/stableSort'
import DB_GET_DOC from '../functions/DB_GET_DOC'
import priceAfterDiscount from '../functions/priceAfterDiscount'
import ClosedOrdersRow from './ClosedOrdersRow'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import Toolbar from '@mui/material/Toolbar'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box'
import PageTitle from './PageTitle'

const descendingComparator = (a, b, orderBy) => {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

const getComparator = (order, orderBy) => {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
	{
		id: 'index',
		numeric: false,
		disablePadding: false,
		label: '#',
	},
	{
		id: 'expand',
		numeric: false,
		disablePadding: false,
		label: 'Expand',
	},
	{
		id: 'day',
		numeric: false,
		disablePadding: false,
		label: 'Day',
	},
	{
		id: 'orders-counter',
		numeric: false,
		disablePadding: false,
		label: 'Orders Counter',
	},
	{
		id: 'totla',
		numeric: false,
		disablePadding: false,
		label: 'Total',
	},
];

function ClosedOrders() {
	const dispatch = useDispatch()
	const accessToken = useSelector(state => state.user.accessToken)
	const closedOrders = useSelector(state => state.orders.closed)
	const menuItems = useSelector(state => state.menu.items)
	const [order, setOrder] = useState('asc')
	const [orderBy, setOrderBy] = useState('')
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(5)
	const [dense, setDense] = useState(false)
	const [rows, setRows] = useState([])

	useEffect(() => {
		closedOrders.length === 0 && DB_GET_DOC('orders', accessToken)
		.then(res => {
			res && dispatch(setClosedOrders(res.closed))
		})
	}, [])

	useEffect(() => {
		const result = closedOrders.map(closed => {
			let counter = 0
			let totalDayIncome = 0

			counter = closed.orders.length
			closed.orders.map(order => {
				let orderItems = []

				order.cart.map(cartItem => menuItems.map(menuItem => cartItem.id === menuItem.id && orderItems.push({...menuItem, quantity: cartItem.quantity})))

				orderItems.map(order => {
					order.discount ? totalDayIncome += priceAfterDiscount(order.price, order.discount.code) * order.quantity : totalDayIncome += order.price * order.quantity
				})
			})

			return {timestamp: closed.timestamp, counter, totalDayIncome}
		})


		setRows(result)
	}, [closedOrders])


	const visibleRows = useMemo(() =>
	stableSort(rows, getComparator(order, orderBy))?.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	), [order, orderBy, page, rowsPerPage, rows])

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleChangeDense = (event) => {
		setDense(event.target.checked);
	};

	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const createSortHandler = (property) => (event) => {
		handleRequestSort(event, property);
	};


	return (

		<Box>
			<PageTitle title='Closed Orders' style={{ marginBottom: '50px' }} />

			<div style={{ margin: '0 15px' }}>
				<TableContainer component={Paper}>
					<Table
						sx={{ minWidth: 650 }}
						aria-label="simple table"
					>
						
						<TableHead>
							<TableRow>
								{headCells.map(headCell => (

									<TableCell
										key={uuidv4()}
										align='left'
									>
										<TableSortLabel
											active={orderBy === headCell.id}
											direction={orderBy === headCell.id ? order : 'asc'}
											onClick={createSortHandler(headCell.id)}
										>
											{headCell.label}
										</TableSortLabel>
									</TableCell>

								))}
							</TableRow>
						</TableHead>

						<TableBody>
							{visibleRows.map((row, index) => (
								<ClosedOrdersRow row={row} index={index} />
							))}
							{emptyRows > 0 && (
								<TableRow
									style={{
										height: (dense ? 33 : 53) * emptyRows,
									}}
								>
									<TableCell colSpan={6} />
								</TableRow>
							)}
						</TableBody>

					</Table>
				</TableContainer>

				<TablePagination
					rowsPerPageOptions={[5, 10, 30]}
					component="div"
					count={rows?.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</div>
		</Box>

	)
}

export default ClosedOrders