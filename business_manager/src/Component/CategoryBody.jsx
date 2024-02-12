import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
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
import reOrderArray from '../functions/reOrderArray.js';
import SortableItem from './SortableItem.jsx';
import MenuNestedCard from './MenuNestedCard.jsx';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import fromKebabToTitle from '../functions/fromKebabToTitle.js';
import Button from '@mui/material/Button';
import { addItem } from '../rtk/slices/menuSlice.js';

const CategoryBody = ({ name }) => {
	const items = useSelector(state => state.menu.items);
	const [filteredItems, setFilteredItems] = useState([]);
	const [indexes, setIndexes] = useState([]);
	const dispatch = useDispatch();

	// setup filtered items by filter all items with spicific category
	useEffect(() => {
		let result = [];
		items.map(item => item.category === name && result.push(item));
		setFilteredItems(result);
	}, [items])

	// setup indexed from categories
	useEffect(() => {
		setIndexes(prevIndexes => filteredItems?.map((item, i) => i + 1));
	}, [filteredItems])

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

  const handleAddNewItem = () => {
  	const newItem = {
  		title: '',
  		description: '',
  		category: name,
  		price: 0,
  		backgrounds: [],
  		visibility: false,
  	}
  	dispatch(addItem(newItem))
  }

  const btnStyle = {
  	marginLeft: '3em',
  	marginBottom: '0.5em',
  	fontSize: '12px',
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

		<Box>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={indexes} strategy={verticalListSortingStrategy}>
					{indexes?.map((index, i) =>
						<SortableItem key={i} id={index} >
							<MenuNestedCard item={filteredItems[index - 1]} />
						</SortableItem>
					)}
				</SortableContext>
			</DndContext>
			<Button
				variant="outlined"
				sx={btnStyle}
				startIcon={<PlaylistAddIcon />}
				onMouseUp={handleAddNewItem}
			>
				Add New Item To { fromKebabToTitle(name) }
			</Button>
		</Box>

	);
}

export default CategoryBody;