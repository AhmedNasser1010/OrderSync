// MUI
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const Widget = ({ children }) => {
	return (

		<Paper
			sx={{ marginBottom: '1.5em', padding: '20px' }}
			elevation={2}
		>
			{ children }
		</Paper>

	);
}

export default Widget