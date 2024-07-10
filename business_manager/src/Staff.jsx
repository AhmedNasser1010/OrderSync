import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PeopleIcon from '@mui/icons-material/People'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import BadgeIcon from '@mui/icons-material/Badge'
import EmailIcon from '@mui/icons-material/Email'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import FlagIcon from '@mui/icons-material/Flag'
import KeyIcon from '@mui/icons-material/Key'

import Container from './Component/Container'
import MUITable from './Component/MUITable'
import PageTitle from './Component/PageTitle'
import TableTitle from './Component/TableTitle'
import StaffTableActions from './Component/StaffTableActions'
import AddNewWorkerDialog from './Component/AddNewWorkerDialog'

const headCells = [
	{
		id: 'index',
		label: <PeopleIcon sx={{ color: '#4b4a4a' }} />,
	},
	{
		id: 'id',
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><FingerprintIcon sx={{ marginRight: '5px' }} /> ID</span>),
	},
	{
		id: 'name',
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><BadgeIcon sx={{ marginRight: '5px' }} /> Name</span>),
	},
	{
		id: 'email',
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><EmailIcon sx={{ marginRight: '5px' }} /> Email</span>),
	},
	{
		id: 'phone',
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><LocalPhoneIcon sx={{ marginRight: '5px' }} /> Phone</span>),
	},
	{
		id: 'role',
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><FlagIcon sx={{ marginRight: '5px' }} /> Role</span>),
	},
	{
		id: 'action',
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><KeyIcon sx={{ marginRight: '5px' }} /> Action</span>),
	},
]

function Staff() {
	const dispatch = useDispatch()
	const accessToken = useSelector(state => state.user.accessToken)
	const staff = useSelector(state => state.staff)
	const [rowCells, setRowCells] = useState([])
	const [dialogIsOpen, setDialogIsOpen] = useState(false)
	const business = useSelector(state => state.business)

	const handleDialogOpenClose = () => {
		setDialogIsOpen(dialogIsOpen => !dialogIsOpen)
	}

	useEffect(() => {
		const rowCellsMap = staff.map(user => {
			const id = user.userInfo.uid
			const name = user.userInfo.name || ''
			const email = user.userInfo.email
			const phone = user.userInfo.phone || ''
			const role = user.userInfo.role

			return { id, name, email, phone, role, action: <StaffTableActions id={id} /> }
		})

		setRowCells(rowCellsMap)
	}, [staff])

	return (

		<div>
			<PageTitle title='Staff' style={{ marginBottom: '50px' }} />

			<div style={{ margin: '0 15px' }}>
				<TableTitle
					title='Staff Action'
					titleBody='Add a new staff member to your business'
					action={{
						title: 'New Staff Member',
						startIcon: <PersonAddIcon />,
						callback: handleDialogOpenClose,
						disabled: business?.settings?.orderManagement?.assign?.forDeliveryWorkers || business?.settings?.orderManagement?.assign?.forCooks ? false : true
					}}
				/>

				<MUITable
					rowCells={rowCells}
					headCells={headCells}
				/>
			</div>

			<AddNewWorkerDialog isOpen={dialogIsOpen} handleDialogOpenClose={handleDialogOpenClose} />
		</div>

	)
}

export default Staff