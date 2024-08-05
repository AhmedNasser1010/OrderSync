import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { FaMoneyBillTransfer } from "react-icons/fa6"
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Switch from '@mui/material/Switch'

import DB_DELETE_SUBCOLLECTION from '../functions/DB_DELETE_SUBCOLLECTION'
import DB_UPDATE_NESTED_VALUE from '../functions/DB_UPDATE_NESTED_VALUE'
import { deleteWorker, workerOnlineStatus, resetDues } from '../rtk/slices/staffSlice'

const StyledWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`
const Icon = styled.div``

function StaffTableActions({ id, online }) {
	const dispatch = useDispatch()
	const staff = useSelector(state => state.staff)

	const handleDeleteWorker = () => {
		const confirmation = window.confirm('Do you really want to delete this staff member?')
		if (confirmation) {
			DB_DELETE_SUBCOLLECTION('drivers', id)
			.then(res => res && dispatch(deleteWorker(id)))
		}
	}

	const handleUserOnlineStatus = (e) => {
		const value = e.target.checked

		DB_UPDATE_NESTED_VALUE('drivers', id, 'online.byManager', value)
		.then(res => {
			if (res) {
				dispatch(workerOnlineStatus({ id, value }))
			}
		})
	}

	const handleResetDriverDues = () => {
		console.log('reset')
		DB_UPDATE_NESTED_VALUE('drivers', id, 'ordersDues', 0)
		.then(res => {
			if (res) {
				dispatch(resetDues(id))
			}
		})
	}

	return (

		<StyledWrapper>
			<Icon>
				<Tooltip title="Reset Driver Dues" onMouseUp={handleResetDriverDues}>
					<IconButton>
						<FaMoneyBillTransfer style={{ color: 'rgb(75, 74, 74)', fontSize: '1.3rem' }} />
					</IconButton>
				</Tooltip>
			</Icon>
			<Icon>
				<Tooltip title="Online Status">
					<Switch onChange={handleUserOnlineStatus} checked={online.byManager} />
				</Tooltip>
			</Icon>
			<Icon>
				<Tooltip title="Delete" onMouseUp={handleDeleteWorker}>
					<IconButton>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			</Icon>
		</StyledWrapper>

	)
}

export default StaffTableActions