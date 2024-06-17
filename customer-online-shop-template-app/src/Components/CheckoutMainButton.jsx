import { useState } from 'react'
import styled from 'styled-components'

const Container = styled.div`
	width: 100%;
	display: flex;
	align-items: stretch;
	justify-content: space-between;
	gap: 0.5rem;
`
const Button = styled.button`
	all: unset;
	padding: 10px 20px;
	border: 1px solid #979797;
	border-radius: 5px;
	cursor: pointer;
	width: 100%;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: 0.3s;
`
const NextButton = styled(Button)`
	background-color: ${({ $nextBtnIsDisable }) => $nextBtnIsDisable ? '#00000073' : '#60b246'};
	color: white;
`
const HelperMessage = styled.span`
	display: block;
	color: #F44336;
`

const BackButton = styled(Button).attrs({ as: 'span' })``

function CheckoutMainButton({ nextLabel = 'Next', backLabel = 'Back', nextBtnIsDisable=false, nextEventCallback = () => null, backEventCallback }) {
	const [errorMessage, setErrorMessage] = useState(null)

	return (

		<>
			{ errorMessage && <HelperMessage>{ errorMessage }</HelperMessage> }
			<Container>
				<BackButton
					onMouseUp={backEventCallback}
				>
					{ backLabel }
				</BackButton>
				<NextButton
					$nextBtnIsDisable={nextBtnIsDisable}
					type="submit"
					onMouseUp={() => {
						if (!nextBtnIsDisable) {
							const error = nextEventCallback()
							setErrorMessage(error)
						}
					}}
				>
					{ nextLabel }
				</NextButton>
			</Container>
		</>

	)
}

export default CheckoutMainButton