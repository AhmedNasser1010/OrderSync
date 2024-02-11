import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import fromKebabToTitle from '../functions/fromKebabToTitle.js';
import Collapse from '@mui/material/Collapse';

const MenuNestedCardInfoBox = ({ title, background, description, hovered }) => {

	const paperStyles = {
		width: '55px',
		height: '55px',
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
			spacing={1}
			alignItems="center"
			sx={{
				transition: '0.3s',
				transform: hovered ? 'translateX(-5px)' : 'translateX(-20px)',
			}}
		>

			<Paper sx={paperStyles}>
			<AddPhotoAlternateIcon sx={photoIconStyles} />
			{ background && <img src={background} alt="category background" style={{ width: '100%', position: 'absolute' }} /> }
			</Paper>

			<Stack sx={{color: '#454545'}}>
				<Typography variant="h3" gutterBottom sx={{ fontSize: '16px', fontWeight: 'bold' }}>{ fromKebabToTitle(title) }</Typography>
				<Typography variant="body2" gutterBottom sx={{ maxWidth: '90%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#4a4a4a', fontSize: '12px' }}>{ description }</Typography>
			</Stack>

		</Stack>

	);
}

export default MenuNestedCardInfoBox;