import { useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

function Scanner({ callback }) {

	useEffect(() => {
		const scanner = new Html5QrcodeScanner('reader', {
			qrbox: {
				width: 250,
				height: 250
			},
			fps: 10,
		})

		scanner.render((result) => callback?.success(result, scanner), (result) => callback?.error(result, scanner))

		return () => {
			scanner.clear()
		}
	}, [])

	return (<div id='reader' style={{ width: '500px', height: '500px' }}></div>)
}

export default Scanner