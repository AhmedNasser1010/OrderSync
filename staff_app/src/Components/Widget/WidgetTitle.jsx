import styled from 'styled-components'

const StyledWrapper = styled.div`
	margin-bottom: 20px;

	& h3 {
		font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 5px;
	}

	& p {
		margin: 0;
    color: #00000099;
    font-size: 14px;
    max-width: 80%;
	}
`

function WidgetTitle({ title, description }) {
	return (

		<StyledWrapper>
			<h3>{ title }</h3>
			<p>{ description }</p>
		</StyledWrapper>

	)
}

export default WidgetTitle