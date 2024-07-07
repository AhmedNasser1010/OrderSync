import React from 'react';
import { Link } from "react-router-dom";


// Components
import SideBarList from './SideBarList';

function SideBar() {
	return (

		<div className="side-bar">
			<Link to="/" className="logo">Merro<br/>Restaurant</Link>
			<SideBarList />
		</div>

	);
}

export default SideBar;