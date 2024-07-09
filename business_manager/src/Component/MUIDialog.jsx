import Dialog from '@mui/material/Dialog'
import DialogTitle from './DialogTitle'

function MUIDialog({ children, isOpen = false, closeCallback, title, description }) {
	return (

		<Dialog open={isOpen}>
			<DialogTitle
				title={title}
				bodyTitle={description}
				closeCallback={closeCallback}
			/>
			<div>
				{ children }
			</div>
		</Dialog>

	)
}

export default MUIDialog