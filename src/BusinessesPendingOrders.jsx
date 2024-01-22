import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "./rtk/slices/ordersSlice.js";

// MUI
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const BusinessesPendingOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(status => status.orders);
  const businesses = useSelector(status => status.businesses);

  useEffect(() => {
    let ids = [];

    businesses.map(business => {

      business.ordersIDs.map(orderID => {

        ids.push(orderID);

      })

    });

  dispatch(fetchOrders(ids));

  }, [businesses]);

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="right">ID</TableCell>
              <TableCell align="right">Cart</TableCell>
              <TableCell align="right">Total (USD)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order, index) => {
              if (order.status === "RECEIVED") {
                return <TableRow key={order.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align="right">{index+1}</TableCell>
                    <TableCell align="right">{order.cart.map(item => item.name + ", ")}</TableCell>
                    <TableCell align="right">{order.paymentInfo.totalOrderAmount}</TableCell>
                </TableRow>
            }})}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default BusinessesPendingOrders;