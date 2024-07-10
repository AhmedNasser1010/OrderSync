import { useState } from 'react'
import formatDateFromTimestamp from '../functions/formatDateFromTimestamp'
import currencyToSymbol from '../functions/currencyToSymbol'
import ClosedOrdersCollapsedTable from './ClosedOrdersCollapsedTable'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

function ClosedOrdersRow({ row, index }) {
	const [isOpen, setIsOpen] = useState(false)

	return (

		<>
			<TableRow
				onClick={() => setIsOpen(!isOpen)}
				sx={{ cursor: 'pointer' }}
			>
				<TableCell>{index+1}</TableCell>
				<TableCell>
					<IconButton
						aria-label="expand row"
						size="small"
						onClick={() => setIsOpen(!isOpen)}
					>
						{isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				<TableCell>{formatDateFromTimestamp(row.timestamp, '/')}</TableCell>
				<TableCell>{row.counter}</TableCell>
				<TableCell>{row.totalDayIncome}ج.م</TableCell>
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
					<ClosedOrdersCollapsedTable timestamp={row.timestamp} isOpen={isOpen} />
				</TableCell>
			</TableRow>
		</>

	)
}

export default ClosedOrdersRow