import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import {
	arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
	DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import SortableItem from './SortableItem.jsx';

const CategoryBody = ({ category }) => {
	const items = useSelector(state => state.menu.items);
	const [filteredItems, setFilteredItems] = useState([]);
	const [indexes, setIndexes] = useState([1, 2, 3]);

	// setup filtered items by filter all items with spicific category
	useEffect(() => {
		setFilteredItems(prevItems => {
			items.filter(item => item.category === category)
		})
	}, [])

	// setup indexed from categories
	useEffect(() => {
		!indexes.length && setIndexes(prevIndexes => filteredItems?.map((item, i) => i + 1));
	}, [filteredItems])

	useEffect(() => {
		console.log(filteredItems);
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

	return (

		<Box
			sx={{
				height: '500px',
			}}
		>
			<SortableContext items={indexes} strategy={verticalListSortingStrategy}>
				{indexes?.map(index =>
					<SortableItem key={index} id={index} >
						<span>{ filteredItems[index - 1] }</span>
					</SortableItem>
				)}
			</SortableContext>
		</Box>

	);
}

export default CategoryBody;