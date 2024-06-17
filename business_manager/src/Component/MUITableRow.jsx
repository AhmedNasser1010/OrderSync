import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

const MUITableRow = ({ row = [], index }) => {
	return (

		<TableRow
			hover
			role="checkbox"
			tabIndex={-1}
			sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}
		>
			<TableCell>{ index+1 }</TableCell>
			{ Object.values(row).map((value, i) => (
				<TableCell key={i}>
					{ value }
				</TableCell>
			)) }
		</TableRow>

	)
}

export default MUITableRow