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
import { addCategory } from './rtk/slices/menuSlice.js';
import AddNewCategoryDialog from './Component/AddNewCategoryDialog';

const Menu = () => {
	const [indexes, setIndexes] = useState([]);
	const [dialogVisibility, setDialogVisibility] = useState(false);
	const categories = useSelector(state => state.menu.categories);
	const disableMenuDnD = useSelector(state => state.conditionalValues.disableMenuDnD);
	const dispatch = useDispatch();

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

	return (

		<Box style={{ marginTop: '100px' }}>
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