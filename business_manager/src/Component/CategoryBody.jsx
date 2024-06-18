import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid'
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
import AddNewItemDialog from './AddNewItemDialog';
import { setDisableMenuDnD } from '../rtk/slices/conditionalValuesSlice';
import Box from '@mui/material/Box';

const CategoryBody = ({ name, categoryID }) => {
	const dispatch = useDispatch();
	const disableMenuDnD = useSelector(state => state.conditionalValues.disableMenuDnD);
	const items = useSelector(state => state.menu.items);
	const [filteredItems, setFilteredItems] = useState([]);
	const [indexes, setIndexes] = useState([]);
	const [dialogVisibility, setDialogVisibility] = useState(false);
	const convertedTitle = fromKebabToTitle(name);

	// setup filtered items by filter all items with spicific category
	useEffect(() => {
		let result = [];
		items.map(item => item.category === categoryID && result.push(item));
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
  	dispatch(setDisableMenuDnD(true));
  }

  const handleDialogClose = () => {
  	setDialogVisibility(false);
  	dispatch(setDisableMenuDnD(false));
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
				<SortableContext items={indexes} strategy={verticalListSortingStrategy} disabled={disableMenuDnD}>
					{indexes?.map((index, i) =>
						<SortableItem key={i} id={index} >
							<MenuNestedCard item={filteredItems[index - 1]} />
						</SortableItem>
					)}
				</SortableContext>
			</DndContext>

			<AddNewItemDialog
				dialogVisibility={dialogVisibility}
				handleDialogClose={handleDialogClose}
				initialValues={{ id: uuidv4(), timestamp: Date.now(), title: '', description: '', category: categoryID, price: '', backgrounds: ['', '', '', '', ''], visibility: false, topMenu: false }}
			/>

			<Button
				variant="outlined"
				sx={btnStyle}
				startIcon={<PlaylistAddIcon />}
				onMouseUp={handleDialogOpen}
			>
				Add New Item To { convertedTitle }
			</Button>
		</Box>

	);
}

export default CategoryBody;