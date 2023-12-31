import React from "react";
import { Link } from "react-router-dom";

// Components
import PageTitle from "./Component/PageTitle.jsx";
import Table from './Component/Table.jsx';


// Styles
import "./style/home.css";
import "./style/table.css";
import "./style/addProduct.css";
import "./style/sideBar.css";

function Home() {
	return (

		<div className="home">
			<PageTitle title="All Products" />
			<Link to="new" className="new-product">Add New Product</Link>
			<Table
				endPoint={"products"}
				colTitles={["ID", "Title", "Price", "Description", "Category", "Date", "Time", "Action"]}
				theme="styled-table"
				skipItems={["image"]}
			/>
		</div>

	);
}

export default Home;