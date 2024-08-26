import React from 'react';
import { Link } from "react-router-dom";


// Components
import SideBarList from './SideBarList';

function SideBar() {
	return (

		<div className="side-bar">
			<Link to="/" className="logo">Zajil<br/>Partner</Link>
			<SideBarList />
		</div>

	);
}

export default SideBar;