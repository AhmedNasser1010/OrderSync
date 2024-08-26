import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import { IoIosClose, IoIosMenu } from "react-icons/io";

import { enableNavigationBar } from '../rtk/slices/conditionalValuesSlice';

// Components
import SideBarList from './SideBarList';

function SideBar() {
	const dispatch = useDispatch()

	const handleCloseMenu = () => {
		const sideBarRef = document.querySelector('.side-bar')
		sideBarRef.classList.remove('open')
	}
	const handleOpenMenu = () => {
		const sideBarRef = document.querySelector('.side-bar')
		sideBarRef.classList.add('open')
	}


	return (

		<div className="side-bar">
			<Link to="/" className="logo">Zajil<br/>Manager</Link>
			<IoIosClose
				className='exit-menu'
				onMouseUp={handleCloseMenu}
			/>
			<IoIosMenu
				className='menu-icon'
				onMouseUp={handleOpenMenu}
			/>
			<SideBarList handleCloseMenu={handleCloseMenu} />
		</div>

	);
}

export default SideBar;