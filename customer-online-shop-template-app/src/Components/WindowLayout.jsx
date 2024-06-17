import styled from 'styled-components'

const Layout = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	transition: 0.3s;
	background-color: #0000003d;
	opacity: ${({ $visibileCondition }) => $visibileCondition ? '1' : '0'};
	visibility: ${({ $visibileCondition }) => $visibileCondition ? 'visible' : 'hidden'};
`

function WindowLayout({ children, style, onClickHandler, visibileCondition }) {
	return (

		<Layout
			className='layout'
			style={style}
			onMouseUp={(e) => e.target.classList.contains('layout') && onClickHandler()}
			$visibileCondition={visibileCondition}
		>
			{ children }
		</Layout>

	)
}

export default WindowLayout