import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components'
import priceAfterDiscount from '../functions/priceAfterDiscount';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

const MoreDetails = styled.div`
	padding: 5px 0;
`
const MoreDetailsFlexBox = styled.div`
	display: flex;
	flex-wrap: wrap;
`
const MoreDetailsItem = styled.div`
	width: 50%;
`

const collapsHeadCells = [
	{
		id: 'index',
		numeric: false,
		label: '#',
	},
	{
		id: 'name',
		numeric: false,
		label: 'Name',
	},
	{
		id: 'size',
		numeric: false,
		label: 'Size',
	},
	{
		id: 'amount',
		numeric: false,
		label: 'Amount',
	},
	{
		id: 'pricePer',
		numeric: false,
		label: 'Price Per',
	},
	{
		id: 'subtotal',
		numeric: false,
		label: 'Subtotal',
	},
];

const CustomCollapsedTableRow = ({ isOpen, row }) => {
	const orders = useSelector(state => state.orders.open);
	const menuItems = useSelector(state => state.menu?.items)
	const [cart, setCart] = useState([]);
	const [fullOrderDetails, setFullOrderDetails] = useState(null)

	useEffect(() => {
		orders.map(order => {if (order.id === row.id) setFullOrderDetails(order)})
	}, [row])

	useEffect(() => {
		// get cart
		let cart
		orders.map(order => {if (order.id === row.id) return cart = order.cart})

		// get cart items
		let items = []
		menuItems?.map(menuItem => {
			cart?.map(cartItem => {
				if (menuItem.id === cartItem.id) items = [...items, {...menuItem, ...cartItem}]
			})
		})
		setCart(items)
	}, [])

	const itemPrice = (item) => {
		return item.sizes.find(s => s.size === item.selectedSize)?.price ?? item.price
	}

	return (

		<Collapse
			in={isOpen}
			timeout="auto"
			unmountOnExit
			sx={{ padding: '0 10px 15px' }}
		>
			<TableContainer>
				<Typography variant="h6" gutterBottom component="div">
        	Order Details
      	</Typography>

      	<Table aria-label="collapsible table">
      		<TableHead>
      		{
      			collapsHeadCells?.map(headCell => (
      				<TableCell
      					key={headCell.id}
								align={headCell.numeric ? 'right' : 'left'}
								padding='none'
      				>
      					{ headCell.label }
      				</TableCell>
      			))
      		}
      		</TableHead>
      		<TableBody>
      			{
      				cart.map((cartItem, i) => (
      					<TableRow key={cartItem.id}>
      						<TableCell padding='none'>{ i+1 }</TableCell>
      						<TableCell padding='none'>{ cartItem.title }</TableCell>
      						<TableCell padding='none'>{ cartItem.selectedSize }</TableCell>
      						<TableCell padding='none'>{ cartItem.quantity }</TableCell>
      						<TableCell padding='none'>{ itemPrice(cartItem) }LE</TableCell>
      						{ !cartItem.discountCode && <TableCell padding='none'>{ itemPrice(cartItem) * cartItem.quantity }LE</TableCell> }
      						{ cartItem.discountCode && <TableCell padding='none'><span style={{ color: 'red' }}>{ itemPrice(cartItem) * cartItem.quantity }</span> <span style={{ color: 'green' }}>{ priceAfterDiscount(itemPrice(cartItem), cartItem.discountCode) * cartItem.quantity }LE</span></TableCell> }
      					</TableRow>
      				))
      			}
      		</TableBody>
      	</Table>
			</TableContainer>
			<MoreDetails>
				<Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '16px'}}>
			    More Details
			  </Typography>
			  <MoreDetailsFlexBox>
			  	<MoreDetailsItem>
			  		<span>Name: </span><span>{fullOrderDetails?.user?.name}</span>
			  	</MoreDetailsItem>
			  	<MoreDetailsItem>
			  		<span>Phone: </span><span>{fullOrderDetails?.user?.phone}</span>
			  	</MoreDetailsItem>
			  	<MoreDetailsItem>
			  		<span>Comment: </span><span>{fullOrderDetails?.user?.comment}</span>
			  	</MoreDetailsItem>
			  	<MoreDetailsItem>
			  		<span>Payment: </span><span>{fullOrderDetails?.payment?.method}</span>
			  	</MoreDetailsItem>
			  	<MoreDetailsItem>
			  		<span>Address: </span><span>{fullOrderDetails?.location?.address}</span>
			  	</MoreDetailsItem>
			  	<MoreDetailsItem>
			  		<span>Location: </span><span><a style={{ color: 'blue', cursor: 'pointer' }} target='_blank' href={`https://www.google.com/maps?q=${fullOrderDetails?.location?.latlng[0]},${fullOrderDetails?.location?.latlng[1]}`}>Google Maps</a></span>
			  	</MoreDetailsItem>
			  </MoreDetailsFlexBox>
			</MoreDetails>
		</Collapse>

	);
}

export default CustomCollapsedTableRow;