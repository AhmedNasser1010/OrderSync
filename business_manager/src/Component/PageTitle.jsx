import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

const PageTitle = ({ style, title }) => {
	return (

		<Box sx={style}>
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