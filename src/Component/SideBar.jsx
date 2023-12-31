import React from 'react';
import { Link } from "react-router-dom";


// Components
import SideBarList from './SideBarList';

function SideBar() {
	return (

		<div className="side-bar">
			<Link to="/" className="logo">Logo</Link>
			<SideBarList />
		</div>

	);
}

export default SideBar;