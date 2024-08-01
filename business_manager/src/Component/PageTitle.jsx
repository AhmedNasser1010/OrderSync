import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

const PageTitle = ({ style, title }) => {
	return (

		<Box sx={style} className='page-title'>
			<Typography
				variant="h2"
				gutterBottom
				sx={{ fontSize: '3em', marginLeft: '15px' }}
			>
				{ title }
			</Typography>
			<Divider />
		</Box>

	);
}

export default PageTitle;