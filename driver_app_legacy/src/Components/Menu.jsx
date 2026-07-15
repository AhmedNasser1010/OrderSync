import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;
  transition: 0.3s;
  visibility: ${({ $enableOptionsMenu }) => $enableOptionsMenu ? 'visibile' : 'hidden'};
	background-color: ${({ $enableOptionsMenu }) => $enableOptionsMenu ? '#0000006e' : 'rgb(0 0 0 / 0%)'};
`
const StyledMenu = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	background-color: white;
	width: calc(100% - 40px);
  min-height: 30vh;
  border-radius: 10px 10px 0px 0px;
  padding: 15px 20px;
  transition: 0.3s;
  transform: ${({ $enableOptionsMenu }) => $enableOptionsMenu ? 'translateY(0)' : 'translateY(100%)'};
`
const SliderBtn = styled.div`
	margin: auto;
  width: 10%;
  height: 5px;
  background-color: lightgrey;
  border-radius: 10px;
`
const Title = styled.h3`
	color: #0000007a;
	font-size: small;
	margin-bottom: 20px;
`
const Options = styled.div`
	padding: 0 10px;
`
const Option = styled.div`
	cursor: pointer;
`

function Menu({ enableOptionsMenu, handleEnableMenu, handleDisableMenu }) {
	const navigate = useNavigate()

	return (

		<Wrapper $enableOptionsMenu={enableOptionsMenu} onMouseUp={handleDisableMenu}>
			<StyledMenu $enableOptionsMenu={enableOptionsMenu}>
				<SliderBtn></SliderBtn>
				<Title>OPTIONS</Title>
{/*				<Options>
					<Option onMouseUp={() => {handleDisableMenu();navigate('/financial-dues')}}>Financial Dues</Option>
				</Options>*/}
			</StyledMenu>
		</Wrapper>

	)
}

export default Menu