import styled from 'styled-components'

const CheckPointsContainer = styled.div`
	width: 100%;
`
const Steps = styled.div`
	display: flex;
	gap: 4rem;
	width: 100%;
	justify-content: space-between;
	align-items: center;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
    width: ${({$progress}) => $progress}%;
    height: 5px;
    background-color: ${({$themeColorFill}) => $themeColorFill};
    position: absolute;
    top: 25%;
    transform: translateY(-50%);
    z-index: -1;
    transition: 0.3s;
	}

	&::after {
		content: '';
    width: 100%;
    height: 5px;
    background-color: ${({$themeColorEmpty}) => $themeColorEmpty};
    position: absolute;
    top: 25%;
    transform: translateY(-50%);
    z-index: -2	;
	}
`
const Step = styled.span`
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
`
const StepNumber = styled.span`
	background-color: ${({$themeColorFill}) => $themeColorFill};
	color: white;
	font-weight: bold;
	border-radius: 50px;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
`
const StepLabel = styled.p`
	margin-top: 10px;
`

function CheckPoints({ steps, progress, themeColorFill, themeColorEmpty }) {
	return (

		<CheckPointsContainer className='check-points-container'>
			<Steps
				className='check-point-steps'
				$themeColorFill={themeColorFill}
				$themeColorEmpty={themeColorEmpty}
				$progress={progress}
			>
				{ steps.map((step, index) => (
					<Step key={index} className='check-point-step'>
						<StepNumber className='index' $themeColorFill={themeColorFill}>{ index+1 }</StepNumber>
						<StepLabel className='label'>{ step }</StepLabel>
					</Step>
				)) }
			</Steps>
		</CheckPointsContainer>

	)
}

export default CheckPoints