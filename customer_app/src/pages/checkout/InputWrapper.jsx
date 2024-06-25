import styled, { css } from 'styled-components'

import Input from './Input'

const Wrapper = styled.label`
	all: unset;
	position: relative;

	&::before {
		content: '${({ $label }) => $label}';
		width: max-content;
		position: absolute;
		top: -7px;
		left: 15px;
		background-color: white;
		font-size: 13px;
		padding: 0 10px;
		height: 8px;
		color: ${({ $error }) => $error && '#d32f2f !important'};
	}
`

const HelperMsg = styled.span`
	display: block;
	color: #d32f2f;
	max-width: 100%;
	margin-left: 20px;
	margin-top: 5px;
	font-size: 13px;
`

function InputWrapper({ style, as, label, name, placeholder, error, helperMsg, onChange }) {
	return (

		<Wrapper
			$label={label}
			$error={error}
			onChange={onChange}
		>
			<Input props={{ as, name, placeholder, error }} />
			{ error && <HelperMsg>{ helperMsg }</HelperMsg>}
		</Wrapper>

	)
}

export default InputWrapper