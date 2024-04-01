import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const PageTitle = ({ title }) => {
	return (

		<Box>
			<Typography
				variant="h2"
				gutterBottom
				sx={{ fontSize: '3em' }}
			>
				{ title }
			</Typography>
			<Divider />
		</Box>

	);
}

export default PageTitle;