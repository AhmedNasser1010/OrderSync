import Stack from '@mui/material/Stack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ModeIcon from '@mui/icons-material/Mode';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CategoryButtonBox = ({ hovered, handleExpanded, expanded }) => {

	const buttonStyles = {
		cursor: 'pointer',
		color: '#454545',
		opacity: hovered ? '100%' : '0',
		transition: '0.3s',
		padding: '5px',
	}

	return (

		<Stack
			direction='row'
		>
			<MoreVertIcon sx={{...buttonStyles, transform: hovered ? 'translateY(0)' : 'translateY(-5px)',}} />
			<ModeIcon sx={{...buttonStyles, transform: hovered ? 'translateY(0)' : 'translateY(5px)',}} />
			<ExpandMoreIcon sx={{...buttonStyles, opacity: '100%', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'}} onMouseUp={handleExpanded} />
		</Stack>

	);
}

export default CategoryButtonBox;