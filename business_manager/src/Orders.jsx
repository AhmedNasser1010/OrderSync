import { useState } from 'react';
import PageTitle from './Component/PageTitle';
import CustomTabPanel from './Component/CustomTabPanel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import RecievedOrders from './Component/RecievedOrders';
import OnGoingOrders from './Component/OnGoingOrders';
import InDeliveryOrders from './Component/InDeliveryOrders';
import CompletedOrders from './Component/CompletedOrders';


const Orders = () => {
	const [tabValue, setTabValue] = useState(0);

	const a11yProps = (index) => {
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,
		};
	}

	const handleChangeTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	return (

		<Box>

			<PageTitle title='Orders' />

			<Stack direction="row" sx={{ minHeight: 'calc(100vh - 75px)' }}>

				<Box sx={{ borderRight: 1, borderColor: 'divider' }}>
					<Tabs
						value={tabValue}
						onChange={handleChangeTabChange}
						orientation="vertical"
						variant='scrollable'
					>
						<Tab label="Recieved" {...a11yProps(0)} />
						<Tab label="On Going" {...a11yProps(1)} />
						<Tab label="In Delivery" {...a11yProps(2)} />
						<Tab label="Completed" {...a11yProps(3)} />
					</Tabs>
				</Box>

				<Box>
					<CustomTabPanel tabValue={tabValue} index={0}>
						<RecievedOrders />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={1}>
						<OnGoingOrders />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={2}>
						<InDeliveryOrders />
					</CustomTabPanel>
					<CustomTabPanel tabValue={tabValue} index={3}>
						<CompletedOrders />
					</CustomTabPanel>
				</Box>
				
			</Stack>

		</Box>

	);
}

export default Orders;