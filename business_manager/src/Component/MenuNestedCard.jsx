import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setDisableMenuDnD } from '../rtk/slices/conditionalValuesSlice';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import MenuCardManageMiniMenu from './MenuCardManageMiniMenu.jsx';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MenuNestedCardInfoBox from './MenuNestedCardInfoBox.jsx';
import ModeIcon from '@mui/icons-material/Mode';
import AddNewItemDialog from './AddNewItemDialog';

const MenuNestedCard = ({ item }) => {
	const dispatch = useDispatch();
	const [mouseState, setMouseState] = useState('grab');
	const [hovered, setHovered] = useState(false);
	const [dialogVisibility, setDialogVisibility] = useState(false);

	const paperStyles = {
		cursor: mouseState,
		margin: '0em 0em 0.5em 3em',
		padding: '10px 5px',
	};

	const buttonStyles = {
		cursor: 'pointer',
		color: '#454545',
		opacity: hovered ? '100%' : '0',
		transition: '0.3s',
		padding: '5px',
	};

	const handleDialogOpen = () => {
		setDialogVisibility(true);
		dispatch(setDisableMenuDnD(true));
	}

	const handleDialogClose = () => {
		setDialogVisibility(false);
		dispatch(setDisableMenuDnD(false));
	}

	const fromDiscountCodeToText = () => {
		let symbol = ""
		const value = item.discount.code.split('-')[1]

		switch (item.discount.code.split('-')[0]) {
			case 'P':
				symbol = '%'
				break
			case 'FIXED':
				symbol = 'ج.م'
				break
			default:
				symbol = ''
				break
		}

		return `${value}${symbol}`
	}

	return (

		<Paper
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onMouseDown={() => setMouseState('grabbing')}
			onMouseUp={() => setMouseState('grab')}
			sx={{...paperStyles, opacity: item?.visibility ? '100%' : '60%'}}
			elevation={2}
		>
			<Stack direction='row' alignItems="center" justifyContent="space-between">

				<Stack direction='row' spacing={1} alignItems="center" justifyContent="space-between">
					<DragIndicatorIcon sx={{ color: '#454545', opacity: hovered ? '100%' : '0', transition: '0.3s', fontSize: '16px' }} />
					<MenuNestedCardInfoBox item={item} hovered={hovered} />
				</Stack>

				<Stack
					direction='row'
					alignItems="center"
				>
					<MenuCardManageMiniMenu
						item={item}
						buttonStyles={buttonStyles}
						hovered={hovered}
						categoryOrItem='item'
					/>

					<ModeIcon sx={{...buttonStyles, transform: hovered ? 'translateY(0)' : 'translateY(5px)', fontSize: '16px'}} onMouseUp={handleDialogOpen} />
					<AddNewItemDialog
						dialogVisibility={dialogVisibility}
						handleDialogClose={handleDialogClose}
						initialValues={item}
					/>

					{
						item?.discount ?
							<Stack direction='row' spacing={1}>
								<span style={{ color: '#ef8e00', fontSize: '12px' }}>{ fromDiscountCodeToText() }</span>
								<span style={{ color: '#4a4a4a', fontSize: '12px' }}>{ Number(item?.price) }ج.م</span>
							</Stack>
						:
							<span style={{ color: '#4a4a4a', fontSize: '12px' }}>{ Number(item?.price) }ج.م</span>
					}

				</Stack>

			</Stack>

		</Paper>

	)
}

export default MenuNestedCard;