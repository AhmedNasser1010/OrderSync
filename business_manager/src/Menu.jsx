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

const Menu = () => {
	const categories = useSelector(state => state.menu.categories);
	const [indexes, setIndexes] = useState([]);
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
    
    if (active.id !== over.id) {
      setIndexes((indexes) => {
        const oldIndex = indexes.indexOf(active.id);
        const newIndex = indexes.indexOf(over.id);
        
        return arrayMove(indexes, oldIndex, newIndex);
      });
    }
  }

  const handleAddNewCategory = () => {
  	const newCategory = {
  		title: 'new',
  		description: '',
  		background: '',
  		visibility: false,
  	}
  	dispatch(addCategory(newCategory));
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

				<SortableContext items={indexes} strategy={verticalListSortingStrategy}>
					{indexes.map((index, i) =>
						<SortableItem key={index} id={index} >
							<MenuCard item={categories[index - 1]} />
						</SortableItem>
					)}
				</SortableContext>

			</DndContext>

			<Button
				variant="outlined"
				sx={btnStyle}
				startIcon={<PlaylistAddIcon />}
				onClick={handleAddNewCategory}
			>
				Add New Category
			</Button>

		</Box>

	);
}

export default Menu;