import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchBusinesses } from "./rtk/slices/businessesSlice.js";

// Components
import Table from "./Component/Table.jsx";

const BusinessesManagement = () => {
	const [data, setData] = useState([]);
	const dispatch = useDispatch();
  	const businesses = useSelector((state) => state.businesses);

	useEffect(() => {
		dispatch(fetchBusinesses());
	}, [])

	return (

		<section className="businesses-management">
			<Link to="/Businesses/new" style={{color: "white", backgroundColor: "blue"}}>Add New Business</Link>
			<Table
				colTitles={["Index", "Industry Type", "Business Name"]}
				theme="styled-table"
				data={businesses}
				allowedKeys={["name", "industry"]}
			/>
		</section>

	)
}

export default BusinessesManagement;