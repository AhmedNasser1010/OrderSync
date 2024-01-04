import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Components
import Table from "./Component/Table.jsx";

// Functions
import _getDoc from "./function/_getDoc.js";

const BusinessesManagement = () => {
	const [data, setData] = useState([])

	useEffect(() => {

		const fetchData = async () => {

			const result = await _getDoc("businesses");
			setData(result);

		}

		fetchData();

	}, [])

	return (

		<section className="businesses-management">
			<Link to="/Businesses/new" style={{color: "white", backgroundColor: "blue"}}>Add New Business</Link>
			<Table
				colTitles={["Index", "Business Name", "Industry Type"]}
				theme="styled-table"
				data={data}
				skipItems={["createdOn", "uid", "businessOwnerEmail"]}
			/>
		</section>

	)
}

export default BusinessesManagement;