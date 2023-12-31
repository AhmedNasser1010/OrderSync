import React from "react";
import { Link } from "react-router-dom";

const SideBarList = () => {
    return (

        <ul>
            <li className="link"><Link to="/user">User Profile</Link></li>
            <li className="link"><Link to="/">Overview</Link></li>
            <li className="link"><Link to="/performance">Performance</Link></li>
            <li className="link"><Link to="/restaurants">Restaurants</Link></li>
            <li className="link"><Link to="/login">Logout</Link></li>


        </ul>

    )
}

export default SideBarList;