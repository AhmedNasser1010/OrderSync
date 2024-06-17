import styled from 'styled-components'

import WhatsInYourMindSlider from './Components/WhatsInYourMindSlider'
import Divider from './Components/Divider'
import TopMenuItems from './Components/TopMenuItems'
import MenuItems from './Components/MenuItems'

const Container = styled.section`
	margin-bottom: 150px;
`

function Home() {
	return (

		<Container>
			<WhatsInYourMindSlider />
			<Divider style={{ margin: '0 120px 50px 120px' }} />
			<TopMenuItems />
			<Divider style={{ margin: '50px 120px' }} />
			<MenuItems />
		</Container>

	)
}

export default Home