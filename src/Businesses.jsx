import React, { useState } from "react";

// Components
import Tab from "./Component/Tab";
import BusinessesManagement from "./BusinessesManagement.jsx";
import BusinessesOrdersList from "./BusinessesOrdersList.jsx";
import BusinessesPendingOrders from "./BusinessesPendingOrders.jsx";
import PageTitle from "./Component/PageTitle";

// fx
import fromKebabToTitle from "./function/fromKebabToTitle.js";


const Restaurants = () => {
    const [currentTab, setCurrentTab] = useState("");

    const setCurrentTabState = (value) => {
        setCurrentTab(value);
    }

    return (
        <div className="businesses">
            <PageTitle title={`Businesses - ${fromKebabToTitle(currentTab)}`} />

            <Tab
                setCurrentTabState={setCurrentTabState}
                tabs={[
                    {path: "management", title: "Management"},
                    {path: "orders-list", title: "Orders list"},
                    {path: "pending-orders", title: "Pending orders"}
            ]} />

            <hr />

            { currentTab === "management" && <BusinessesManagement /> }
            { currentTab === "orders-list" && <BusinessesOrdersList /> }
            { currentTab === "pending-orders" && <BusinessesPendingOrders /> }
        </div>
    )
}

export default Restaurants;