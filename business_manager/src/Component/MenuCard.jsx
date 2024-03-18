import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CategoryInfoBox from './CategoryInfoBox.jsx';
import CategoryButtonBox from './CategoryButtonBox.jsx';
import CategoryBody from './CategoryBody.jsx';
import Box from '@mui/material/Box';

const MenuCard = ({ item }) => {
	const [mouseState, setMouseState] = useState('grab');
	const [hovered, setHovered] = useState(false);
	const [expanded, setExpanded] = useState(false);

	const handleExpanded = () => {
		setExpanded(!expanded);
	}

	const paperStyles = {
		cursor: mouseState,
		marginBottom: '1em',
		padding: '20px 15px 20px 10px',
	};

	return (

		<Box sx={{ maxWidth: '600px', opacity: item?.visibility ? '100%' : '60%' }}>
			<Paper
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				onMouseDown={() => setMouseState('grabbing')}
				onMouseUp={() => setMouseState('grab')}
				sx={paperStyles}
			>
				<Stack direction='row' alignItems="center" justifyContent="space-between">

					<Stack direction='row' spacing={1} alignItems="center" justifyContent="space-between">
						<DragIndicatorIcon sx={{ color: '#454545', opacity: hovered ? '100%' : '0', transition: '0.3s' }} />
						<CategoryInfoBox item={item} description={item?.description} background={item?.background} hovered={hovered} />
					</Stack>

					<CategoryButtonBox hovered={hovered} handleExpanded={handleExpanded} expanded={expanded} item={item} />

				</Stack>


			</Paper>
			<Collapse in={expanded}>
				<CategoryBody name={item?.title} />
			</Collapse>
		</Box>

	)
}

export default MenuCard;