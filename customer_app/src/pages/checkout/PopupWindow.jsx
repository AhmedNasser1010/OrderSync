import { useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #0000002e;

	& body {
		overflow: hidden;
	}
`
const Window = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: white;
	padding: 20px;
	border-radius: 8px;
`

function PopupWindow({ children, isOpen, onWindowClose }) {
	const [windowIsOpen, setWindowIsOpen] = useState(isOpen)

	const handleOnClose = (e) => {
		if (e.target.classList.contains('wrapper')) {
			onWindowClose()
			setWindowIsOpen(false)
		}
	}

	return (
		<>
		{
			windowIsOpen &&
				<Wrapper className='wrapper' onMouseUp={handleOnClose}>
					<Window>
						{ children }
					</Window>
				</Wrapper>
		}
		</>
	)
}

export default PopupWindow