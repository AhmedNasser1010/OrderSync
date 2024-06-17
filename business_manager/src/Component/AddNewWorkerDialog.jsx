import styled from 'styled-components'

import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'

import DialogTitle from './DialogTitle'
import NewWorkerForm from './NewWorkerForm'

function AddNewWorkerDialog({ isOpen, handleDialogOpenClose }) {
	return (

		<Dialog open={isOpen}>
			<DialogTitle
				title='New Worker'
				bodyTitle='Add new worker to your business'
				closeCallback={handleDialogOpenClose}
			/>
			<NewWorkerForm handleDialogOpenClose={handleDialogOpenClose} />
		</Dialog>

	)
}

export default AddNewWorkerDialog