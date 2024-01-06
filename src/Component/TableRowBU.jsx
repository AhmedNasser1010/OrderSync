import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

// Functions
import fromKebabToTitle from "../function/fromKebabToTitle.js";
import sortByKey from "../function/sortByKey";

const TableRow = ({ rowItems, index }) => {
	const navigate = useNavigate();
	const rowItemsSorted = sortByKey(rowItems);

	const handleOnClick = (path) => {
		navigate(`/businesses/${path}`);
	}

	useEffect(() => {
		console.log(rowItems)
	}, [])

	return (

		<tr className='row' style={{cursor: "pointer"}} onClick={() => handleOnClick(rowItems.businessName)}>
			<th>{ index + 1 }</th>
      {
        Object.values(rowItemsSorted).map(value => <th key={uuidv4()}>{ fromKebabToTitle(value) }</th>)
      }
		</tr>

	);
}

export default TableRow;