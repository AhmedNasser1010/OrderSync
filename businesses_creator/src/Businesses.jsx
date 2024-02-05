import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchBusinesses } from "./rtk/slices/businessesSlice.js";
import { fetchOrders } from "./rtk/slices/ordersSlice.js";

// Components
import BusinessesManagement from "./BusinessesManagement.jsx";
import BusinessesOrdersList from "./BusinessesOrdersList.jsx";
import BusinessesPendingOrders from "./BusinessesPendingOrders.jsx";
import PageTitle from "./Component/PageTitle";
import CustomTabPanel from "./Component/CustomTabPanel.jsx";

// fx
import fromKebabToTitle from "./function/fromKebabToTitle.js";

// MUI
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';


function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Restaurants = () => {
    const dispatch = useDispatch();
    const [value, setValue] = useState(0);
    const businesses = useSelector(status => status.businesses);


    // start get the needed data
    useEffect(() => {
        // #1 businesses
        dispatch(fetchBusinesses());

        // #2 businesses orders ID's
        let ordersIDs = [];

        businesses.map(business => {
            business.ordersIDs?.map(orderID => {

                ordersIDs.push(orderID);

            })
        });

        ordersIDs.length && dispatch(fetchOrders(ordersIDs));

    }, [])

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className="businesses">

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Management" {...a11yProps(0)} />
                    <Tab label="Orders List" {...a11yProps(1)} />
                    <Tab label="Pending Orders" {...a11yProps(2)} />
                </Tabs>
            </Box>

            <CustomTabPanel value={value} index={0}>
                <BusinessesManagement />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <BusinessesOrdersList />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <BusinessesPendingOrders />
            </CustomTabPanel>

        </div>
    )
}

export default Restaurants;