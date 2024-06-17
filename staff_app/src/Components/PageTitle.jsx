import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

function PageTitle({ children, style }) {
	return (

		<Box style={style}>
			<Typography
				variant="h1"
				gutterBottom
				sx={{
					fontSize: '3rem',
    			fontWeight: '900',
    			letterSpacing: '5px',
    			color: '#474747'
				}}
			>
        { children }
      </Typography>
		</Box>

	)
}

export default PageTitle