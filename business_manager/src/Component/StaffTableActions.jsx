import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Switch from '@mui/material/Switch'

import DB_DELETE_SUBCOLLECTION from '../functions/DB_DELETE_SUBCOLLECTION'
import DB_UPDATE_NESTED_VALUE from '../functions/DB_UPDATE_NESTED_VALUE'
import { deleteWorker, workerOnlineStatus } from '../rtk/slices/staffSlice'

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
		DB_DELETE_SUBCOLLECTION('users', id)
		.then(res => res && dispatch(deleteWorker(id)))
	}

	const handleUserOnlineStatus = (e) => {
		const value = e.target.checked

		DB_UPDATE_NESTED_VALUE('users', id, 'online.byManager', value)
		.then(res => {
			if (res) {
				dispatch(workerOnlineStatus({ id, value }))
			}
		})
	}

	return (

		<StyledWrapper>
			<Icon>
				<Tooltip title="Delete" onMouseUp={handleDeleteWorker}>
					<IconButton>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			</Icon>
			<Switch onChange={handleUserOnlineStatus} checked={online.byManager} />
		</StyledWrapper>

	)
}

export default StaffTableActions