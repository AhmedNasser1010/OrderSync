// React Router
import { Link } from "react-router-dom";

// Redux
import { useDispatch } from "react-redux";
import { clearUser } from '../rtk/slices/userSlice'
import { clearMenu } from '../rtk/slices/menuSlice'

// Firebase
import { auth } from "../firebase.js";

const SideBarList = () => {
	const dispatch = useDispatch();

	return (

		<ul style={{ display: 'block', height: '100%' }}>
			{/*<li className="link"><Link to={auth.currentUser ? "/user" : "/login"}>User Profile</Link></li>*/}
			<li className="link"><Link to={auth.currentUser ? "/orders" : "/login"}>Orders</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/staff" : "/login"}>Staff</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/menu" : "/login"}>Menu Setup</Link></li>
			<li className="link"><Link to={auth.currentUser ? "/settings" : "/login"}>Settings</Link></li>
		</ul>

	)
}

export default SideBarList;