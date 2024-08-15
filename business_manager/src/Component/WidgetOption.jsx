function WidgetOption({ children, title, description, disabled=false }) {
	return (

		<div className='flex flex-row items-center justify-between mb-4'>
			<div className={`max-w-[60%] ${disabled ? 'opacity-60' : 'opacity-100'}`}>
				<h4 className='mb-2'>{ title }</h4>
				<p className='text-sm text-gray-500'>{ description }</p>
			</div>
			<div>
				{ children }
			</div>
		</div>

	)
}

export default WidgetOption