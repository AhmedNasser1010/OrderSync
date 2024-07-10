import styled from 'styled-components'

const Options = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: space-between;
	align-items: center;
  background-color: #5b00ff2b;
  border-radius: 4px;
  border: 1px solid #5b00ff;
  cursor: pointer;
  user-select: none;
`
const Option = styled.div`

	& input {
		display: none;
	}

	&	label {
		all: unset;
		padding: 5px 8px;
		display: block;
		font-size: small;
		transition: 0.2s;
	}

	& input:checked + label {
    color: white;
    background-color: #3F51B5;
  }

  & input:disabled + label {
  	opacity: 0.5;
    cursor: not-allowed;
  }
`

function Radio({ options = [], defaultValue, disabled = false, onChangeCallback }) {
	return (

		<Options onChange={onChangeCallback}>
			{
				options?.map(opt => (
					<Option key={opt.value}>
						<input
							id={opt.value}
							name='radio'
							type="radio"
							value={opt.value}
							defaultChecked={opt.value === defaultValue}
							disabled={opt.disabled}
						/>
						<label for={opt.value}>{ opt.label }</label>
					</Option>
				))
			}
		</Options>

	)
}

export default Radio

// Usage example
// <Radio
// 	options={[
// 		{ value: 'SIMPLE', label: 'Simple' },
// 		{ value: 'DEEP', label: 'Deep' },
// 	]}
// 	defaultValue={method}
// 	onChangeCallback={(e) => setMethod(e.target.value)}
// />