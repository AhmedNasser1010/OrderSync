import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import TableToolbar from './TableToolbar';
import CustomTableHead from './CustomTableHead';
import CustomTableRow from './CustomTableRow';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';


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

// for non-modern browsers [exampleArray.slice().sort(exampleComparator)]
const stableSort = (array, comparator) => {
	if (array) {
		const stabilizedThis = array.map((el, index) => [el, index]);
		stabilizedThis.sort((a, b) => {
			const order = comparator(a[0], b[0]);
			if (order !== 0) {
				return order;
			}
			return a[1] - b[1];
		});
		return stabilizedThis.map((el) => el[0]);
	}
}

const OrdersTable = ({ tableData, headCells, tableStatus }) => {
	const [order, setOrder] = useState('asc');
	const [orderBy, setOrderBy] = useState('');
	const [selected, setSelected] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [dense, setDense] = useState(false);
	const [rows, setRows] = useState([]);

	useEffect(() => {
		setRows(tableData);
	}, [tableData])

	const handleSetSelected = (value) => {
		setSelected(value)
	}

	const handleSelectAllClick = (event) => {
		if (event.target.checked) {
			const newSelected = rows.map((n) => n.id);
			setSelected(newSelected);
			return;
		}
		setSelected([]);
	};

	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const visibleRows = useMemo(() =>
		stableSort(rows, getComparator(order, orderBy))?.slice(
			page * rowsPerPage,
			page * rowsPerPage + rowsPerPage,
		), [order, orderBy, page, rowsPerPage, rows]);

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

	return (

		<Box>
			<TableToolbar
				selected={selected}
				handleSetSelected={handleSetSelected}
				tableStatus={tableStatus}
			/>
			<TableContainer component={Paper}>

			<Table
				sx={{ minWidth: 650 }}
				aria-label="simple table"
				size={dense ? 'small' : 'medium'}
			>

				<CustomTableHead
					numSelected={selected.length}
					order={order}
					orderBy={orderBy}
					onSelectAllClick={handleSelectAllClick}
					onRequestSort={handleRequestSort}
					rowCount={rows?.length}
					headCells={headCells}
				/>

				<TableBody>
					{visibleRows?.map((row, index) => {
						return (
							<CustomTableRow
								key={uuidv4()}
								row={row}
								selected={selected}
								index={index}
								handleSetSelected={handleSetSelected}
								tableStatus={tableStatus}
							/>
						);
					})}
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
				rowsPerPageOptions={[5, 10, 25]}
				component="div"
				count={rows?.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>

			<FormControlLabel
				control={<Switch checked={dense} onChange={handleChangeDense} />}
				label="Dense padding"
			/>
		</Box>

	);
}

export default OrdersTable;