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
import { FaMoneyBillWave } from "react-icons/fa"
import { IoReloadCircle } from "react-icons/io5"

import Container from './Component/Container'
import MUITable from './Component/MUITable'
import PageTitle from './Component/PageTitle'
import TableTitle from './Component/TableTitle'
import StaffTableActions from './Component/StaffTableActions'
import AddNewWorkerDialog from './Component/AddNewWorkerDialog'

import fetchStaff from './functions/fetchStaff'
import { initStaff } from './rtk/slices/staffSlice'

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
		id: 'dues',
		label: (<span style={{ display: 'flex', alignItems: 'center', color: '#4b4a4a' }}><FaMoneyBillWave style={{ marginRight: '5px', fontSize: '1.3rem' }} /> Dues</span>),
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

	const handleReload = async () => {
		try {
			const staffMembers = await fetchStaff(accessToken)

			if (staffMembers.length) {
				dispatch(initStaff(staffMembers))
				return
			}

			console.error('Error while reload staff members: Staff members data not found')
			return
		} catch(e) {
			console.error('Error while reload staff members: ')
		}
	}

	useEffect(() => {
		const rowCellsMap = staff?.map(user => {
			if (user?.userInfo) {
				const id = user.uid
				const name = user.userInfo.name || ''
				const dues = user.ordersDues
				const email = user.userInfo.email
				const phone = user.userInfo.phone || ''
				const role = user.userInfo.role
				const online = user.online

				return { id, name, dues, email, phone, role, action: <StaffTableActions id={id} online={online} /> }
			}
		}).filter(user => user)

		setRowCells(rowCellsMap)
	}, [staff])

	return (

		<div>
			<PageTitle title='Staff' style={{ marginBottom: '50px' }} />

			<div style={{ margin: '0 15px' }}>
				<TableTitle
					title='Staff Action'
					titleBody='Add a new staff member to your business'
					actions={[
						{
							id: 1,
							title: 'Reload',
							startIcon: <IoReloadCircle />,
							callback: handleReload,
							disabled: business?.settings?.orderManagement?.assign?.forDeliveryWorkers || business?.settings?.orderManagement?.assign?.forCooks ? false : true
						},
						{
							id: 2,
							title: 'New Staff Member',
							startIcon: <PersonAddIcon />,
							callback: handleDialogOpenClose,
							disabled: business?.settings?.orderManagement?.assign?.forDeliveryWorkers || business?.settings?.orderManagement?.assign?.forCooks ? false : true
						}
					]}
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