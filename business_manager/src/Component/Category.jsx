import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import CategoryInfoBox from './CategoryInfoBox.jsx';
import CategoryButtonBox from './CategoryButtonBox.jsx';
import CategoryBody from './CategoryBody.jsx';

const Category = ({ category }) => {
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
		maxWidth: '80%',
	};

	return (

		<Paper
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onMouseDown={() => setMouseState('grabbing')}
			onMouseUp={() => setMouseState('grab')}
			sx={paperStyles}
		>
			<Stack direction='row' alignItems="center" justifyContent="space-between">

				<Stack direction='row' spacing={1} alignItems="center" justifyContent="space-between">
					<DragHandleIcon sx={{ color: '#454545', opacity: hovered ? '100%' : '0', transition: '0.3s' }} />
					<CategoryInfoBox title={category.title} description={category.description} background={category.background} hovered={hovered} />
				</Stack>

				<CategoryButtonBox hovered={hovered} handleExpanded={handleExpanded} expanded={expanded} />

			</Stack>

			<Collapse in={expanded}>
				<CategoryBody category={category.title} />
			</Collapse>

		</Paper>

	)
}

export default Category;