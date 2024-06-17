import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase.js"
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { initWorkers, newWorkers } from './rtk/slices/workersSlice'

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
import WorkersTableActions from './Component/WorkersTableActions'
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

function Workers() {
	const dispatch = useDispatch()
	const accessToken = useSelector(state => state.user.accessToken)
	const workers = useSelector(state => state.workers)
	const [rowCells, setRowCells] = useState([])
	const [dialogIsOpen, setDialogIsOpen] = useState(false)

	const handleDialogOpenClose = () => {
		setDialogIsOpen(dialogIsOpen => !dialogIsOpen)
	}

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const usersCollection = collection(db, "users");
				const q = query(usersCollection, where("accessToken", "==", accessToken))
				const querySnapshot = await getDocs(q)

				const data = querySnapshot.docs.map(doc => doc.data())
				const filterDatadata = data.filter(data => data.userInfo.role === 'ORDER_CAPTAIN' || data.userInfo.role === 'DELIVERY_CAPTAIN')

				return filterDatadata
			} catch (error) {
				console.error("Error querying users:", error)
				return []
			}
		}

		!workers.length && fetchUsers().then(res => dispatch(initWorkers(res)))
	}, [])

	useEffect(() => {
		const rowCellsMap = workers.map(user => {
			const id = user.userInfo.uid
			const name = user.userInfo.name || ''
			const email = user.userInfo.email
			const phone = user.userInfo.phone || ''
			const role = user.userInfo.role

			return { id, name, email, phone, role, action: <WorkersTableActions id={id} /> }
		})

		setRowCells(rowCellsMap)
	}, [workers])

	return (

		<Container>
			<PageTitle title='Workers' style={{ marginBottom: '50px' }} />

			<TableTitle
				title='Worker Action'
				titleBody='Add a new worker to your business'
				action={{
					title: 'new worker',
					startIcon: <PersonAddIcon />,
					callback: handleDialogOpenClose
				}}
			/>

			<MUITable
				rowCells={rowCells}
				headCells={headCells}
			/>

			<AddNewWorkerDialog isOpen={dialogIsOpen} handleDialogOpenClose={handleDialogOpenClose} />
		</Container>

	)
}

export default Workers