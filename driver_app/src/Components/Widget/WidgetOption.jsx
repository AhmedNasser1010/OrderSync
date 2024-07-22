import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

	& div h4 {
		margin-bottom: 5px;
	}
	& div p {
		font-size: 14px;
		color: #00000099;
	}
	& div button {
		all: unset;
		background-color: #EF4444;
    color: white;
    padding: 5px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: small;
	}
`

function WidgetOption({ children, title, description }) {
	return (

		<Wrapper>
			<div style={{ maxWidth: '60%' }}>
				<h4>{ title }</h4>
				<p>{ description }</p>
			</div>
			<div>
				{ children }
			</div>
		</Wrapper>

	)
}

export default WidgetOption