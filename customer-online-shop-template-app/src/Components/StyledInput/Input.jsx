import styled from 'styled-components'

const StyledInput = styled.input`
	all: unset;
	border: 1px solid #979797;
	padding: 10px;
	display: block;
	width: calc(100% - 20px);
	border-radius: 4px;
	border-color: ${({ $error }) => $error && '#d32f2f'};

	&::placeholder {
		font-size: 12px;
	}
`

function Input({ props }) {


	return (

		<StyledInput as={props.as} $error={props.error} {...props} />

	)
}

export default Input