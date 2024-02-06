import { useState, useEffect } from 'react';
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
import SortableItem from './Component/SortableItem.jsx';
import Category from './Component/Category.jsx';
import reOrderArray from './functions/reOrderArray.js';

const Menu = () => {
	const [items, setItems] = useState([{name: 'Ahmed'}, {name: 'Nasser'}, {name: 'Abd-Elhamed'}]);
	const [indexes, setIndexes] = useState([]);

	// setup indexed from items
	useEffect(() => {
		!indexes.length && setIndexes(prevIndexes => items.map((item, i) => i + 1));
	}, [items])

	// useEffect(() => {
	// 	console.log('indexes', indexes);
	// 	console.log('items', items);
	// }, [indexes, items])

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

		<Box>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>

      	<SortableContext items={indexes} strategy={verticalListSortingStrategy}>
        	{indexes.map(index =>
        		<SortableItem key={index} id={index} >
        			<Category item={items[index - 1]} />
        		</SortableItem>
        	)}
      	</SortableContext>

    	</DndContext>
		</Box>

	);
}

export default Menu;