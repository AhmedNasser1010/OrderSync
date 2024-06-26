import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import DB_DELETE_SUBCOLLECTION from '../functions/DB_DELETE_SUBCOLLECTION'
import { deleteWorker } from '../rtk/slices/staffSlice'

const Parent = styled.div``
const Icon = styled.div``

function StaffTableActions({ id }) {
	const dispatch = useDispatch()
	const staff = useSelector(state => state.staff)

	const handleDeleteWorker = () => {
		DB_DELETE_SUBCOLLECTION('users', id)
		.then(res => res && dispatch(deleteWorker(id)))
	}

	return (

		<Parent>
			<Icon>
				<Tooltip title="Delete" onMouseUp={handleDeleteWorker}>
					<IconButton>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			</Icon>
		</Parent>

	)
}

export default StaffTableActions