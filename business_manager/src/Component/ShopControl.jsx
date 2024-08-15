import styled from 'styled-components'

import WidgetTitle from './WidgetTitle'
import WidgetOption from './WidgetOption'
import FormControlLabel from '@mui/material/FormControlLabel'
import Android12Switch from '../theme/mui/Android12Switch'

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

	const handleSiteControl = (e) => {
		const type = e.target.type
		const name = e.target.name
		const value = type === 'checkbox' ? e.target.checked : e.target.value

		console.log('type', type)
		console.log('name', name)
		console.log('value', value)

		handleSetSiteControl({...values, [name]: value})
		console.log('values', values)
	}

	return (

		<Container>
			<WidgetTitle
				title='Restaurant Control'
				description='Control the restaurant availability.'
			/>
			
			<WidgetOption
				title='Auto Availability Mode'
				description='Enable or disable auto availability based on your daily working hours.'
			>
				<FormControlLabel
					control={<Android12Switch onChange={handleSiteControl} name='autoAvailability' checked={values?.autoAvailability} />}
				/>
			</WidgetOption>
			<WidgetOption
				title='Restaurant Availability Control'
				description='Open and close the restaurant'
				disabled={values?.autoAvailability}
			>
				<FormControlLabel
					control={<Android12Switch onChange={handleSiteControl} name='availability' checked={values?.availability} disabled={values?.autoAvailability} />}
				/>
			</WidgetOption>
			<WidgetOption
				title='Busy Status'
				description='Notify users that you are currently busy.'
			>
				<FormControlLabel
					control={<Android12Switch onChange={handleSiteControl} name='isBusy' checked={values?.isBusy} />}
				/>
			</WidgetOption>
			<div className='border-t-2 my-5'></div>
			<WidgetOption
				title='Temporary Pause'
				description='Temporary pause with the pause message.'
			>
				<FormControlLabel
					control={<Android12Switch onChange={handleSiteControl} name='temporaryPause' checked={values?.temporaryPause} />}
				/>
			</WidgetOption>
			<TextArea
				onChange={handleSiteControl}
				value={values?.closeMsg}
				placeholder='Close Message Content'
				name='closeMsg'
			/>
		</Container>

	)
}

export default ShopControl