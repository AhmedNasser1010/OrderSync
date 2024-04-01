import { useState, useMemo } from 'react';
import TableToolbar from './TableToolbar';
import TableHeadd from './TableHead';
import Box from '@mui/material/Box';
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

const OrdersTable = ({  }) => {
	const [order, setOrder] = useState('asc');
	const [orderBy, setOrderBy] = useState('nasser');
	const [selected, setSelected] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [dense, setDense] = useState(false);

	const createData = (name, order, total) => {
		return { name, order, total };
	}

	const rows = [
		createData('ahmed', ['pizza', 'clhs', 'akn'], '90'),
		createData('nasser', ['beef', 'cidugkv'], '120'),
	];

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
		stableSort(rows, getComparator(order, orderBy)).slice(
			page * rowsPerPage,
			page * rowsPerPage + rowsPerPage,
		), [order, orderBy, page, rowsPerPage]);

	const isSelected = (id) => selected.indexOf(id) !== -1;

	const handleClick = (event, id) => {
		const selectedIndex = selected.indexOf(id);
		let newSelected = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedIndex),
				selected.slice(selectedIndex + 1),
			);
		}
		setSelected(newSelected);
	};

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
			<TableToolbar numSelected={selected.length} />
			<TableContainer component={Paper}>

			<Table sx={{ minWidth: 650 }} aria-label="simple table">

				<TableHeadd
					numSelected={selected.length}
					order={order}
					orderBy={orderBy}
					onSelectAllClick={handleSelectAllClick}
					onRequestSort={handleRequestSort}
					rowCount={rows.length}
				/>

				<TableBody>
					{visibleRows.map((row, index) => {
						const isItemSelected = isSelected(row.id);
						const labelId = `enhanced-table-checkbox-${index}`;

						return (
							<TableRow
								key={index}
								hover
								onClick={(event) => handleClick(event, row.id)}
								role="checkbox"
								aria-checked={isItemSelected}
								tabIndex={-1}
								selected={isItemSelected}
								sx={{ cursor: 'pointer' }}
							>
								<TableCell padding="checkbox">
									<Checkbox
										color="primary"
										checked={isItemSelected}
										inputProps={{
											'aria-labelledby': labelId,
										}}
									/>
								</TableCell>
								<TableCell
									component="th"
									id={labelId}
									scope="row"
									padding="none"
								>
									{row.name}
								</TableCell>
								<TableCell align="right">{row.order[0]}</TableCell>
								<TableCell align="right">{row.total}</TableCell>
							</TableRow>
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
				count={rows.length}
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