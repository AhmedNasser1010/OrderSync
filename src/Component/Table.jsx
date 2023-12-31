import React, { useState, useEffect } from 'react';

// Components
import TableRow from './TableRow.jsx';

// API
import getItems from "../api/getItems.js"

function Table({ skipItems, endPoint, colTitles, theme, editBtn = true, readBtn = true, deleteBtn = true }) {
    const [rowItems, setRowItems] = useState([]);

	useEffect(() => {
		getItems(endPoint)
		.then(data => {
			
			if (skipItems) {
				data.map(item => {
					skipItems.map(skipItem => {
						delete item[skipItem]
					})
				})
			}

			setRowItems(data)
		})

	}, [])

	return (

		<table className={`${theme}`}>
			<thead>
				<tr>
                    {colTitles.map(head => (<th key={head}>{ head }</th>))}
				</tr>
			</thead>
			<tbody>
				{rowItems.map(item => (<TableRow key={item.id} rowItems={item} skipItems={skipItems} editBtn={editBtn} readBtn={readBtn} deleteBtn={deleteBtn} />))}
			</tbody>
		</table>

	);
}

export default Table;