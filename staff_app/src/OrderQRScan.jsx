import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import DB_GET_DOC from './utils/DB_GET_DOC'
import { initOrders } from './rtk/slices/ordersSlice'
import { initQueue } from './rtk/slices/queueSlice'

import Container from './Components/Container'
import PageTitle from './Components/PageTitle'
import Scanner from './Components/Scanner'


function OrderQRScan() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [orderId, setOrderId] = useState(null)
	const [scanError, setScanError] = useState(null)
	const user = useSelector(state => state.user)
	const orders = useSelector(state => state.orders)
	const queue = useSelector(state => state.queue)

	const success = (result, scanner) => {
		const invoiceNumberMatch = result.match(/Invoice No:\s*([^\s]+)/)
		const invoiceTest = /^\d{1,4}-\d*$/

		if (invoiceNumberMatch && invoiceNumberMatch[1]) {
	    const invoiceNumber = invoiceNumberMatch[1]

			if (invoiceTest.test(invoiceNumber)) {
				scanner.clear()
				setOrderId(invoiceNumber)
				return
			}

			setScanError(scanError => scanError !== 'Not invoice' && 'Not invoice')
	    
		} else {
		  setScanError(scanError => scanError !== 'Not invoice' && 'Not invoice')
		}

	}

	useEffect(() => {
		scanError === 'Not invoice' && toast.error('This is not a correct invoice qrcode!')
	}, [scanError])

	useEffect(() => {
		orderId && DB_GET_DOC('orders', user.accessToken)
		.then(res => {
			if (res) {
				const data = res.open
				dispatch(initOrders(data))

				const isIncludedBefore = data.find(order => order.id === orderId)

				if (isIncludedBefore) {

					const orderIsAddedBefore = queue.find(qu => qu.id === orderId)

					if (orderIsAddedBefore) {
						toast.error('This order has been added before!')
					} else {
						if (isIncludedBefore?.status !== 'IN_DELIVERY') {
							toast.success(
								`This order is not ready yet.`
								, {
								icon: '🤌',
								duration: 5000,
							})
						} else {
							dispatch(initQueue([...queue, isIncludedBefore]))
							navigate('/queue')
							toast.success('Your order is successfully added to your queue.', {
								duration: 3000,
							})
						}
					}

				} else {
					toast.error('Looks like your scanned order is expired or something.', {
						duration: 3000,
					})
				}

			}
			setOrderId(null)
		})
	}, [orderId])

	return (

		<Container style={{ overflow: 'hidden' }}>
			<PageTitle>QR Scan</PageTitle>
			<Scanner
				callback={{
					success: (result, scanner) => success(result, scanner),
					error: (result) => scanError !== result && result !== 'QR code parse error, error = NotFoundException: No MultiFormat Readers were able to detect the code.' && setScanError(result)
				}}
			/>
		</Container>

	)
}

export default OrderQRScan