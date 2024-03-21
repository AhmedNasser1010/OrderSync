import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import MenuCardManageMiniMenu from './MenuCardManageMiniMenu.jsx';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MenuNestedCardInfoBox from './MenuNestedCardInfoBox.jsx';
import ModeIcon from '@mui/icons-material/Mode';

const MenuNestedCard = ({ item }) => {
	const [mouseState, setMouseState] = useState('grab');
	const [hovered, setHovered] = useState(false);

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
					<ModeIcon sx={{...buttonStyles, transform: hovered ? 'translateY(0)' : 'translateY(5px)', fontSize: '16px'}} />
					{/* bro don't forget to get the currency from the business data instead of the static value */}
					<span style={{ color: '#4a4a4a', fontSize: '12px' }}>{ Number(item?.price).toFixed(2) } USD</span>

				</Stack>

			</Stack>

		</Paper>

	)
}

export default MenuNestedCard;