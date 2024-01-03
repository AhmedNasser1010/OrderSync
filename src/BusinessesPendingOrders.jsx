import React from "react";

// Components
import Table from "./Component/Table.jsx";

const BusinessesPendingOrders = () => {
    return (
        <section className="businesses-pending-orders">
            <Table
                endPoint={"categories"}
				colTitles={["ID", "Title"]}
				theme="styled-table"
				skipItems={["image"]}
                deleteBtn={false}
                readBtn={false}
                editBtn={false}
            />
        </section>
    )
}

export default BusinessesPendingOrders;