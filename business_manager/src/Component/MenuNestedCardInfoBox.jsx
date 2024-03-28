import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import fromKebabToTitle from '../functions/fromKebabToTitle.js';
import Collapse from '@mui/material/Collapse';
import AddImageForm from './AddImageForm.jsx';
import Dialog from '@mui/material/Dialog';
import { useDispatch } from 'react-redux';
import { addNewItemBackgrounds } from '../rtk/slices/menuSlice';
import { setDisableMenuDnD } from '../rtk/slices/conditionalValuesSlice';
import { setSaveToCloudBtnStatus } from '../rtk/slices/conditionalValuesSlice';

const MenuNestedCardInfoBox = ({ item, hovered }) => {
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

	const submitFunc = (values) => {
		dispatch(addNewItemBackgrounds({title: item.title, data: values}))
		dispatch(setSaveToCloudBtnStatus('ON_CHANGES'));
		return true;
	}

	const paperStyles = {
		width: '55px',
		height: '55px',
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

			<Paper sx={paperStyles} onMouseDown={handleDialogOpen}>
				<AddPhotoAlternateIcon sx={photoIconStyles} />
				{ item?.backgrounds[0] && <img src={item.backgrounds[0]} alt="category background" style={{ width: '100%', position: 'absolute' }} /> }

				<AddImageForm item={item} handleDialogClose={handleDialogClose} submitFunc={submitFunc} dialogVisibility={dialogVisibility} />

			</Paper>

			<Stack sx={{color: '#454545'}}>
				<Typography variant="h3" gutterBottom sx={{ fontSize: '16px', fontWeight: 'bold' }}>{ fromKebabToTitle(item?.title) }</Typography>
				<Typography variant="body2" gutterBottom sx={{ maxWidth: '90%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#4a4a4a', fontSize: '12px' }}>{ item?.description }</Typography>
			</Stack>

		</Stack>

	);
}

export default MenuNestedCardInfoBox;