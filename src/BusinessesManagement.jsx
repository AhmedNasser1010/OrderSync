import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';

// MUI
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import TuneIcon from '@mui/icons-material/Tune';

const BusinessesManagement = () => {
  const businesses = useSelector((state) => state.businesses);

	return (

		<Box>
			<Link to="/Businesses/new">
				<Button variant="contained">
					Add New Business
      	</Button>	
			</Link>
      <TableContainer component={Paper}>
      	<Table sx={{ minWidth: 650 }} aria-label="simple table">
	      	<TableHead>
	      		<TableRow>
	      			<TableCell>Index</TableCell>
	      			<TableCell>Industry Type</TableCell>
	      			<TableCell>Business Name</TableCell>
	      			<TableCell>Settings</TableCell>
	      		</TableRow>
	      	</TableHead>
	      	<TableBody>
	      		{
	      			businesses.map((business, index) => (
	      				<TableRow
	      					key={index}
	      					sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
	      					>
	      					<TableCell>{ index + 1 }</TableCell>
	      					<TableCell>{ business.business.industry }</TableCell>
	      					<TableCell>{ business.business.name }</TableCell>
	      					<TableCell><Link to={`/businesses/${business.accessToken}`}><TuneIcon sx={{ cursor: 'pointer' }} /></Link></TableCell>
	      				</TableRow>
	      			))
	      		}
	      	</TableBody>
      	</Table>
      </TableContainer>
		</Box>

	)
}

export default BusinessesManagement;