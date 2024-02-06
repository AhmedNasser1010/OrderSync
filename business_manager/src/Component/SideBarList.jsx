import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { clearUser } from "../rtk/slices/userSlice.js";
// import { clearBusinesses } from "../rtk/slices/businessesSlice.js";

// Functions
import AUTH_signout from "../functions/AUTH_signout.js";

// Firebase
import { auth } from "../firebase.js";

const SideBarList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const handleSignout = () => {
        // dispatch(clearBusinesses());
        dispatch(clearUser());
        AUTH_signout();
        navigate("/login");
    }

    return (

        <ul>
            <li className="link"><Link to={auth.currentUser ? "/user" : "/login"}>User Profile</Link></li>
            <li className="link"><Link to={auth.currentUser ? "/menu" : "/menu"}>Menu Setup</Link></li>
            <li className="link" onClick={handleSignout}><Link to="/login">Logout</Link></li>
        </ul>

    )
}

export default SideBarList;