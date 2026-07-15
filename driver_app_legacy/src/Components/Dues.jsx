import { useSelector } from 'react-redux'
import styled from 'styled-components'

const Widget = styled.div`
	box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
	width: calc(100% - 40px);
	padding: 20px;
	background-color: white;
	border-radius: 5px;
`
const Title = styled.h3`
	font-size: large;
  color: #0000007a;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: 15px;
`
const DebitNumber = styled.span`
	padding: 10px;
  font-size: x-large;
  font-weight: 900;
  color: #535353;
`
const CurrencySymbol = styled.span`
	font-size: large;
  font-weight: 900;
  color: #535353;
`

function Dues() {
	const highestDues = useSelector(state => state?.partnerServices?.highestDues?.limit)
	const userOrdersDues = useSelector(state => state?.user?.ordersDues)

	const getColor = () => {
		if (userOrdersDues < highestDues/2) {
			return '#4caf50'
		} else if (userOrdersDues >= highestDues/1.3) {
			return '#ff5722'
		} else if (userOrdersDues >= highestDues/2) {
			return '#ff9800'
		}
	}

	return (

		<Widget>
			<Title>ORDERS DUES</Title>
			<DebitNumber><span style={{ color: getColor() }}>{userOrdersDues}</span> /{highestDues}</DebitNumber>
			<CurrencySymbol>L.E.</CurrencySymbol>
		</Widget>

	)
}

export default Dues