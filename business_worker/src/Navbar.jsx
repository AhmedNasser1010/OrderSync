import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Tab from '@mui/material/Tab'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'

const Nav = styled.div`
	position: fixed;
	bottom: 0;
	left: 0;
	width: calc(100% - 10px);
	padding: 5px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2rem;
	box-shadow: rgb(100 100 111 / 27%) 0px 7px 29px 0px;
`

function Navbar() {
	const navigate = useNavigate()
	const [selected, setSelected] = useState('queue')

	return (

		<Nav>
			<Tab
				icon={<ReceiptLongRoundedIcon />}
				label="Queue"
				sx={{ color: selected === 'queue' && 'blue' }}
				onMouseUp={() => {
					setSelected('queue')
					navigate('/queue')
				}}
			/>
			<Tab
				icon={<SettingsRoundedIcon />}
				label="Settings"
				sx={{ color: selected === 'settings' && 'blue' }}
				onMouseUp={() => {
					setSelected('settings')
					navigate('/settings')
				}}
			/>
		</Nav>

	)
}

export default Navbar