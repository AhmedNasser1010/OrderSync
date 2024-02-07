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
import { useSelector } from 'react-redux';

const Menu = () => {
	const categories = useSelector(state => state.menu.categories);
	const [indexes, setIndexes] = useState([]);

	// setup indexed from categories
	useEffect(() => {
		!indexes.length && setIndexes(prevIndexes => categories.map((item, i) => i + 1));
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

	return (

		<Box style={{ marginTop: '100px' }}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>

				<SortableContext items={indexes} strategy={verticalListSortingStrategy}>
					{indexes.map(index =>
						<SortableItem key={index} id={index} >
							<Category category={categories[index - 1]} />
						</SortableItem>
					)}
				</SortableContext>

			</DndContext>
		</Box>

	);
}

export default Menu;