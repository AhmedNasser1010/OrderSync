import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Stack from '@mui/material/Stack';
import CustomCollapsedTableRow from './CustomCollapsedTableRow';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Dialog from '@mui/material/Dialog'
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useReactToPrint } from 'react-to-print';

import { setPrintedOrders } from '../rtk/slices/conditionalValuesSlice'

import AssignBadge from './AssignBadge'
import AssignDialog from './AssignDialog'
import Invoice from './Invoice'

const CustomTableRow = ({ row = [], selected, index, handleSetSelected, tableStatus }) => {
	const dispatch = useDispatch()
	const orders = useSelector(state => state.orders.open)
	const [isOpen, setIsOpen] = useState(false);
	const [assignDialogIsOpen, setAssignDialogIsOpen] = useState(false);
	const business = useSelector(state => state.business)
	const menu = useSelector(state => state.menu.items)
	const componentRef = useRef(null)
	const printedOrders = useSelector(state => state.conditionalValues.printedOrders)
	const [isPrinted, setIsPrinted] = useState(false)

	useEffect(() => {
		printedOrders.map(id => row.id === id && setIsPrinted(true))
	}, [printedOrders])


	const currentOrder = useMemo(() => {
	  if (!row.id) return null;

	  const order = orders.find(order => order.id === row.id)

	  if (!order) return null

	  const selectedMenuItems = order.cart.map(cartItem => {
	    const menuItem = menu.find(menuItem => menuItem.id === cartItem.id)
	    return menuItem ? { ...menuItem, quantity: cartItem.quantity } : null
	  }).filter(item => item !== null)

	  const totalPrice = selectedMenuItems.reduce((total, item) => {
	    const itemPrice = parseFloat(item.price) * item.quantity
	    return {
	      total: total.total + itemPrice,
	      totalDiscounted: item.discount?.code ? total.totalDiscounted : total.totalDiscounted + itemPrice
	    };
	  }, { total: 0, totalDiscounted: 0 })

	  return {
	    selectedMenuItems,
	    orderData: order,
	    price: totalPrice
	  };
	}, [orders, row])

	const isSelected = (id) => selected.indexOf(id) !== -1;

	const handleClick = (event, id) => {
		const selectedIndex = selected.indexOf(id);
		let newSelected = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedIndex),
				selected.slice(selectedIndex + 1),
			);
		}
		handleSetSelected(newSelected);
	};

	const handleOpenClose = () => {
		setAssignDialogIsOpen(assignDialogIsOpen => !assignDialogIsOpen)
	}

	const handlePrint = useReactToPrint({
		content: () => componentRef.current,
		onAfterPrint: () => dispatch(setPrintedOrders(row.id))
	})

	const isItemSelected = isSelected(row.id);
	const labelId = `enhanced-table-checkbox-${index}`;

	return (

		<>
			<div style={{ display: 'none' }}>
				<div ref={componentRef}>
					{
						currentOrder?.orderData &&
							<Invoice
								business={business}
								orders={[currentOrder]}
							/>
					}
				</div>
			</div>
			<TableRow
				hover
				role="checkbox"
				aria-checked={isItemSelected}
				tabIndex={-1}
				selected={isItemSelected}
				sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}
			>
				<TableCell padding="checkbox">
					<Stack direction='row' spacing={0.5}>
						<Checkbox
							color="primary"
							checked={isItemSelected}
							inputProps={{
								'aria-labelledby': labelId,
							}}
							onClick={(event) => handleClick(event, row.id)}
						/>
						<IconButton
							aria-label="expand row"
							size="small"
							onClick={() => setIsOpen(!isOpen)}
						>
							{isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					</Stack>
				</TableCell>
				<TableCell>{ index+1 }</TableCell>
				{ Object.values(row).map((value, i) => (
					<TableCell key={i}>
						{ i === 0 ? `#${value.split('-')[0]}` : value }
					</TableCell>
				)) }
				{
					tableStatus !== 'RECEIVED' &&
						<TableCell onMouseUp={handlePrint}>
				      <ReceiptIcon sx={{ color: isPrinted ? 'black' : '#9b9b9b' }} />
				    </TableCell>
				}
				{
				  (tableStatus === 'IN_PROGRESS' && business?.settings?.orderManagement?.assign?.forCooks) || 
				  (tableStatus === 'IN_DELIVERY' && business?.settings?.orderManagement?.assign?.forDeliveryWorkers) ||
				  (tableStatus === 'COMPLETED') ? (
				    <TableCell onMouseUp={handleOpenClose}>
				      <AssignBadge status={currentOrder?.orderData?.assign?.status} />
				    </TableCell>
				  ) : null
				}
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
					<CustomCollapsedTableRow isOpen={isOpen} row={row} />
				</TableCell>
			</TableRow>
			<AssignDialog
				isOpen={assignDialogIsOpen}
				handleOpenClose={handleOpenClose}
				currentOrder={currentOrder?.orderData}
			/>
		</>

	);
}

export default CustomTableRow;