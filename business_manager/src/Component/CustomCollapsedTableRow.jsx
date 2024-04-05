import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';

const CustomCollapsedTableRow = ({ isOpen }) => {
	return (

		<Collapse in={isOpen} timeout="auto" unmountOnExit>
			<Box sx={{ margin: 1 }}>
				<Typography variant="h6" gutterBottom component="div">
        	More Details
      	</Typography>
			</Box>
		</Collapse>

	);
}

export default CustomCollapsedTableRow;