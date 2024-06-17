import styled from 'styled-components'

const MapButtonStyled = styled.button`
	opacity: ${({ $status }) => $status === 'disabled' && '0.7'};
	pointer-events: ${({ $status }) => $status === 'disabled' ? 'none' : 'unset'};
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 1000;
  padding: 10px;
  background-color: ${({ $status }) => {
  	if ($status === 'active')
  		return '#60b246'
  	else if ($status === '' || $status === 'normal')
  		return'white'
  }};
  border: 1px solid rgb(204, 204, 204);
  border-radius: 5px;
  cursor: pointer;
  outline-style: none;
  border-color: ${({ $status }) => {
  	if ($status === 'active')
  		return '#434343'
  	else if ($status === '' || $status === 'normal')
  		return 'rgb(204, 204, 204)'
  }};
  color: ${({ $status }) => {
  	if ($status === 'active')
  		return 'white'
  	else if ($status === '' || $status === 'normal')
  		return 'unset'
  }};

  & .start-icon {
  	margin-right: 10px;
  	transform: translateY(1px);
  }

  & .start-icon path {
  	fill: ${({ $status }) => {
	  	if ($status === 'active')
	  		return 'white'
	  	else if ($status === '' || $status === 'normal')
	  		return 'unset'
	  }};
  }

  & .end-icon {
  	margin-left: 10px;
  	transform: translateY(1px);
  }

  & .end-icon path {
  	fill: ${({ $status }) => {
	  	if ($status === 'active')
	  		return 'white'
	  	else if ($status === '' || $status === 'normal')
	  		return 'unset'
	  }};
  }
`

function MapButton({ onMouseUp, style, startIcon, endIcon, label, status = '' }) {
	return (

		<MapButtonStyled
			onMouseUp={() => status !== 'disabled' && onMouseUp}
			style={style}
			$status={status}
		>
			{ startIcon }
			{ label }
			{ endIcon }
		</MapButtonStyled>

	)
}

export default MapButton