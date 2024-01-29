import { useState, useEffect } from "react";
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

import _getSubcollections from "./function/_getSubcollections.js"

const BusinessesOrdersList = () => {
  const dispatch = useDispatch();
  const orders = useSelector(status => status.orders);
  const businesses = useSelector(status => status.businesses);
  const [orderLoading, setOrderLoading] = useState(true);

  useEffect(() => {
    let ids = [];

    businesses.map(business => {

      business.ordersIDs.map(orderID => {

        ids.push(orderID);

      })

    });

  dispatch(fetchOrders(ids));

  }, [businesses]);

  useEffect(() => {
    console.log(orders);
    if (orders.length === 0) {
      setOrderLoading(true);
    } else {
      setOrderLoading(false);
    }
  }, [orders])

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cart</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total (USD)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderLoading ? <TableRow><TableCell>Loading...</TableCell></TableRow> : orders[0].list.map((order, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{index+1}</TableCell>
                <TableCell>{order.cart.map(item => item.name + ", ")}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.payment.totalAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default BusinessesOrdersList;