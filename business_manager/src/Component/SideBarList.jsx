// React Router
import { Link } from "react-router-dom";

// Redux
import { useDispatch } from "react-redux";
import { clearUser } from '../rtk/slices/userSlice'
import { clearMenu } from '../rtk/slices/menuSlice'

// Firebase
import { auth } from "../firebase.js";

const SideBarList = ({ handleCloseMenu }) => {
	const dispatch = useDispatch();

	return (

		<ul style={{ display: 'block', height: '100%' }}>
			{/*<li className="link"><Link to={auth.currentUser ? "/user" : "/login"} onMouseUp={handleCloseMenu}>User Profile</Link></li>*/}
			<li className="link"><Link to={auth.currentUser ? "/orders" : "/login"} onMouseUp={handleCloseMenu}>Orders</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/staff" : "/login"} onMouseUp={handleCloseMenu}>Staff</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/menu" : "/login"} onMouseUp={handleCloseMenu}>Menu Setup</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/settings" : "/login"} onMouseUp={handleCloseMenu}>Settings</Link></li>
		</ul>

	)
}

export default SideBarList;