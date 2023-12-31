import React from "react";

// Components
import BtnGroup from "./BtnGroup.jsx";

const TableRow = ({ rowItems }) => {
	return (

		<tr className={`row-${rowItems.id}`}>
            {
                Object.values(rowItems).map(value => <th key={`${rowItems.id}+${value}`}>{ value }</th>)
            }
            <BtnGroup id={rowItems.id} />
		</tr>

	);
}

export default TableRow;