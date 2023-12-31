import React from "react";
import { Link } from "react-router-dom";

// Components
import Table from "./Component/Table.jsx";

const RestaurantsManagement = () => {

    return (

        <section className="RestaurantsManagement">
            <Link to="/restaurants/new" style={{color: "white", backgroundColor: "blue"}}>Add New Restaurant</Link>
            <Table
                endPoint={"products"}
				colTitles={["ID", "Title", "Price", "Description", "Category", "Date", "Time", "Action"]}
				theme="styled-table"
				skipItems={["image"]}
            />
        </section>

    )
}

export default RestaurantsManagement;