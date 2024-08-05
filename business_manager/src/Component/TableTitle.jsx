import styled from 'styled-components'

import Button from '@mui/material/Button'

const Parent = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px;
`
const Content = styled.div``
const Title = styled.h3`
	font-weight: 500;
`
const TitleBody = styled.p`
	font-size: 14px;
	color: #434343;
`
const ActionBtns = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
`
const Action = styled(Button)``

function TableTitle({ title, titleBody, actions }) {
	return (

		<Parent>
			<Content>
				<Title>{ title }</Title>
				<TitleBody>{ titleBody }</TitleBody>
			</Content>
			<ActionBtns>
				{
					actions?.map(action => (
						<Action
							key={action.id}
							disabled={action?.disabled || false}
							onMouseUp={action.callback}
							variant="contained"
							size='small'
							startIcon={action.startIcon}
							endIcon={action.endIcon}
							>
							{ action.title }
						</Action>
					))
				}
			</ActionBtns>
		</Parent>

	)
}

export default TableTitle