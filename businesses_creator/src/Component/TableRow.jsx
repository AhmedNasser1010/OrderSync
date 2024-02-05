import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

// Functions
import fromKebabToTitle from "../function/fromKebabToTitle.js";
import sortByKey from "../function/sortByKey";

const TableRow = ({ rowItems, index, allowedKeys }) => {
	const navigate = useNavigate();
	const [filtered, setFiltered] = useState({})

	const handleOnClick = (path) => {
		navigate(`/businesses/${path}`);
	}

	useEffect(() => {
		let result = {};

		Object.entries(rowItems.business).map(([key, value]) => {

      allowedKeys.map(allowedKey => {

        if (allowedKey === key) {
        	result[key] = value;
        }

      })

    })

    setFiltered(sortByKey(result))

	}, [])

	return (

		<tr className='row' style={{cursor: "pointer"}} onClick={() => handleOnClick(rowItems.accessToken)}>
			<th>{ index + 1 }</th>
      {
      	Object.values(filtered).map(value => <th key={uuidv4()}>{ fromKebabToTitle(value) }</th>)
      }
		</tr>

	);
}

export default TableRow;