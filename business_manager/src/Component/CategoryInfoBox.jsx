import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import fromKebabToTitle from '../functions/fromKebabToTitle.js';
import Collapse from '@mui/material/Collapse';
import AddImageForm from './AddImageForm.jsx';
import Dialog from '@mui/material/Dialog';
import { setDisableMenuDnD } from '../rtk/slices/conditionalValuesSlice';
import { addNewCategoryBackgrounds } from '../rtk/slices/menuSlice.js'
import { useDispatch } from 'react-redux';
import { setSaveToCloudBtnStatus } from '../rtk/slices/conditionalValuesSlice';

const CategoryInfoBox = ({ item, background, hovered }) => {
	const dispatch = useDispatch();
	const [dialogVisibility, setDialogVisibility] = useState(false);

	const paperStyles = {
		width: '70px',
		height: '70px',
		borderRadius: '4px',
		backgroundColor: '#eee',
		overflow: 'hidden',
		border: !item?.backgrounds[0] && '2px dotted #bdbdbd',
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

	const handleDialogOpen = () => {
		setDialogVisibility(true);
		dispatch(setDisableMenuDnD(true));
	}

	const handleDialogClose = () => {
		setDialogVisibility(false);
		dispatch(setDisableMenuDnD(false));
	}

	const submitFunc = (values) => {
		dispatch(addNewCategoryBackgrounds({title: item.title, data: values}))
		dispatch(setSaveToCloudBtnStatus('ON_CHANGES'));
		return true;
	}

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

			<Paper sx={paperStyles} onMouseDown={handleDialogOpen}>
				
				<AddPhotoAlternateIcon sx={photoIconStyles} />
				{ item?.backgrounds[0] && <img src={item.backgrounds[0]} alt="category background" style={{ width: '100%', position: 'absolute' }} /> }

				<AddImageForm item={item} handleDialogClose={handleDialogClose} submitFunc={submitFunc} dialogVisibility={dialogVisibility} />
			
			</Paper>

			<Stack sx={{color: '#454545'}}>
				<Typography variant="h2" gutterBottom sx={{ fontSize: '24px', fontWeight: 'bold' }}>{ fromKebabToTitle(item?.title) }</Typography>
			</Stack>

		</Stack>

	);
}

export default CategoryInfoBox;