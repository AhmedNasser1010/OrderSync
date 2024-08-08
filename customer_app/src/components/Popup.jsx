

function Popup({ title, description, visibility, closeCallback, callbackFunc = null, noLabel = 'CLOSE', yesLabel = 'OKAY' }) {
	return (
		<div className="fixed bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/3 p-5 bg-white flex flex-col w-full max-w-[500px] h-52 shadow-md popup-anim z-10">
      <h3 className='font-ProximaNovaSemiBold text-xl'>{ title }</h3>
        <p className='text-color-3 font-ProximaNovaThin text-sm py-2'>{ description }</p>
        <div className='flex justify-between sm:justify-center font-ProximaNovaSemiBold sm:text-sm text-xs sm:gap-0 gap-6'>
          <button onClick={closeCallback} className='bg-white border border-color-11 sm:w-2/5 w-40 sm:h-14 sm:m-5 px-1 py-3'>{ noLabel }</button>
          { callbackFunc && <button onClick={callbackFunc} className='sm:w-2/5 w-40 sm:h-14 sm:m-5 bg-color-11 text-white'>{ yesLabel }</button> }
        </div>
    </div>
	)
}

export default Popup