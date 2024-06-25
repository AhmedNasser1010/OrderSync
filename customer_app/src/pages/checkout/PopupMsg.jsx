import styled from 'styled-components'

const Msg = styled.div`
	background-color: #edf0ff;
	border: 1px solid #3F51B5;
  padding: 40px 20px 10px 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-width: 400px;
  min-height: 200px;
  align-items: center;
  justify-content: flex-start;
  position: relative;
`
const Title = styled.h3`
	font-weight: 300;
	font-size: 40px;
	letter-spacing: 2px;
	margin-bottom: 24px;
`
const Subject = styled.p`
	width: 80%;
	text-align: center;
	line-height: 25px;
	font-size: 15px;
	letter-spacing: 0.5px;
`
const Button = styled.span`
	& * {
		all: unset;
		position: absolute;
		bottom: 20px;
		right: 20px;
		color: #673AB7;
		font-size: 14px;
		cursor: pointer;
	}
`

function PopupMsg({ title, subject, button, status='tip' }) {
	return (

		<Msg>
			<Title>{ title }</Title>
			<Subject>{ subject }</Subject>
			<Button>{ button }</Button>
		</Msg>

	)
}

export default PopupMsg