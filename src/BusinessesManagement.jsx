import React from "react";
import { Link } from "react-router-dom";

// Components
import Table from "./Component/Table.jsx";

const BusinessesManagement = () => {

    return (

        <section className="businesses-management">
            <Link to="/Businesses/new" style={{color: "white", backgroundColor: "blue"}}>Add New Business</Link>
            <Table
                endPoint={"products"}
				colTitles={["ID", "Title", "Price", "Description", "Category", "Date", "Time", "Action"]}
				theme="styled-table"
				skipItems={["image"]}
            />
        </section>

    )
}

export default BusinessesManagement;