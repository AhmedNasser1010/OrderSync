import { useState, useEffect } from 'react'
import styled from 'styled-components'

import WidgetTitle from './WidgetTitle'
import WidgetSwitcherContainer from './WidgetSwitcherContainer'

const Container = styled.div`

	& .switcher {
		margin-bottom: 20px;
	}
`
const TextArea = styled.textarea`
	all: unset;
	width: calc(100% - 20px);
	min-height: 100px;
	display: block;
	border: 1px solid #00000042;
	padding: 10px;
	border-radius: 6px;

	&::placeholder {
		font-size: 14px;
	}
`


function ShopControl({ values, handleSetSiteControl }) {

	const handleToggleIsStrictOpen = _ => handleSetSiteControl({...values, isStrictOpen: !values.isStrictOpen})

	const handleTextAreaChange = e => handleSetSiteControl({...values, closeMsg: e.target.value})

	return (

		<Container>
			<WidgetTitle
				title='Site Control'
				description='Control the website if there is maintenance'
			/>
			<WidgetSwitcherContainer
				checked={values?.isStrictOpen}
				handleOnClick={handleToggleIsStrictOpen}
				title='Website Control'
				description='Open/Close website and type the reason'
			/>
			<TextArea
				name="close-message"
				id="close-message"
				onChange={handleTextAreaChange}
				value={values?.closeMsg}
				placeholder='Close Message Content'
			/>
		</Container>

	)
}

export default ShopControl