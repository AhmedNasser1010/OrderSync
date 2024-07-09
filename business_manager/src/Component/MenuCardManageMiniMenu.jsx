import { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Switch from '@mui/material/Switch';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import { removeCategory, categoryVisibility, topCategory, removeItem, itemVisibility, topItem } from '../rtk/slices/menuSlice.js';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import { setSaveToCloudBtnStatus } from '../rtk/slices/conditionalValuesSlice';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { setDiscountDialog } from '../rtk/slices/conditionalValuesSlice'

const MenuCardManageMiniMenu = ({ item, buttonStyles, hovered = true, categoryOrItem }) => {
	const dispatch = useDispatch();
	const [expandMoreAnchorEl, setExpandMoreAnchorEl] = useState(null);
	const expandMore = Boolean(expandMoreAnchorEl);
	const [visibility, setVisibility] = useState(item?.visibility);
	const [topMenu, setTopMenu] = useState(item?.topMenu);
	const discountDialog = useSelector(state => state.conditionalValues.discountDialog)

	const handleOpenExpandMore = (event) => {
    setExpandMoreAnchorEl(event.currentTarget);
  }

	const handleCloseExpandMore = () => {
		setExpandMoreAnchorEl(null);
	}

	const handleCategoryVisibility = () => {
		const visibilityValue = !visibility;
		
		setVisibility(visibilityValue);
		categoryOrItem === 'category' && dispatch(categoryVisibility({ item, visibilityValue }));
		categoryOrItem === 'item' && dispatch(itemVisibility({ item, visibilityValue }));
		dispatch(setSaveToCloudBtnStatus('ON_CHANGES'));
	}

	const handleTopCategory = () => {
		const topMenuValue = !topMenu;
		
		setTopMenu(topMenuValue);
		categoryOrItem === 'category' && dispatch(topCategory({ item, topMenuValue }));
		categoryOrItem === 'item' && dispatch(topItem({ item, topMenuValue }));
		dispatch(setSaveToCloudBtnStatus('ON_CHANGES'));
	}

	const handleDiscountDialog = () => {
		dispatch(setDiscountDialog({ id: item.id, isOpen: true, type: categoryOrItem }))
	}

	const handleDelete = () => {
		handleCloseExpandMore();
		categoryOrItem === 'category' && dispatch(removeCategory(item));
		categoryOrItem === 'item' && dispatch(removeItem(item));
		dispatch(setSaveToCloudBtnStatus('ON_CHANGES'));
	}

	return (

		<div>
			<MoreVertIcon
				sx={{
					...buttonStyles,
					transform: hovered ? 'translateY(0)' : 'translateY(-5px)'
				}}
				onMouseUp={handleOpenExpandMore}
				aria-haspopup="true"
				aria-controls={expandMore ? 'basic-menu' : undefined}
				aria-expanded={expandMore ? 'true' : undefined}
			/>

			<Menu
				id="basic-menu"
				anchorEl={expandMoreAnchorEl}
				open={expandMore}
				onClose={handleCloseExpandMore}
				MenuListProps={{
	        'aria-labelledby': 'basic-button',
	      }}
			>

				<MenuItem onMouseUp={handleDelete}>
					<ListItemIcon>
						<DeleteIcon fontSize="small" />
					</ListItemIcon>
					<Typography>Delete</Typography>
				</MenuItem>


				{
					categoryOrItem !== "category" &&
						<MenuItem onMouseUp={handleDiscountDialog}>
							<ListItemIcon>
								<LocalOfferIcon fontSize="small" />
							</ListItemIcon>
							<Typography>Discount</Typography>
						</MenuItem>
				}

				<MenuItem onMouseUp={handleCategoryVisibility}>
					<Switch size="small" checked={visibility} sx={{ transform: 'translateX(-10px)' }} />
					<Typography sx={{ transform: 'translateX(-5px)' }}>Visibility</Typography>
				</MenuItem>

				<MenuItem onMouseUp={handleTopCategory}>
					<Switch size="small" checked={topMenu} sx={{ transform: 'translateX(-10px)' }} />
					<Typography sx={{ transform: 'translateX(-5px)' }}>Top Menu</Typography>
				</MenuItem>

				<MenuItem onMouseUp={handleCloseExpandMore}>
					<ListItemIcon>
						<ArrowBackIosIcon fontSize="small" />
					</ListItemIcon>
					<Typography>Close Menu</Typography>
				</MenuItem>

			</Menu>
			
		</div>


	);
}

export default MenuCardManageMiniMenu;