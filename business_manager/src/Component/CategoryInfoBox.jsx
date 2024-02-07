import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import fromKebabToTitle from '../functions/fromKebabToTitle.js';
import Collapse from '@mui/material/Collapse';

const CategoryInfoBox = ({ title, background, description, hovered }) => {

	const paperStyles = {
		width: '75px',
		height: '75px',
		borderRadius: '4px',
		backgroundColor: '#eee',
		overflow: 'hidden',
		border: !background && '2px dotted #bdbdbd',
		cursor: 'pointer',
		position: 'relative',
	};

	const photoIconStyles = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		color: '#bdbdbd'
	};

	return (

		<Stack
			direction='row'
			spacing={2}
			alignItems="center"
			sx={{
				transition: '0.3s',
				transform: hovered ? 'translateX(0)' : 'translateX(-1.5em)',
			}}
		>

			<Paper sx={paperStyles}>
			<AddPhotoAlternateIcon sx={photoIconStyles} />
			{ background && <img src={background} alt="category background" style={{ width: '100%', position: 'absolute' }} /> }
			</Paper>

			<Stack sx={{color: '#454545'}}>
				<Typography variant="h2" gutterBottom sx={{ fontSize: '24px', fontWeight: 'bold' }}>{ fromKebabToTitle(title) }</Typography>
				<Collapse in={hovered}>
					<Typography variant="body2" gutterBottom>{ description }</Typography>
				</Collapse>
			</Stack>

		</Stack>

	);
}

export default CategoryInfoBox;