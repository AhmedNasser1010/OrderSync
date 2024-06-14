import styled from 'styled-components'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

const SwitchButton = styled.label`
	display: block;
	width: 60px;
	height: 25px;
	background-color: #dddddd;
	border-radius: 5px;
	overflow: hidden;
	position: relative;
	cursor: pointer;
`
const Toggle = styled.div`
		position: relative;
		background-color: blue;
		transition: all 0.2s ease-in-out;
		width: ${({ $checked }) => $checked ? '100%' : '50%'};
		height: 100%;
		border-radius: 5px;
		color: white;

	& svg {
		position: absolute;
		top: 0;
		right: 3px;
	}
`

function Switcher({ checked, onMouseUp }) {
	return (

		<SwitchButton onMouseUp={onMouseUp}>
			<input type="checkbox" checked={checked} style={{ display: 'none' }} />
			<Toggle $checked={checked}>
				{ checked ? <CheckRoundedIcon /> : <ClearRoundedIcon /> }
			</Toggle>
		</SwitchButton>

	)
}

export default Switcher