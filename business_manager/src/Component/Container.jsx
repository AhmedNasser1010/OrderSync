import styled from 'styled-components'

const ContainerBox = styled.section``

function Container({ children, style }) {
	return (

		<ContainerBox style={style}>{ children }</ContainerBox>

	)
}

export default Container