import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const IconedTitle = ({ title, variant, icon, fontSize }) => {
	return (

		<Stack direction='row' alignItems='center'>
			{ icon }
			<Typography variant={variant} sx={{ fontSize: fontSize }}>{ title }</Typography>
		</Stack>

	);
}

export default IconedTitle;