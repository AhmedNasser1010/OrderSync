import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchBusinesses } from "./rtk/slices/businessesSlice.js";
import _testGet from "./function/_testGet.js";

// Components
import Table from "./Component/Table.jsx";

// MUI
import Box from '@mui/material/Box';

const BusinessesManagement = () => {
	const [data, setData] = useState([]);
	const dispatch = useDispatch();
  	const businesses = useSelector((state) => state.businesses);

	useEffect(() => {
		dispatch(fetchBusinesses());
	}, [])

	useEffect(() => {
		// _testGet("businesses", "8458a6fd-02e3-4100-9cbd-0d2a2dca0824_N3dokfBrsRbEJ8oF6pBmeQVUbwh");
	}, [])

	return (

		<Box>
			<Link to="/Businesses/new" style={{color: "white", backgroundColor: "blue"}}>Add New Business</Link>
			<Table
				colTitles={["Index", "Industry Type", "Business Name"]}
				theme="styled-table"
				data={businesses}
				allowedKeys={["name", "industry"]}
			/>
		</Box>

	)
}

export default BusinessesManagement;