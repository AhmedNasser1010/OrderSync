import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	closestCenter,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableItem from './Component/SortableItem.jsx';
import MenuCard from './Component/MenuCard.jsx';
import reOrderArray from './functions/reOrderArray.js';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { useSelector, useDispatch } from 'react-redux';
import { addCategory, saveToCloud } from './rtk/slices/menuSlice.js';
import AddNewCategoryDialog from './Component/AddNewCategoryDialog';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import Typography from '@mui/material/Typography';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import { setSaveToCloudBtnStatus } from './rtk/slices/conditionalValuesSlice';

const Menu = () => {
	const [dialogVisibility, setDialogVisibility] = useState(false);
	const categories = useSelector(state => state.menu.categories);
	const disableMenuDnD = useSelector(state => state.conditionalValues.disableMenuDnD);
	const saveToCloudBtnStatus = useSelector(state => state.conditionalValues.saveToCloudBtnStatus);
	const dispatch = useDispatch();
	const [indexes, setIndexes] = useState([]);
	const [saveBtnStyles, setSaveBtnStyles] = useState({});

	// setup indexed from categories
	useEffect(() => {
		setIndexes(prevIndexes => categories.map((item, i) => i + 1));
	}, [categories])

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event) => {
		const {active, over} = event;
		
		if (over?.id && active.id !== over.id) {
			setIndexes((indexes) => {
				const oldIndex = indexes.indexOf(active.id);
				const newIndex = indexes.indexOf(over.id);
					
				 return arrayMove(indexes, oldIndex, newIndex);
			});
		 }
	}

	const handleDialogOpen = () => {
		setDialogVisibility(true);
	}

	const handleDialogClose = () => {
		setDialogVisibility(false);
	}

	const btnStyle = {
		backgroundColor: '#eee',
		borderColor: '#bdbdbd',
		color: '#454545',
		borderStyle: 'dotted',
		borderWidth: '2px',
		'&:hover': {
			borderColor: '#454545',
			borderStyle: 'dotted',
			borderWidth: '2px'
		}
	}

	const handleToCloudeBtnStart = () => {
		switch (saveToCloudBtnStatus) {
			case 'ON_SAVED':
				console.log('Start ON_SAVED');
				setSaveBtnStyles({
					label: 'saved',
					variant: 'contained',
					startIcon: <ChecklistRtlIcon />,
					disabled: true
				});
				break;
			case 'ON_CHANGES':
				console.log('Start ON_CHANGES');
				setSaveBtnStyles({
					label: 'save to the cloud',
					variant: 'contained',
					startIcon: <CloudUploadIcon />,
					disabled: false
				});
				break;
		}
	}

	const handleToCloudeBtnSave = () => {
		if (saveToCloudBtnStatus === 'ON_CHANGES') {
			dispatch(setSaveToCloudBtnStatus('ON_SAVED'));
			dispatch(saveToCloud());
		}
	}

	useEffect(() => {
		handleToCloudeBtnStart();
	}, [saveToCloudBtnStatus])

	return (

		<Box style={{ marginTop: '100px', marginBottom: '20px' }}>

			<Button
				sx={{ marginBottom: '10px', fontSize: '11px' }}
				onMouseUp={handleToCloudeBtnSave}
				{...saveBtnStyles}
			>
				{ saveBtnStyles?.label }
			</Button>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>

				<SortableContext items={indexes} strategy={verticalListSortingStrategy} disabled={disableMenuDnD}>
					{indexes.map((index, i) =>
						<SortableItem key={index} id={index} >
							<MenuCard item={categories[index - 1]} />
						</SortableItem>
					)}
				</SortableContext>

			</DndContext>

			<AddNewCategoryDialog dialogVisibility={dialogVisibility} handleDialogClose={handleDialogClose} />

			<Button
				variant="outlined"
				sx={btnStyle}
				startIcon={<PlaylistAddIcon />}
				onClick={handleDialogOpen}
			>
				Add New Category
			</Button>

		</Box>

	);
}

export default Menu;