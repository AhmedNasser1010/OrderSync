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
import { addCategory, addMenu, categoryIndexesMove } from './rtk/slices/menuSlice.js';
import AddNewCategoryDialog from './Component/AddNewCategoryDialog';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import Typography from '@mui/material/Typography';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import { setSaveToCloudBtnStatus } from './rtk/slices/conditionalValuesSlice';
import _addDoc from './functions/_addDoc';
import AutorenewSharpIcon from '@mui/icons-material/AutorenewSharp';
import ErrorOutlineSharpIcon from '@mui/icons-material/ErrorOutlineSharp';
import DB_GET_DOC from './functions/DB_GET_DOC';
import MUIDialog from './Component/MUIDialog'
import DiscountDialog from './Component/DiscountDialog'
import { setDiscountDialog } from './rtk/slices/conditionalValuesSlice'
import PageTitle from './Component/PageTitle'

const Menu = () => {
	const dispatch = useDispatch();
	const [dialogVisibility, setDialogVisibility] = useState(false);
	const categories = useSelector(state => state.menu.categories);
	const menuValues = useSelector(state => state.menu);
	const disableMenuDnD = useSelector(state => state.conditionalValues.disableMenuDnD);
	const saveToCloudBtnStatus = useSelector(state => state.conditionalValues.saveToCloudBtnStatus);
	const user = useSelector(state => state.user);
	const [indexes, setIndexes] = useState([]);
	const [saveBtnStyles, setSaveBtnStyles] = useState({});
	const [menuValuesSnapshot, setMenuValuesSnapshot] = useState(menuValues);
	const [onceRun, setOnceRun] = useState(false);
	const discountDialog = useSelector(state => state.conditionalValues.discountDialog)

	// setup indexed from categories
	useEffect(() => {
		setIndexes(prevIndexes => categories ? categories.map((item, i) => i + 1) : []);
	}, [menuValues])

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

			setOnceRun(true);

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
				setSaveBtnStyles({
					label: 'saved',
					variant: 'contained',
					startIcon: <ChecklistRtlIcon />,
					disabled: true
				});
				break;
			case 'ON_CHANGES':
				setSaveBtnStyles({
					label: 'save to the cloud',
					variant: 'contained',
					startIcon: <CloudUploadIcon />,
					disabled: false
				});
				break;
			case 'ON_LOADING':
				setSaveBtnStyles({
					label: 'save to the cloud',
					variant: 'outlined',
					startIcon: <AutorenewSharpIcon sx={{ animation: 'spin 1s ease-in-out infinite' }} />,
					disabled: true,
				});
				break;
			case 'ON_ERROR':
				setSaveBtnStyles({
					label: 'error, try again',
					variant: 'contained',
					startIcon: <ErrorOutlineSharpIcon />,
					disabled: false,
					color: "error"
				});
				break;
		}
	}

	const handleToCloudeBtnSave = () => {
		if (saveToCloudBtnStatus === 'ON_CHANGES' || 'ON_ERROR') {

			dispatch(setSaveToCloudBtnStatus('ON_LOADING'));

			_addDoc('menus', menuValues, user.accessToken).then(res => {
				res === true && dispatch(setSaveToCloudBtnStatus('ON_SAVED'));
				res === undefined && dispatch(setSaveToCloudBtnStatus('ON_ERROR'));
			});

			// setTimeout(() => {
			// 	console.log(saveToCloudBtnStatus);
			// 	saveToCloudBtnStatus !== 'ON_SAVED' && dispatch(setSaveToCloudBtnStatus('ON_ERROR'));
			// 	return false;
			// }, 10000);

		}
	}

	// change the button status when there is any change in the value status
	useEffect(() => {
		handleToCloudeBtnStart();
	}, [saveToCloudBtnStatus])

	// check if the current menu compaier the last saved menu
	useEffect(() => {
		JSON.stringify(menuValues) === JSON.stringify(menuValuesSnapshot) && dispatch(setSaveToCloudBtnStatus('ON_SAVED'));
	}, [menuValues, menuValuesSnapshot])

	// handle when category indexes change
	// useEffect(() => {
	// 	console.log('move');
	// 	onceRun && dispatch(categoryIndexesMove(indexes));
	// 	setOnceRun(false);
	// }, [indexes, onceRun])

	return (

		<Box sx={{ marginTop: '20px' }}>

			<PageTitle title="Menu Setup" style={{ marginBottom: '50px' }} />

			<div style={{ margin: '0px 15px 20px 15px' }}>
				<Button
					sx={{ marginBottom: '10px', fontSize: '11px', transition: '0.3s' }}
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

					<SortableContext
						items={indexes}
						strategy={verticalListSortingStrategy}
						disabled={true}
						// disabled={disableMenuDnD}
					>
						{indexes?.map((index, i) =>
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

				<MUIDialog
					isOpen={discountDialog.isOpen}
					closeCallback={() => dispatch(setDiscountDialog({ id: '', isOpen: false, type: '' }))}
					title='Discount'
					description='Add discount to this item'
				>
					<DiscountDialog id={discountDialog.id} type={discountDialog.type} />
				</MUIDialog>
			</div>

		</Box>

	);
}

export default Menu;