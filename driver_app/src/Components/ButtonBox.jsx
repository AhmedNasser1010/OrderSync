import { useNavigate } from 'react-router-dom'
import useCloseOrder from "../hooks/useCloseOrder"
import styled from 'styled-components'
import Button from '@mui/material/Button'

const Buttons = styled.div`
	width: 80%;
	display: flex;
	gap: 1rem;

	& .btn {
		width: 100%;
	}
`

function ButtonBox({ id }) {
	const navigate = useNavigate()
	const closeOrder = useCloseOrder()

	const handleToNext = async () => {
		const confirmation = window.confirm("Are you sure you want to check this order as delivered?")

		if (confirmation) {
			closeOrder(id, () => navigate('/queue'))
		}
	}

	return (

		<Buttons>
			<Button
				className='btn'
				variant="outlined"
				onMouseUp={() => navigate('/queue')}
			>
				Back To Queue
			</Button>
			<Button
				className='btn'
				variant="contained"
				onMouseUp={() => handleToNext()}
			>
				Close The Order
			</Button>
		</Buttons>

	)
}

export default ButtonBox