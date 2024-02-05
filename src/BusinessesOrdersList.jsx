import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

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
  const orders = useSelector(status => status.orders);
  const [orderLoading, setOrderLoading] = useState(true);

  useEffect(() => {
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
            {orders[0]?.list.map((order, index) => (
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