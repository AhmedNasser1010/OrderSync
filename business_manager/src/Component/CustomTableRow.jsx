import { useState } from 'react';
import Stack from '@mui/material/Stack';
import CustomCollapsedTableRow from './CustomCollapsedTableRow';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const CustomTableRow = ({ row, selected, index, handleSetSelected }) => {
	const [isOpen, setIsOpen] = useState(true);

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
		handleSetSelected(newSelected);
	};

	const isItemSelected = isSelected(row.id);
	const labelId = `enhanced-table-checkbox-${index}`;

	return (

		<>
			<TableRow
				hover
				role="checkbox"
				aria-checked={isItemSelected}
				tabIndex={-1}
				selected={isItemSelected}
				sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}
			>
				<TableCell padding="checkbox">
					<Stack direction='row' spacing={0.5}>
						<Checkbox
							color="primary"
							checked={isItemSelected}
							inputProps={{
								'aria-labelledby': labelId,
							}}
							onClick={(event) => handleClick(event, row.id)}
						/>
						<IconButton
							aria-label="expand row"
							size="small"
							onClick={() => setIsOpen(!isOpen)}
						>
							{isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					</Stack>
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
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
					<CustomCollapsedTableRow isOpen={isOpen} />
				</TableCell>
			</TableRow>
		</>

	);
}

export default CustomTableRow;