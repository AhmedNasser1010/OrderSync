import styled from 'styled-components'

import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

const Parent = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px;
`
const TitleContent = styled.div``

function DialogTitle({ title, bodyTitle, closeCallback }) {
	return (

		<>
			<Parent>
				<TitleContent>
					<Typography variant="h3" gutterBottom sx={{ fontSize: '2rem', marginBottom: '0px' }}>{ title }</Typography>
					<Typography variant="body2" gutterBottom sx={{ color: '#3e3e3e' }}>{ bodyTitle }</Typography>
				</TitleContent>
				<Tooltip title="Exit" onMouseUp={closeCallback}>
					<IconButton>
						<CloseRoundedIcon />
					</IconButton>
				</Tooltip>
			</Parent>
			<Divider />
		</>

	)
}

export default DialogTitle