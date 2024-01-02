import { Link, useNavigate } from "react-router-dom";

// Functions
import authSignOut from "../function/authSignOut.js";

// Firebase
import { auth } from "../firebase.js";

const SideBarList = () => {
    const navigate = useNavigate();
    
    const signOutMethod = () => {
        authSignOut();
        navigate("/login");
    }

    return (

        <ul>
            <li className="link"><Link to={auth.currentUser ? "/user" : "/login"}>User Profile</Link></li>
            <li className="link"><Link to={auth.currentUser ? "/" : "/login"}>Overview</Link></li>
            <li className="link"><Link to={auth.currentUser ? "/performance" : "/login"}>Performance</Link></li>
            <li className="link"><Link to={auth.currentUser ? "/restaurants" : "/login"}>Restaurants</Link></li>
            <li className="link" onClick={signOutMethod}><Link to="/login">Logout</Link></li>
        </ul>

    )
}

export default SideBarList;