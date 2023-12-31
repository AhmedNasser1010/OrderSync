import React from "react";
import { Link } from "react-router-dom";

const SideBarList = () => {
    return (

        <ul>
            <li className="all-products link"><Link to="/">All Products</Link></li>
			<li className="categories link"><Link to="categories">Categories</Link></li>
        </ul>

    )
}

export default SideBarList;