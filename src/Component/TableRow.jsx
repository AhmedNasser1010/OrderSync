import React from "react";

// Components
import BtnGroup from "./BtnGroup.jsx";

const TableRow = ({ rowItems, editBtn, readBtn, deleteBtn}) => {
	return (

		<tr className={`row-${rowItems.id}`}>
            {
                Object.values(rowItems).map(value => <th key={`${rowItems.id}+${value}`}>{ value }</th>)
            }
            { editBtn && readBtn && deleteBtn && <BtnGroup id={rowItems.id} editBtn={editBtn} readBtn={readBtn} deleteBtn={deleteBtn} /> }
		</tr>

	);
}

export default TableRow;