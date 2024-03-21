import { useState, useEffect } from 'react';
import ModeIcon from '@mui/icons-material/Mode';
import Stack from '@mui/material/Stack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuCardManageMiniMenu from './MenuCardManageMiniMenu.jsx';

const CategoryButtonBox = ({ hovered, handleExpanded, expanded, item }) => {

	const handleEdit = () => {
		console.log('handleEdit: CategoryButtonBox.jsx 10:5');
	}

	const buttonStyles = {
		cursor: 'pointer',
		color: '#454545',
		opacity: hovered ? '100%' : '0',
		transition: '0.3s',
		padding: '5px',
	};

	return (

		<Stack
			direction='row'
		>

			<MenuCardManageMiniMenu
				item={item}
				buttonStyles={buttonStyles}
				hovered={hovered}
				categoryOrItem='category'
			/>
			<ModeIcon sx={{...buttonStyles, transform: hovered ? 'translateY(0)' : 'translateY(5px)'}} onMouseUp={handleEdit} />
			<ExpandMoreIcon sx={{...buttonStyles, opacity: '100%', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'}} onMouseUp={handleExpanded} />

		</Stack>

	);
}

export default CategoryButtonBox;