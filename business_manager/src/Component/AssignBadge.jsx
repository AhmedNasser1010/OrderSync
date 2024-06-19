import styled from 'styled-components'

import ModeStandbyIcon from '@mui/icons-material/ModeStandby';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const Badge = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background-color: ${({ $status }) => $status === 'pickup' && '#75615a'};
	background-color: ${({ $status }) => $status === 'on-going' && '#ffc107'};
	background-color: ${({ $status }) => $status === 'on-delivery' && '#009688'};
	background-color: ${({ $status }) => $status === 'completed' && '#4caf50'};
	border-radius: 50px;
	padding: 5px 8px;
	font-size: 12px;
	color: white;
	font-weight: bold;
	font-family: monospace;
`
const Icon = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;

	& svg {
		font-size: 18px;
	}
`
const Title = styled.span``

function AssignBadge({ status }) {
	return (

		<Badge $status={status}>
			<Icon>
				{ status === 'pickup' &&  <ModeStandbyIcon />}
				{ status === 'on-going' &&  <OutdoorGrillIcon />}
				{ status === 'on-delivery' &&  <DeliveryDiningIcon />}
				{ status === 'completed' &&  <DoneAllIcon />}
			</Icon>
			<Title>
				{ status === 'pickup' &&  'Pickup'}
				{ status === 'on-going' &&  'Cooking'}
				{ status === 'on-delivery' &&  'Delivery'}
				{ status === 'completed' &&  'Completed'}
			</Title>
		</Badge>

	)
}

export default AssignBadge