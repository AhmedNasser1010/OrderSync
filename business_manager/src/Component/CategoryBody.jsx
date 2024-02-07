import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableItem from './SortableItem.jsx';
import { v4 as uuidv4 } from 'uuid';

const CategoryBody = ({ category }) => {
	const items = useSelector(state => state.menu.items);
	const [filteredItems, setFilteredItems] = useState([]);
	const [indexes, setIndexes] = useState([]);
	const uuid = uuidv4();

	// setup filtered items by filter all items with spicific category
	useEffect(() => {
		let result = [];
		items.map(item => item.category === category && result.push(item));
		setFilteredItems(result);
	}, [items])

	// setup indexed from categories
	useEffect(() => {
		!indexes.length && setIndexes(prevIndexes => filteredItems?.map((item, i) => i + 1 + uuid));
	}, [filteredItems])

	useEffect(() => {
		console.log(indexes)
	}, [indexes])

	return (

		<Box
			sx={{
			}}
		>
			<SortableContext items={indexes} strategy={verticalListSortingStrategy}>
				{indexes?.map((index, i) =>
					<SortableItem key={index} id={index} >
						<span>{ filteredItems[i].title }</span>
					</SortableItem>
				)}
			</SortableContext>
		</Box>

	);
}

export default CategoryBody;