import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { HiOutlineDotsVertical } from "react-icons/hi";
import { GoDotFill, GoDot } from "react-icons/go"
import Typography from '@mui/material/Typography'
import useOnlineStatus from './hooks/useOnlineStatus'
import Menu from './Components/Menu'

const StyledHeader = styled.div`
	padding: 15px 20px;
	box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: white;
`
const Title = styled.h1``
const Icons = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
`

function Header() {
	const location = useLocation()
	const navigate = useNavigate()
	const isOnline = useOnlineStatus()
	const user = useSelector(state => state.user)
	const [pageTitle, setPageTitle] = useState("Home")
	const [onClickPath, setOnClickPath] = useState(null)
	const [enableOptionsMenu, setEnableOptionsMenu] = useState(false)
	
	useEffect(() => {
		const regex = /^\/queue\/\d+-\d+$/

		if (location.pathname === '/') {
			setPageTitle("Home")
			setOnClickPath('/queue')
		} else if (location.pathname === '/queue') {
			setPageTitle("Queue")
			setOnClickPath('/queue')
		} else if (regex.test(location.pathname)) {
			const orderId = location.pathname.split('/')[2].split('-')[0]
			setPageTitle(`Queue / ${orderId}`)
			setOnClickPath('/queue')
		} else if (location.pathname === '/order-qrscan') {
			setPageTitle("Scan")
			setOnClickPath('/queue')
		} else if (location.pathname === '/settings') {
			setPageTitle("Settings")
			setOnClickPath('/queue')
		} else if (location.pathname === '/financial-dues') {
			setPageTitle("Financial Dues")
			setOnClickPath('/queue')
		} else {
			setPageTitle("Not Found!")
			setOnClickPath('/queue')
		}

	}, [location.pathname])

	const handleOnClick = () => {
		if (onClickPath) {
			navigate(onClickPath)
		}
	}

	const handleEnableMenu = () => {
		setEnableOptionsMenu(true)
	}
	const handleDisableMenu = () => {
		setEnableOptionsMenu(false)
	}

	return (

		<>
		<StyledHeader>
			<Typography
				variant="h1"
				gutterBottom
				sx={{
					fontSize: 'xx-large',
    			fontWeight: '500',
    			color: '#474747',
    			marginBottom: '0',
    			cursor: 'pointer'
				}}
				onMouseUp={handleOnClick}
			>
        { pageTitle }
      </Typography>
			<Icons>
				{
					isOnline ?
					<GoDotFill style={{ fill: user.online.byUser && user.online.byManager && isOnline ? '#4caf50' : '#ff5722' }} />
					:
					<GoDot />
				}
				<HiOutlineDotsVertical
					style={{ fontSize: 'x-large', cursor: 'pointer' }}
					onMouseUp={handleEnableMenu}
				/>
			</Icons>
		</StyledHeader>
		<Menu
			enableOptionsMenu={enableOptionsMenu}
			handleEnableMenu={handleEnableMenu}
			handleDisableMenu={handleDisableMenu}
		/>
		</>

	)
}

export default Header