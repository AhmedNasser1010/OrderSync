import { useState, useEffect } from 'react';
import { setDisableMenuDnD } from '../rtk/slices/conditionalValuesSlice';
import { useDispatch } from 'react-redux';
import ModeIcon from '@mui/icons-material/Mode';
import Stack from '@mui/material/Stack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuCardManageMiniMenu from './MenuCardManageMiniMenu.jsx';
import AddNewCategoryDialog from './AddNewCategoryDialog';

const CategoryButtonBox = ({ hovered, handleExpanded, expanded, item }) => {
	const dispatch = useDispatch();
	const [dialogVisibility, setDialogVisibility] = useState(false);

	const handleDialogOpen = () => {
		setDialogVisibility(true);
		dispatch(setDisableMenuDnD(true));
	}

	const handleDialogClose = () => {
		setDialogVisibility(false);
		dispatch(setDisableMenuDnD(false));
	}

	const buttonStyles = {
		cursor: 'pointer',
		color: '#454545',
		opacity: hovered ? '100%' : '0',
		transition: '0.3s',
		padding: '5px',
		fontSize: '30px'
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
			<ModeIcon sx={{...buttonStyles, transform: hovered ? 'translateY(0)' : 'translateY(5px)'}} onMouseUp={handleDialogOpen} />
			<ExpandMoreIcon sx={{...buttonStyles, opacity: '100%', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'}} onMouseUp={handleExpanded} />

			<AddNewCategoryDialog dialogVisibility={dialogVisibility} handleDialogClose={handleDialogClose} initialValues={item} />

		</Stack>

	);
}

export default CategoryButtonBox;