function Info({ children, label }) {
	return (

		<div className='info flex justify-between items-center text-gray-500 font-ProximaNovaSemiBold'>
			<span className='label'>{ label }</span>
			<span className='value'>{ children }</span>
		</div>

	)
}

export default Info