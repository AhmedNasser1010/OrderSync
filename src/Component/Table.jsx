import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Components
import TableRow from './TableRow.jsx';

function Table({ allowedKeys, colTitles, theme, data }) {
   const [rowItems, setRowItems] = useState([]);

	useEffect(() => {
		setRowItems(data)
	}, [data])

	return (

		<table className={`${theme}`}>
			<thead>
				<tr>
          		{ colTitles.map(head => (<th key={head}>{ head }</th>)) }
				</tr>
			</thead>
			<tbody>
				{ rowItems.map((item, index) => (<TableRow key={uuidv4()} rowItems={item} index={index} allowedKeys={allowedKeys} />)) }
			</tbody>
		</table>

	);
}

export default Table;